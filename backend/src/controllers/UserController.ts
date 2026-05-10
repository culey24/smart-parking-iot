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

      // Map to frontend UserProfileRecord structure
      const profile = {
        mssvMscb: user.schoolCardId?.toString() || user.userId,
        fullName: user.fullName,
        email: user.email,
        faculty: 'Information Technology', // Data from HCMUT_DATACORE
        country: 'Vietnam',
        province: 'Ho Chi Minh City',
        timezone: 'Asia/Ho_Chi_Minh (GMT+7)',
        registeredVehicleType: 'Motorbike'
      };

      res.json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
