import { Request, Response } from 'express';
import { ParkingSession } from '../models/ParkingSession';
import { TemporaryCard } from '../models/TemporaryCard';

export class CardController {

  // UC 1.6 — Tra cứu thông tin thẻ bằng biển số xe
  static async lookup(req: Request, res: Response) {
    try {
      const { plate } = req.query;
      if (!plate) {
        return res.status(400).json({ success: false, message: "Thiếu biển số xe" });
      }

      const session = await ParkingSession.findOne({
        plateNumber: (plate as string).toUpperCase(),
        sessionStatus: 'ACTIVE'
      });

      if (!session) {
        return res.json({
          success: false,
          data: null,
          message: "Không tìm thấy phiên gửi xe nào đang hoạt động cho biển số này"
        });
      }

      let cardStatus: 'Active' | 'Disabled' = 'Active';
      let lastFour = '0000';

      if (session.type === 'TEMPORARY') {
        const card = await TemporaryCard.findOne({ cardId: session.subjectId });
        if (card) {
          cardStatus = card.status === 'LOST' ? 'Disabled' : 'Active';
          lastFour = card.cardId.slice(-4);
        }
      } else {
        lastFour = session.subjectId.slice(-4);
      }

      const result = {
        vehicleType: session.vehicleType,
        licensePlate: session.plateNumber,
        session: {
          entryTime: session.startTime,
          platePhotoUrl: null
        },
        linkedCard: {
          lastFourDigits: lastFour,
          status: cardStatus
        }
      };

      res.json({ success: true, data: result, message: "Tra cứu thông tin thành công" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UC 1.5 — Cấp thẻ tạm cho xe chưa đăng ký
  static async issueCard(req: Request, res: Response) {
    try {
      const { plateNumber, vehicleType } = req.body;

      if (!plateNumber || !vehicleType) {
        return res.status(400).json({ success: false, message: 'plateNumber and vehicleType are required' });
      }

      // Tìm thẻ available đầu tiên
      const card = await TemporaryCard.findOne({ status: 'AVAILABLE' }).sort({ createdAt: 1 });

      if (!card) {
        return res.status(503).json({ success: false, message: 'Không còn thẻ tạm khả dụng' });
      }

      // Cập nhật trạng thái thẻ
      card.status = 'IN_USE';
      card.lastAssignedTo = plateNumber.toUpperCase();
      await card.save();

      // Tạo parking session
      const session = await ParkingSession.create({
        sessionId: `SESS_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type: 'TEMPORARY',
        vehicleType,
        subjectId: card.cardId,
        plateNumber: plateNumber.toUpperCase(),
        sessionStatus: 'ACTIVE',
        paymentStatus: 'UNPAID',
        fee: 0,
      });

      res.json({
        success: true,
        data: {
          cardId: card.cardId,
          sessionId: session.sessionId,
          plateNumber: session.plateNumber,
        },
        message: 'Thẻ tạm đã được cấp thành công',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UC 1.8 — Trả thẻ tạm (thanh toán xong)
  static async returnCard(req: Request, res: Response) {
    try {
      const { cardId } = req.body;

      if (!cardId) {
        return res.status(400).json({ success: false, message: 'cardId is required' });
      }

      // Tìm thẻ
      const card = await TemporaryCard.findOne({ cardId });
      if (!card) {
        return res.status(404).json({ success: false, message: 'Thẻ không tồn tại' });
      }

      if (card.status === 'AVAILABLE') {
        return res.status(400).json({ success: false, message: 'Thẻ chưa được sử dụng' });
      }

      // Tìm và đóng session
      const session = await ParkingSession.findOneAndUpdate(
        { subjectId: cardId, sessionStatus: 'ACTIVE' },
        {
          sessionStatus: 'COMPLETED',
          endTime: new Date(),
          paymentStatus: 'PAID',
        },
        { new: true }
      );

      // Trả thẻ về pool
      card.status = 'AVAILABLE';
      card.lastAssignedTo = undefined;
      await card.save();

      res.json({
        success: true,
        data: {
          cardId: card.cardId,
          sessionId: session?.sessionId,
          fee: session?.fee ?? 0,
        },
        message: 'Thẻ tạm đã được trả thành công',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UC 1.7 — Khóa thẻ khi bị mất
  static async disableCard(req: Request, res: Response) {
    try {
      const { id: plateOrCardId } = req.params;

      const session = await ParkingSession.findOne({
        plateNumber: (plateOrCardId as string).toUpperCase(),
        sessionStatus: 'ACTIVE'
      });

      const targetId = session ? session.subjectId : plateOrCardId;

      await TemporaryCard.updateOne(
        { cardId: targetId },
        { status: 'LOST' }
      );

      res.json({
        success: true,
        message: `Thẻ liên quan đã được vô hiệu hóa thành công`
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}