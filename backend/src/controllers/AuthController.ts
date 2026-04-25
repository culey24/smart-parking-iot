import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const result = await AuthService.login(userId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    // req.user được gán từ authMiddleware
    res.json({ success: true, data: (req as any).user });
  }
}
