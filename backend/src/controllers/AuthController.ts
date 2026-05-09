import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const result = await AuthService.login(userId);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(401).json({ success: false, message: error.message });
      // can be improved by delegating to errorHandler?
    }
  }

  static async getProfile(req: Request, res: Response) {
    // req.user được gán từ authMiddleware
    return res.json({ success: true, data: (req as any).user });
  }
}
