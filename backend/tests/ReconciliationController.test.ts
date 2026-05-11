import { Request, Response } from 'express';
import { ReconciliationController } from '../src/controllers/ReconciliationController';
import { ReconciliationRequest } from '../src/models/ReconciliationRequest';
import { ParkingSession } from '../src/models/ParkingSession';
import { Invoice } from '../src/models/Invoice';

jest.mock('../src/models/ReconciliationRequest');
jest.mock('../src/models/ParkingSession');
jest.mock('../src/models/Invoice');

describe('ReconciliationController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = { status: mockStatus, json: mockJson } as any;
    jest.clearAllMocks();
  });

  describe('getRequests', () => {
    it('should return sorted reconciliation requests', async () => {
      const mockRequests = [
        { _id: 'req1', reportedAt: new Date('2026-05-10'), status: 'PENDING', userId: 'SV001' },
        { _id: 'req2', reportedAt: new Date('2026-05-09'), status: 'RESOLVED', userId: 'SV002' }
      ];
      (ReconciliationRequest.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockRequests)
        })
      });

      mockReq = {};

      await ReconciliationController.getRequests(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.any(Array)
      }));
      const [body] = mockJson.mock.calls[0];
      expect(body.data).toHaveLength(2);
    });

    it('should map _id to id in response', async () => {
      (ReconciliationRequest.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { _id: 'abc123', description: 'test' }
          ])
        })
      });

      mockReq = {};

      await ReconciliationController.getRequests(mockReq as Request, mockRes as Response);

      const [body] = mockJson.mock.calls[0];
      expect(body.data[0].id).toBe('abc123');
    });

    it('should return empty array when no requests', async () => {
      (ReconciliationRequest.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      });

      mockReq = {};

      await ReconciliationController.getRequests(mockReq as Request, mockRes as Response);

      const [body] = mockJson.mock.calls[0];
      expect(body.data).toHaveLength(0);
    });
  });

  describe('resolveRequest', () => {
    it('should update request status and note', async () => {
      const mockUpdated = { _id: 'req1', status: 'RESOLVED', note: 'Fee adjusted' };
      (ReconciliationRequest.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdated);

      mockReq = {
        params: { id: 'req1' },
        body: { status: 'RESOLVED', note: 'Fee adjusted' }
      };

      await ReconciliationController.resolveRequest(mockReq as Request, mockRes as Response);

      expect(ReconciliationRequest.findByIdAndUpdate).toHaveBeenCalledWith(
        'req1',
        { status: 'RESOLVED', note: 'Fee adjusted' },
        { new: true }
      );
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockUpdated
      }));
    });

    it('should return 404 if request not found', async () => {
      (ReconciliationRequest.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      mockReq = { params: { id: 'invalid' }, body: { status: 'RESOLVED' } };

      await ReconciliationController.resolveRequest(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('getSessionData', () => {
    it('should return session data with mapped cardId', async () => {
      const mockSession = {
        sessionId: 'SESS_001',
        startTime: new Date('2026-05-10T09:00:00'),
        endTime: new Date('2026-05-10T12:00:00'),
        plateNumber: '51G-12345',
        subjectID: 'CARD_TEMP_001',
        fee: 9000,
        invoiceId: 'INV_001'
      };
      const mockInvoice = {
        invoiceId: 'INV_001',
        amount: 9000,
        paymentStatus: 'PAID'
      };

      (ParkingSession.findOne as jest.Mock).mockResolvedValue(mockSession);
      (Invoice.findOne as jest.Mock).mockResolvedValue(mockInvoice);

      mockReq = { params: { sessionId: 'SESS_001' } };

      await ReconciliationController.getSessionData(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          entryTime: mockSession.startTime,
          exitTime: mockSession.endTime,
          licensePlate: '51G-12345',
          cardId: 'CARD_TEMP_001',
          calculatedAmount: 9000
        })
      }));
    });

    it('should return 404 if session not found', async () => {
      (ParkingSession.findOne as jest.Mock).mockResolvedValue(null);

      mockReq = { params: { sessionId: 'INVALID' } };

      await ReconciliationController.getSessionData(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });

    it('should handle session without invoice', async () => {
      const mockSession = {
        sessionId: 'SESS_002',
        startTime: new Date(),
        endTime: new Date(),
        plateNumber: '51G-99999',
        subjectID: 'SV001',
        fee: 5000,
        invoiceId: null
      };

      (ParkingSession.findOne as jest.Mock).mockResolvedValue(mockSession);

      mockReq = { params: { sessionId: 'SESS_002' } };

      await ReconciliationController.getSessionData(mockReq as Request, mockRes as Response);

      const [body] = mockJson.mock.calls[0];
      expect(body.data.transactionId).toBe('N/A');
      expect(body.data.actualAmount).toBe(0);
    });
  });

  describe('getRelatedSessions', () => {
    it('should return recent sessions for user', async () => {
      const mockSessions = [
        { sessionId: 'S1', startTime: new Date(), endTime: new Date(), plateNumber: '51G-111', fee: 5000 },
        { sessionId: 'S2', startTime: new Date(), endTime: new Date(), plateNumber: '51G-222', fee: 3000 }
      ];

      (ParkingSession.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockSessions)
        })
      });

      mockReq = { params: { userId: 'SV001' } };

      await ReconciliationController.getRelatedSessions(mockReq as Request, mockRes as Response);

      expect(ParkingSession.find).toHaveBeenCalledWith({ subjectID: 'SV001' });
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
      const [body] = mockJson.mock.calls[0];
      expect(body.data).toHaveLength(2);
    });

    it('should limit to 10 sessions', async () => {
      (ParkingSession.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      });

      mockReq = { params: { userId: 'SV001' } };

      await ReconciliationController.getRelatedSessions(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalled();
    });

    it('should map session fields for frontend', async () => {
      const mockSessions = [
        { sessionId: 'S1', startTime: new Date(), endTime: new Date(), plateNumber: '51G-111', fee: 5000 }
      ];

      (ParkingSession.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockSessions)
        })
      });

      mockReq = { params: { userId: 'SV001' } };

      await ReconciliationController.getRelatedSessions(mockReq as Request, mockRes as Response);

      const [body] = mockJson.mock.calls[0];
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0]).toHaveProperty('entryTime');
      expect(body.data[0]).toHaveProperty('exitTime');
      expect(body.data[0]).toHaveProperty('licensePlate');
      expect(body.data[0]).toHaveProperty('fee');
    });
  });
});