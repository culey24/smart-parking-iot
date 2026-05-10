import mongoose from 'mongoose';
import { TemporaryCard } from '../models/TemporaryCard';
import { ParkingSession } from '../models/ParkingSession';
import { CardController } from '../controllers/CardController';

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/smart-parking?authSource=admin';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await TemporaryCard.deleteMany({});
  await ParkingSession.deleteMany({});
});

describe('CardController — temp card lifecycle', () => {
  let mockReq: Partial<import('express').Request>;
  let mockRes: Partial<import('express').Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = { status: mockStatus, json: mockJson } as any;
  });

  describe('issueCard', () => {
    it('should issue an available card and create a session', async () => {
      // Seed a card
      await TemporaryCard.create({ cardId: 'CARD_TEMP_001' });

      mockReq = {
        body: { plateNumber: '29A-12345', vehicleType: 'CAR' },
      } as any;

      await CardController.issueCard(mockReq as any, mockRes as any);

      expect(mockStatus).not.toHaveBeenCalled();

      const [body] = mockJson.mock.calls[0];
      expect(body.success).toBe(true);
      expect(body.data.cardId).toBe('CARD_TEMP_001');
      expect(body.message).toBe('Thẻ tạm đã được cấp thành công');

      // Card should now be IN_USE
      const card = await TemporaryCard.findOne({ cardId: 'CARD_TEMP_001' });
      expect(card?.status).toBe('IN_USE');
      expect(card?.lastAssignedTo).toBe('29A-12345');
    });

    it('should return 400 if plateNumber or vehicleType missing', async () => {
      mockReq = { body: { plateNumber: '29A-12345' } } as any;
      await CardController.issueCard(mockReq as any, mockRes as any);

      expect(mockStatus).toHaveBeenCalledWith(400);
      const [body] = mockJson.mock.calls[0];
      expect(body.success).toBe(false);
    });

    it('should return 503 if no cards available', async () => {
      // No cards in DB
      mockReq = {
        body: { plateNumber: '29A-12345', vehicleType: 'CAR' },
      } as any;

      await CardController.issueCard(mockReq as any, mockRes as any);

      expect(mockStatus).toHaveBeenCalledWith(503);
      const [body] = mockJson.mock.calls[0];
      expect(body.message).toBe('Không còn thẻ tạm khả dụng');
    });
  });

  describe('returnCard', () => {
    it('should return card to pool and close session', async () => {
      const sessionId = `SESS_RET_${Date.now()}`;
      await TemporaryCard.create({
        cardId: 'CARD_TEMP_002',
        status: 'IN_USE',
        lastAssignedTo: '51G-99999',
      });
      await ParkingSession.create({
        sessionId,
        subjectId: 'CARD_TEMP_002',
        plateNumber: '51G-99999',
        sessionStatus: 'ACTIVE',
        type: 'TEMPORARY',
        vehicleType: 'CAR',
        paymentStatus: 'UNPAID',
        fee: 15000,
      });

      mockReq = { body: { cardId: 'CARD_TEMP_002' } } as any;

      await CardController.returnCard(mockReq as any, mockRes as any);

      expect(mockStatus).not.toHaveBeenCalled();
      const [body] = mockJson.mock.calls[0];
      expect(body.success).toBe(true);

      const card = await TemporaryCard.findOne({ cardId: 'CARD_TEMP_002' });
      expect(card?.status).toBe('AVAILABLE');
      expect(card?.lastAssignedTo).toBeUndefined();
    });

    it('should return 400 if card not found', async () => {
      mockReq = { body: { cardId: 'NONEXISTENT' } } as any;
      await CardController.returnCard(mockReq as any, mockRes as any);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });

    it('should return 400 if card already available', async () => {
      await TemporaryCard.create({ cardId: 'CARD_TEMP_003', status: 'AVAILABLE' });

      mockReq = { body: { cardId: 'CARD_TEMP_003' } } as any;
      await CardController.returnCard(mockReq as any, mockRes as any);

      expect(mockStatus).toHaveBeenCalledWith(400);
      const [body] = mockJson.mock.calls[0];
      expect(body.message).toBe('Thẻ chưa được sử dụng');
    });
  });

  describe('disableCard', () => {
    it('should mark card as LOST by cardId', async () => {
      await TemporaryCard.create({ cardId: 'CARD_TEMP_004', status: 'IN_USE' });

      mockReq = { params: { id: 'CARD_TEMP_004' } } as any;
      await CardController.disableCard(mockReq as any, mockRes as any);

      const card = await TemporaryCard.findOne({ cardId: 'CARD_TEMP_004' });
      expect(card?.status).toBe('LOST');
    });

    it('should resolve by plate number and mark linked card as LOST', async () => {
      // Create a session linked to a card
      const sessionId = `SESS_DIS_${Date.now()}`;
      await ParkingSession.create({
        sessionId,
        plateNumber: '29A-00000',
        subjectId: 'CARD_TEMP_005',
        sessionStatus: 'ACTIVE',
        type: 'TEMPORARY',
        vehicleType: 'CAR',
        paymentStatus: 'UNPAID',
      });
      await TemporaryCard.create({ cardId: 'CARD_TEMP_005', status: 'IN_USE' });

      mockReq = { params: { id: '29A-00000' } } as any;
      await CardController.disableCard(mockReq as any, mockRes as any);

      const card = await TemporaryCard.findOne({ cardId: 'CARD_TEMP_005' });
      expect(card?.status).toBe('LOST');
    });
  });
});