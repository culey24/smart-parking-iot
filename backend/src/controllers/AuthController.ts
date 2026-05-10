import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import logger from '../utils/logger';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { schoolCardId, password } = req.body;

      if (!schoolCardId || !password) {
        return res.status(400).json({ success: false, message: 'schoolCardId and password are required' });
      }

      logger.debug({ schoolCardId }, 'Login attempt');
      const result = await AuthService.login(schoolCardId, password);
      logger.info({ userId: result.user.userId }, 'Login success');
      return res.json({ success: true, data: result });
    } catch (error: any) {
      logger.warn({ schoolCardId: req.body.schoolCardId, error: error.message }, 'Login failed');
      return res.status(401).json({ success: false, message: error.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    return res.json({ success: true, data: (req as any).user });
  }
}