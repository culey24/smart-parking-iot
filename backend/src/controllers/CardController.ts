import { Request, Response } from 'express';
import { ParkingSession } from '../models/ParkingSession';
import { TemporaryCard } from '../models/TemporaryCard';
import { SensorDevice } from '../models/IoTDevice';
import { SystemLogService } from '../services/SystemLogService';
import { eventBus } from '../utils/eventBus';

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

      let currentCardStatus: 'Active' | 'Disabled' = 'Active';
      let lastFour = '0000';

      if (session.type === 'TEMPORARY') {
        const card = await TemporaryCard.findOne({ tempCardID: session.subjectID });
        if (card) {
          currentCardStatus = card.cardStatus === 'DEACTIVATED' ? 'Disabled' : 'Active';
          lastFour = card.tempCardID.slice(-4);
        }
      } else {
        lastFour = session.subjectID.slice(-4);
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
          status: currentCardStatus
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
      const card = await TemporaryCard.findOne({ cardStatus: 'ACTIVATING' }).sort({ createdAt: 1 });

      if (!card) {
        return res.status(503).json({ success: false, message: 'Không còn thẻ tạm khả dụng' });
      }

      // Find + atomically lock an available sensor (same pattern as checkIn)
      const occupiedDeviceIds = (await ParkingSession.find({ sessionStatus: 'ACTIVE', deviceId: { $ne: null } }).select('deviceId'))
        .map((s: any) => s.deviceId);
      const availableSensor = await SensorDevice.findOneAndUpdate(
        {
          status: 'ONLINE',
          deviceId: { $nin: occupiedDeviceIds },
        } as any,
        { $set: { status: 'OCCUPIED' } },
        { new: true, includeResultMetadata: false }
      );

      const sessionId = `SESS_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Tạo parking session
      const session = await ParkingSession.create({
        sessionId,
        type: 'TEMPORARY',
        vehicleType,
        subjectID: card.tempCardID,
        plateNumber: plateNumber.toUpperCase(),
        sessionStatus: 'ACTIVE',
        paymentStatus: 'UNPAID',
        fee: 0,
        userRole: 'VISITOR',
        deviceId: (availableSensor as any)?.deviceId || null,
      });

      await SystemLogService.log('INFO', 'CARD', `Visitor entry requested — checking temp card availability for ${plateNumber.toUpperCase()}`);
      await SystemLogService.log('SUCCESS', 'CARD', `Temp card ${card.tempCardID} assigned to ${plateNumber.toUpperCase()} (${vehicleType})`, { sessionId: session.sessionId });
      if (availableSensor) {
        await SystemLogService.log('SUCCESS', 'SESSION', `Visitor session ${session.sessionId} created — ${plateNumber.toUpperCase()} admitted, sensor: ${(availableSensor as any).deviceId}`, { sessionId: session.sessionId });
      } else {
        await SystemLogService.log('WARNING', 'SESSION', `Visitor session ${session.sessionId} created — ${plateNumber.toUpperCase()} admitted, NO SENSOR AVAILABLE`, { sessionId: session.sessionId });
      }
      await SystemLogService.log('INFO', 'GATE', `Barrier lifted — visitor ${plateNumber.toUpperCase()} entered facility`);

      // Broadcast SSE snapshot so monitoring UI updates immediately
      eventBus.emit('monitoring:snapshot');

      res.json({
        success: true,
        data: {
          tempCardID: card.tempCardID,
          sessionId: session.sessionId,
          plateNumber: session.plateNumber,
          deviceId: (availableSensor as any)?.deviceId || null,
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
      const { tempCardID } = req.body;

      if (!tempCardID) {
        return res.status(400).json({ success: false, message: 'tempCardID is required' });
      }

      // Tìm thẻ
      const card = await TemporaryCard.findOne({ tempCardID });
      if (!card) {
        return res.status(404).json({ success: false, message: 'Thẻ không tồn tại' });
      }

      // Tìm session trước khi đóng để lấy deviceId
      const activeSession = await ParkingSession.findOne({ subjectID: tempCardID, sessionStatus: 'ACTIVE' });

      // Reset sensor trước khi đóng session
      if (activeSession?.deviceId) {
        await SensorDevice.updateOne({ deviceId: activeSession.deviceId }, { $set: { status: 'ONLINE' } });
      }

      // Tìm và đóng session
      const session = await ParkingSession.findOneAndUpdate(
        { subjectID: tempCardID, sessionStatus: 'ACTIVE' },
        {
          sessionStatus: 'COMPLETED',
          endTime: new Date(),
          paymentStatus: 'PAID',
          deviceId: null,
        },
        { new: true }
      );

      await SystemLogService.log('SUCCESS', 'CARD', `Temp card ${card.tempCardID} returned. Fee: ${session?.fee ?? 0}đ`);

      // Broadcast SSE snapshot so monitoring UI updates immediately
      eventBus.emit('monitoring:snapshot');

      res.json({
        success: true,
        data: {
          tempCardID: card.tempCardID,
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

      const targetID = session ? session.subjectID : plateOrCardId;

      await TemporaryCard.updateOne(
        { tempCardID: targetID },
        { cardStatus: 'DEACTIVATED' }
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