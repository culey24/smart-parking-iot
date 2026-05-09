import { Request, Response } from 'express';
import { ParkingSlot } from '../models/ParkingSlot';
import { Location } from '../models/Location';
import { IoTDevice } from '../models/IoTDevice';
import { InfrastructureAlert } from '../models/InfrastructureAlert';

export class MonitoringController {
  static async getLive(req: Request, res: Response) {
    try {
      // 1. Fetch slots and map with locations
      const slots = await ParkingSlot.find().lean();
      const locations = await Location.find({ locationType: 'SLOT' }).lean();
      
      const mappedSlots = slots.map((slot: any) => {
        const loc = locations.find((l: any) => l.locationId === slot.slotId);
        return {
          id: slot.slotId,
          row: loc && loc.coordinates && loc.coordinates.length >= 1 ? loc.coordinates[0] : 0,
          col: loc && loc.coordinates && loc.coordinates.length >= 2 ? loc.coordinates[1] : 0,
          status: slot.isAvailable ? 'empty' : 'occupied',
          deviceStatus: 'online' // Assume online unless tied to a specific offline sensor
        };
      });

      // 2. Fetch devices
      const devices = await IoTDevice.find().lean();
      const allLocations = await Location.find().lean();
      
      const mappedDevices = devices.map((d: any) => {
        const loc = allLocations.find((l: any) => l.locationId === d.locationId);
        return {
          id: d.deviceId,
          type: d.deviceType.toLowerCase(),
          label: d.deviceName || d.deviceId,
          row: loc && loc.coordinates && loc.coordinates.length >= 1 ? loc.coordinates[0] : 0,
          col: loc && loc.coordinates && loc.coordinates.length >= 2 ? loc.coordinates[1] : 0,
          status: d.status.toLowerCase()
        };
      });

      // 3. Fetch alerts
      const alerts = await InfrastructureAlert.find({ status: 'ACTIVE' }).lean();
      const mappedAlerts = await Promise.all(alerts.map(async (a: any) => {
        const device = devices.find((d: any) => d.deviceId === a.deviceId);
        return {
          id: a._id.toString(),
          deviceId: a.deviceId,
          deviceType: device ? device.deviceType.toLowerCase() : 'sensor',
          message: a.message,
          severity: a.alertType.toLowerCase() === 'error' ? 'error' : (a.alertType.toLowerCase() === 'offline' ? 'critical' : 'warning'),
          timestamp: a.timestamp
        };
      }));

      const liveData = {
        slots: mappedSlots,
        devices: mappedDevices,
        alerts: mappedAlerts
      };
      
      res.json(liveData);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
