import { Request, Response } from 'express';
import { SessionController } from '../controllers/SessionController';
import { ParkingSession } from '../models/ParkingSession';

jest.mock('../models/ParkingSession');

describe('SessionController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = { query: {}, params: {} };
    mockRes = { status: mockStatus, json: mockJson } as any;
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return { success: true, data: sessions }', async () => {
      const sessions = [{ _id: '1', licensePlate: 'ABC-123' }];
      (ParkingSession.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(sessions),
      });

      await SessionController.getAll(mockReq as Request, mockRes as Response);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: sessions });
    });
  });

  describe('getByUser', () => {
    it('should return { success: true, data: sessions } filtered by userId', async () => {
      mockReq.params = { userId: 'user123' };
      const sessions = [{ _id: '2', subjectID: 'user123' }];
      (ParkingSession.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(sessions),
      });

      await SessionController.getByUser(mockReq as Request, mockRes as Response);

      expect(ParkingSession.find).toHaveBeenCalledWith({ subjectID: 'user123' });
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: sessions });
    });
  });

  describe('getRecent', () => {
    it('should return { success: true, data: sessions } with default limit 10', async () => {
      const sessions = [{ _id: '3' }];
      const mockSort = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(sessions),
      });
      (ParkingSession.find as jest.Mock).mockReturnValue({ sort: mockSort });

      await SessionController.getRecent(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({ success: true, data: sessions });
    });

    it('should respect limit from query param', async () => {
      mockReq.query = { limit: '5' };
      const sessions: any[] = [];
      const mockSort = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(sessions),
      });
      (ParkingSession.find as jest.Mock).mockReturnValue({ sort: mockSort });

      await SessionController.getRecent(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({ success: true, data: sessions });
    });
  });
});