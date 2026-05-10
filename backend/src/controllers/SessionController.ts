import { Request, Response } from 'express';
import { ParkingSession } from '../models/ParkingSession';

export class SessionController {
  static async getAll(req: Request, res: Response) {
    try {
      const sessions = await ParkingSession.find().sort({ createdAt: -1 });
      res.json({ success: true, data: sessions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const sessions = await ParkingSession.find({ subjectID: userId }).sort({ createdAt: -1 });

      res.json({ success: true, data: sessions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRecent(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const sessions = await ParkingSession.find().sort({ createdAt: -1 }).limit(limit);
      res.json({ success: true, data: sessions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
