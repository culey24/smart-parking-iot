import request from 'supertest';
import express from 'express';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { PaymentController } from '../src/controllers/PaymentController';
import { ParkingSession } from '../src/models/ParkingSession';
import { BillingService } from '../src/services/BillingService';

jest.mock('../src/models/ParkingSession');
jest.mock('../src/services/BillingService');

const app = express();
app.use(express.json());

app.get('/api/payment/debt', PaymentController.getDebt);
app.get('/api/payment/history', (req, res, next) => {
  // Mock req.user for testing purposes
  (req as any).user = { userId: req.query.userId || 'SV001' };
  next();
}, PaymentController.getHistory);
app.get('/api/payment/history/admin', PaymentController.getHistoryAdmin);
app.post('/api/payment/cycle', PaymentController.initiateCyclePayment);

describe('PaymentController (Supertest)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/payment/debt', () => {
    it('Should return 400 error if subjectId is missing', async () => {
      // User supertest calling GET API directly (without passing query)
      const res = await request(app).get('/api/payment/debt');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Missing query subjectId');
    });

    it('Should return the correct total debt of the User', async () => {
      // Simulate Database finding 2 unpaid sessions
      (ParkingSession.find as any).mockResolvedValue([
        { subjectId: 'SV001', fee: 2000 },
        { subjectId: 'SV001', fee: 3000 }
      ]);

      // Use supertest to call the API with query parameters
      const res = await request(app).get('/api/payment/debt?subjectId=SV001');

      expect(ParkingSession.find).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: {
          subjectId: 'SV001',
          totalDebt: 5000,
          unpaidCount: 2
        }
      });
    });
  });

  describe('GET /api/payment/history', () => {
    it("Should return the User's parking history using the default number of days (30)", async () => {
      const mockHistory = [
        { sessionId: 'S1', subjectId: 'SV001', createdAt: new Date() }
      ];
      (ParkingSession.find as any).mockReturnValue({
        sort: jest.fn().mockReturnValue(Promise.resolve(mockHistory))
      });

      const res = await request(app).get('/api/payment/history?userId=SV001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(JSON.parse(JSON.stringify(mockHistory)));

      // Verify find was called with correct filter (subjectId and createdAt limit)
      expect(ParkingSession.find).toHaveBeenCalledWith(
        expect.objectContaining({
          subjectId: 'SV001',
          createdAt: expect.any(Object) // Contains $gte
        })
      );
    });

    it('Should correctly apply the number of days from the HISTORY_VIEW_DAYS_LIMIT environment variable', async () => {
      process.env.HISTORY_VIEW_DAYS_LIMIT = '15';

      const mockHistory = [
        { sessionId: 'S2', subjectId: 'SV001', createdAt: new Date() }
      ];
      const sortMock = jest.fn().mockReturnValue(Promise.resolve(mockHistory));
      (ParkingSession.find as any).mockReturnValue({ sort: sortMock });

      await request(app).get('/api/payment/history?userId=SV001');

      // The $gte date should be approx 15 days ago
      const findCallArgs = (ParkingSession.find as any).mock.calls[0][0];
      expect(findCallArgs.createdAt.$gte).toBeInstanceOf(Date);

      const cutoffDate = findCallArgs.createdAt.$gte;
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 15);

      // Allow minor differences in ms
      expect(Math.abs(cutoffDate.getTime() - expectedDate.getTime())).toBeLessThan(1000);

      delete process.env.HISTORY_VIEW_DAYS_LIMIT; // Clean up
    });

    it('Should return 500 error if DB throws an error', async () => {
      (ParkingSession.find as any).mockImplementation(() => {
        throw new Error('Database Error');
      });

      const res = await request(app).get('/api/payment/history?userId=SV001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Lỗi server'); // Hardcoded in the catch block of PaymentController
    });
  });

  describe('GET /api/payment/history/admin', () => {
    it('Should return all history data (test with 76 logs)', async () => {
      // Generate 76 mock rows
      const mockLargeHistory = Array.from({ length: 76 }, (_, i) => ({
        sessionId: `S${i}`,
        subjectId: i % 2 === 0 ? 'SV001' : 'SV002',
        createdAt: new Date()
      }));

      const sortMock = jest.fn().mockReturnValue(Promise.resolve(mockLargeHistory));
      (ParkingSession.find as any).mockReturnValue({ sort: sortMock });

      const res = await request(app).get('/api/payment/history/admin?startDate=2026-01-01&endDate=2026-01-31');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(76); // Verify it returns all 76 rows

      const findCallArgs = (ParkingSession.find as any).mock.calls[0][0];
      expect(findCallArgs.createdAt.$gte).toBeDefined();
      expect(findCallArgs.createdAt.$lte).toBeDefined();
      expect(findCallArgs.subjectId).toBeUndefined(); // No subjectId was passed
    });

    it('Should apply subjectId to the query if provided', async () => {
      const sortMock = jest.fn().mockReturnValue(Promise.resolve([]));
      (ParkingSession.find as any).mockReturnValue({ sort: sortMock });

      const res = await request(app).get('/api/payment/history/admin?startDate=2026-01-01&endDate=2026-01-31&subjectId=SV001');

      expect(res.status).toBe(200);
      const findCallArgs = (ParkingSession.find as any).mock.calls[0][0];
      expect(findCallArgs.subjectId).toBe('SV001'); // Ensure it queried with the correct subjectId
    });

    it('Should return 400 if startDate or endDate is missing', async () => {
      const res = await request(app).get('/api/payment/history/admin?startDate=2026-01-01');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/payment/cycle', () => {
    it('Should successfully initiate payment and return a mock link', async () => {
      const payload = {
        subjectId: 'SV001',
        startDate: '2026-04-01',
        endDate: '2026-04-30'
      };

      const mockSession1 = { fee: 2000, save: jest.fn() };
      const mockSession2 = { fee: 3000, save: jest.fn() };
      (ParkingSession.find as jest.Mock<any>).mockResolvedValue([mockSession1, mockSession2]);
      (BillingService.calculateCycleFee as jest.Mock<any>).mockReturnValue(5000);

      // Supertest gọi API POST và gửi kèm payload vào body
      const res = await request(app).post('/api/payment/cycle').send(payload);

      expect(mockSession1.save).toHaveBeenCalled();
      expect(mockSession2.save).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAmount).toBe(5000);
      expect(res.body.data.status).toBe('PENDING');
    });

    it('Should return a message if there are no sessions that require payment', async () => {
      const payload = {
        subjectId: 'SV001',
        startDate: '2026-04-01',
        endDate: '2026-04-30'
      };

      (ParkingSession.find as jest.Mock<any>).mockResolvedValue([]);

      const res = await request(app).post('/api/payment/cycle').send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('No fees need to be paid in this cycle');
    });

    it('Should smoothly handle initiating payment for 50 parking sessions', async () => {
      const payload = {
        subjectId: 'SV_VIP_001',
        startDate: '2026-04-01',
        endDate: '2026-04-30'
      };

      let expectedTotalAmount = 0;

      const mockBulkSessions = Array.from({ length: 50 }, (_, i) => {
        const fee = Math.random() > 0.5 ? 3000 : 2000;
        expectedTotalAmount += fee;

        return {
          sessionId: `SESSION_${i}`,
          subjectId: 'SV_VIP_001',
          fee: fee,
          paymentStatus: 'UNPAID',
          save: jest.fn()
        } as any;
      });

      (ParkingSession.find as jest.Mock<any>).mockResolvedValue(mockBulkSessions);
      (BillingService.calculateCycleFee as jest.Mock<any>).mockReturnValue(expectedTotalAmount);

      const res = await request(app).post('/api/payment/cycle').send(payload);

      console.warn(`\n💳 User: ${payload.subjectId} | Số lượt: 50 | Output API: ${res.body.data.totalAmount}đ | Kỳ vọng: ${expectedTotalAmount}đ`);

      mockBulkSessions.forEach(session => {
        expect(session.save).toHaveBeenCalled();
        expect(session.paymentStatus).toBe('PENDING');
        expect(session.invoiceId).toContain('BKPAY_CYCLE_');
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Created payment request for 50 parking sessions in the cycle');
      expect(res.body.data.totalAmount).toBe(expectedTotalAmount);
    });
  });
});