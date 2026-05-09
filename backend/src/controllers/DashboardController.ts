import { Request, Response } from 'express';
import { NavigationService } from '../services/NavigationService';

export class DashboardController {
  static async getZonesByUsage(req: Request, res: Response) {
    try {
      const zones = await NavigationService.getZonesByUsage();
      res.status(200).json({
        success: true,
        data: zones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
  }
}
