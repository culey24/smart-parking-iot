import { Request, Response } from 'express';
import { ParkingSession } from '../models/ParkingSession';
import { Zone } from '../models/Zone'; // Bổ sung import Zone
import { v4 as uuidv4 } from 'uuid';

export class EntryExitController {
  
  // 1. Xử lý xe vào
  static async checkIn(req: Request, res: Response) {
    try {
      const { subjectID, plateNumber, type, zoneId } = req.body;
      
      // BỔ SUNG: Kiểm tra bãi đỗ xem còn chỗ không
      if (zoneId) {
        const zone = await Zone.findById(zoneId);
        if (!zone) {
          return res.status(404).json({ success: false, message: 'Zone not found' });
        }
        if (zone.currentUsage >= zone.capacity) {
          return res.status(400).json({ success: false, message: 'Zone is full' });
        }
        
        // Tăng số lượng xe trong bãi
        zone.currentUsage += 1;
        await zone.save();
      }

      const session = new ParkingSession({
        sessionId: uuidv4(), // Giữ nguyên cách dùng uuid của file cũ
        subjectID,
        plateNumber,
        type, // 'REGISTERED' or 'TEMPORARY'
        sessionStatus: 'ACTIVE'
      });

      await session.save();
      res.json({ success: true, data: session, message: 'Check-in successful' });
    } catch (error: any) {
      // SỬA LẠI: Ném lỗi cho Middleware Global xử lý theo đúng README
      throw error;
    }
  }

  // 2. Xử lý xe ra
  static async checkOut(req: Request, res: Response) {
    try {
      const { sessionId, zoneId } = req.body;
      // SỬA LẠI: Nên tìm session đang ACTIVE
      const session = await ParkingSession.findOne({ sessionId, sessionStatus: 'ACTIVE' });
      
      if (!session) {
        return res.status(404).json({ success: false, message: 'Active Session not found' });
      }

      session.endTime = new Date();
      session.sessionStatus = 'COMPLETED';
      
      // MOCK FEE: Should call BillingService here
      // Lưu ý: Đảm bảo trong Schema ParkingSession của bạn có định nghĩa trường 'fee', nếu không Mongoose sẽ không lưu
      session.set('fee', 5000); 

      await session.save();

      // BỔ SUNG: Giảm số lượng xe trong bãi khi xe ra
      if (zoneId) {
        const zone = await Zone.findById(zoneId);
        if (zone && zone.currentUsage > 0) {
          zone.currentUsage -= 1;
          await zone.save();
        }
      }

      res.json({ success: true, data: session, message: 'Check-out successful' });
    } catch (error: any) {
       // SỬA LẠI: Ném lỗi cho Middleware Global xử lý
      throw error;
    }
  }

  // 3. BỔ SUNG: Hàm mở/đóng cổng theo yêu cầu của README
  static async openGate(req: Request, res: Response) {
    try {
      const { gateId, action } = req.body; // action: 'OPEN' hoặc 'CLOSE'
      
      // Tại đây sẽ giao tiếp với phần cứng IoT, hiện tại trả về Mock response
      res.json({ 
        success: true, 
        data: { gateId, action }, 
        message: `Gate ${action} request processed` 
      });
    } catch (error: any) {
      throw error;
    }
  }
}