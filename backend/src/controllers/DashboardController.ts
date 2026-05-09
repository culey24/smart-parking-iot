import { Request, Response } from 'express';
import { NavigationService } from '../services/NavigationService';
import { IoTDevice } from '../models/IoTDevice';
import { InfrastructureAlert } from '../models/InfrastructureAlert';

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

  static async getStats(req: Request, res: Response) {
    try {
      const totalDevices = await IoTDevice.countDocuments();
      const devicesOnline = await IoTDevice.countDocuments({ status: 'ONLINE' });
      const unresolvedErrors = await InfrastructureAlert.countDocuments({ status: 'ACTIVE' });
      
      // Calculate a simple sync rate based on online devices
      const syncRate = totalDevices > 0 ? (devicesOnline / totalDevices) * 100 : 100;

      res.status(200).json({
        devicesOnline,
        totalDevices,
        unresolvedErrors,
        syncRate: parseFloat(syncRate.toFixed(1))
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
