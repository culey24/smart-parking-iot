import { Request, Response, NextFunction } from 'express';
import { ParkingZone } from '../models/Zone';
import { InfrastructureAlert } from '../models/InfrastructureAlert';
import { IoTDevice } from '../models/IoTDevice';

export const IoTDataController = {
  webhook: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { zoneId, status } = req.body;
      
      if (!zoneId || !status) {
        res.status(400).json({ message: 'zoneId and status are required' });
        return;
      }

      const increment = status === 'ENTRY' ? 1 : status === 'EXIT' ? -1 : 0;
      
      if (increment !== 0) {
        await ParkingZone.updateOne({ zoneId }, { $inc: { currentUsage: increment } });
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      next(error);
    }
  },

  createAlert: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { deviceId, alertType, message } = req.body;

      if (!deviceId || !alertType || !message) {
        res.status(400).json({ message: 'deviceId, alertType, and message are required' });
        return;
      }

      const alert = await InfrastructureAlert.create({
        deviceId,
        alertType,
        message: message || "Lỗi thiết bị"
      });

      res.status(201).json({ message: 'Alert created', data: alert });
    } catch (error) {
      next(error);
    }
  },

  getDevices: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const devices = await IoTDevice.find().lean();
      
      // Map to frontend expected format
      const mappedDevices = devices.map((d: any) => ({
        id: d.deviceId,
        name: d.deviceName || d.deviceId,
        type: d.deviceType.toLowerCase(),
        status: d.status.toLowerCase(),
        zone: d.zoneId,
        lastActive: d.lastOnline || d.updatedAt
      }));
      
      res.json({ success: true, data: mappedDevices });
    } catch (error) {
      next(error);
    }
  },

  getAlerts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fetch active alerts and join with IoTDevice to get device type
      const alerts = await InfrastructureAlert.find({ status: 'ACTIVE' }).lean();
      
      const mappedAlerts = await Promise.all(alerts.map(async (a: any) => {
        const device = await IoTDevice.findOne({ deviceId: a.deviceId }).lean();
        return {
          id: a._id.toString(),
          deviceId: a.deviceId,
          deviceType: device ? device.deviceType.toLowerCase() : 'sensor',
          message: a.message,
          severity: a.alertType.toLowerCase() === 'error' ? 'error' : (a.alertType.toLowerCase() === 'offline' ? 'critical' : 'warning'),
          timestamp: a.timestamp,
          status: 'pending' // Maps ACTIVE to pending
        };
      }));
      
      res.json({ success: true, data: mappedAlerts });
    } catch (error) {
      next(error);
    }
  },

  updateAlertStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Map frontend 'resolved' to backend 'RESOLVED', 'pending' to 'ACTIVE'
      const dbStatus = status === 'resolved' ? 'RESOLVED' : 'ACTIVE';
      
      const alert = await InfrastructureAlert.findByIdAndUpdate(id, { status: dbStatus }, { new: true });
      if (!alert) {
        res.status(404).json({ success: false, message: 'Alert not found' });
        return;
      }
      
      res.json({ success: true, message: `Alert status updated`, data: alert });
    } catch (error) {
      next(error);
    }
  }
};
