import { Request, Response } from 'express';
import { NavigationService } from '../services/NavigationService';

export class DashboardController {
  static async getZonesByUsage(req: Request, res: Response) {
    try {
      const zones = await NavigationService.getZonesByUsage();
      res.json({ success: true, data: zones });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: String(error) });
    }
    }
  }

  static async getLeastUsedZone(req: Request, res: Response) {
    try {
      const zone = await NavigationService.getLeastUsedZone();
      res.json({ success: true, data: zone });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: String(error) });
    }
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const summary = await NavigationService.getStats();
      res.json({ success: true, data: summary });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: String(error) });
      }
    }
  }

  static async getLiveMonitoring(req: Request, res: Response) {
    try {
      await NavigationService.streamLiveMonitoring(req, res);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: String(error) });
      }
    }
  }

  static async getLiveMonitoringSimple(req: Request, res: Response) {
    try {
      const zones = await NavigationService.getLiveMonitoringSimple();
      res.json({ success: true, data: zones });
    } catch (error) {
        if (error instanceof Error) {
          res.status(500).json({ success: false, message: error.message });
        } else {
          res.status(500).json({ success: false, message: String(error) });
        }
    }
  }
}
