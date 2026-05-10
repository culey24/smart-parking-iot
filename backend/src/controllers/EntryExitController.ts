import { Request, Response } from 'express';
import { ParkingSession } from '../models/ParkingSession';
import { ParkingZone } from '../models/Zone';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { BillingService } from '../services/BillingService';
import { SystemLogService } from '../services/SystemLogService';
import { eventBus } from '../utils/eventBus';

export class EntryExitController {
  
  // 1. Xử lý xe vào
  static async checkIn(req: Request, res: Response) {
    try {
      const { subjectID, plateNumber, type, vehicleType, zoneId } = req.body;
      
      // BỔ SUNG: Kiểm tra bãi đỗ xem còn chỗ không
      if (zoneId) {
        const zone = await ParkingZone.findOne({ zoneId });
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

      // Determine user role
      let userRole = 'VISITOR';
      let userName = 'Unknown';
      if (type === 'REGISTERED' && subjectID) {
        await SystemLogService.log('INFO', 'AUTH', `HCMUT_SSO authentication requested for subject ${subjectID}`);
        const user = await User.findOne({ userId: subjectID });
        if (user) {
          userRole = user.role;
          userName = (user as any).name || subjectID;
          await SystemLogService.log('SUCCESS', 'HCMUT_SSO', `SSO verified — ${userName} [${user.role}] • schoolCardId: ${(user as any).schoolCardId || subjectID}`);
        } else {
          await SystemLogService.log('WARNING', 'HCMUT_SSO', `SSO lookup: no user record found for ${subjectID}, defaulting to VISITOR`);
        }
      }

      const sessionId = uuidv4();
      await SystemLogService.log('INFO', 'SESSION', `Creating parking session for ${plateNumber.toUpperCase()} • ${vehicleType} • Role: ${userRole}`);

      const session = new ParkingSession({
        sessionId,
        subjectID,
        plateNumber: plateNumber.toUpperCase(),
        type,
        userRole,
        vehicleType,
        sessionStatus: 'ACTIVE'
      });

      await session.save();
      await SystemLogService.log('SUCCESS', 'SESSION', `Session ${sessionId} started — ${plateNumber.toUpperCase()} entered at ${new Date().toLocaleTimeString('en-GB')}`, { sessionId });
      await SystemLogService.log('INFO', 'GATE', `Barrier lifted — vehicle ${plateNumber.toUpperCase()} admitted into facility`);
      eventBus.emit('monitoring:snapshot');

      res.json({ success: true, data: session, message: 'Check-in successful' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 2. Xử lý xe ra
  static async checkOut(req: Request, res: Response) {
    try {
      const { sessionId, zoneId } = req.body;
      const session = await ParkingSession.findOne({ sessionId, sessionStatus: 'ACTIVE' });
      
      if (!session) {
        return res.status(404).json({ success: false, message: 'Active Session not found' });
      }

      // Set end time and status first
      session.endTime = new Date();
      session.sessionStatus = 'COMPLETED';

      // Calculate fee
      let fee = 5000;
      if (session.vehicleType && session.startTime) {
        fee = await BillingService.calculateFee(
          session.startTime,
          session.endTime,
          session.vehicleType,
          session.userRole
        );
      }
      session.set('fee', fee);

      const durationMin = Math.round((session.endTime!.getTime() - session.startTime!.getTime()) / 60000);
      await SystemLogService.log('INFO', 'SESSION', `Session ${sessionId} closed — ${session.plateNumber} • Duration: ${durationMin} min`);
      await SystemLogService.log('INFO', 'BILLING', `Fee calculated: ${fee.toLocaleString()}đ • Vehicle: ${session.vehicleType} • Role: ${session.userRole}`);

      if (session.type === 'TEMPORARY') {
        session.set('paymentStatus', 'PAID');
        await SystemLogService.log('SUCCESS', 'BILLING', `Visitor payment collected — ${fee.toLocaleString()}đ via temp card ${session.subjectID}`);
      } else {
        session.set('paymentStatus', 'PAID');
        await SystemLogService.log('SUCCESS', 'BILLING', `Session billing finalized for ${session.subjectID} — ${fee.toLocaleString()}đ stored to billing record`);
        await SystemLogService.log('INFO', 'DB', `Invoice record persisted • Session: ${sessionId} • Amount: ${fee.toLocaleString()}đ`);
      }

      await session.save();

      if (zoneId) {
        const zone = await ParkingZone.findOne({ zoneId });
        if (zone && zone.currentUsage > 0) { zone.currentUsage -= 1; await zone.save(); }
      }

      await SystemLogService.log('INFO', 'GATE', `Exit barrier lifted — ${session.plateNumber} departed at ${session.endTime!.toLocaleTimeString('en-GB')}`, { sessionId });
      eventBus.emit('monitoring:snapshot');

      res.json({ success: true, data: session, message: 'Check-out successful' });
    } catch (error: any) {
       res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3. Hàm mở/đóng cổng
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
      res.status(500).json({ success: false, message: error.message });
    }
  }
}