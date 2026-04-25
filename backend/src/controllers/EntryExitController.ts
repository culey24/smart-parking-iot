import { Request, Response } from 'express';
import { ParkingSession } from '../models/ParkingSession';
import { v4 as uuidv4 } from 'uuid';

export class EntryExitController {
  static async checkIn(req: Request, res: Response) {
    try {
      const { subjectID, plateNumber, type } = req.body;
      
      const session = new ParkingSession({
        sessionId: uuidv4(),
        subjectID,
        plateNumber,
        type, // 'REGISTERED' or 'TEMPORARY'
        sessionStatus: 'ACTIVE'
      });

      await session.save();
      res.json({ success: true, data: session, message: 'Check-in successful' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async checkOut(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;
      const session = await ParkingSession.findOne({ sessionId });
      
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      session.endTime = new Date();
      session.sessionStatus = 'COMPLETED';
      // MOCK FEE: Should call BillingService here
      session.fee = 5000; 

      await session.save();
      res.json({ success: true, data: session, message: 'Check-out successful' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
