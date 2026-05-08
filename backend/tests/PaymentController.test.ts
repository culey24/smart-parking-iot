import request from 'supertest';
import express from 'express';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { PaymentController } from '../src/controllers/PaymentController';
import { ParkingSession } from '../src/models/ParkingSession';
import { BillingService } from '../src/services/BillingService';

// Giả lập các Model và Service
jest.mock('../src/models/ParkingSession');
jest.mock('../src/services/BillingService');

// 1. Khởi tạo một mini Express App ảo dùng riêng cho việc test
const app = express();
app.use(express.json()); // Bắt buộc để đọc được req.body

// 2. Gắn các API Routes vào Controller của bạn
app.get('/api/payment/debt', PaymentController.getDebt);
app.post('/api/payment/cycle', PaymentController.initiateCyclePayment);

describe('PaymentController (Supertest)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/payment/debt', () => {
    it('Nên trả về lỗi 400 nếu thiếu subjectId', async () => {
      // Dùng supertest gọi thẳng API GET (không truyền query)
      const res = await request(app).get('/api/payment/debt');
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Missing query subjectId');
    });

    it('Nên trả về đúng tổng nợ của User', async () => {
      // Giả lập Database tìm thấy 2 phiên chưa thanh toán
      (ParkingSession.find as jest.Mock<any>).mockResolvedValue([
        { subjectId: 'SV001', fee: 2000 },
        { subjectId: 'SV001', fee: 3000 }
      ]);

      // Dùng supertest gọi API có kèm query
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

  describe('POST /api/payment/cycle', () => {
    it('Nên khởi tạo thanh toán thành công và trả về link mock', async () => {
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

    it('Nên trả về thông báo nếu không có phiên nào cần thanh toán', async () => {
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

    it('Nên xử lý mượt mà việc khởi tạo thanh toán cho 50 lượt đỗ xe', async () => {
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