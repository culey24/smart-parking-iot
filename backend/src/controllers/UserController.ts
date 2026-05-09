import { Request, Response } from 'express';
import { User } from '../models/User';

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json(user); // Frontend expects the user object directly, not wrapped in data
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
