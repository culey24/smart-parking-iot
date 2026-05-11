import { Request, Response } from 'express';
import { MonitoringController } from '../src/controllers/MonitoringController';
import { ParkingSlot } from '../src/models/ParkingSlot';
import { Location } from '../src/models/Location';
import { IoTDevice } from '../src/models/IoTDevice';
import { InfrastructureAlert } from '../src/models/InfrastructureAlert';

jest.mock('../src/models/ParkingSlot');
jest.mock('../src/models/Location');
jest.mock('../src/models/IoTDevice');
jest.mock('../src/models/InfrastructureAlert');

describe('MonitoringController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = { status: mockStatus, json: mockJson } as any;
    jest.clearAllMocks();
  });

  describe('getLive', () => {
    it('should return slots, devices, and alerts', async () => {
      const mockSlots = [
        { slotId: 'SLOT_001', isAvailable: true },
        { slotId: 'SLOT_002', isAvailable: false }
      ];
      const mockLocations = [
        { locationId: 'SLOT_001', coordinates: [0, 0] },
        { locationId: 'SLOT_002', coordinates: [1, 1] }
      ];
      const mockDevices = [
        { deviceId: 'SENSOR_01', deviceType: 'SENSOR', status: 'ONLINE', locationId: 'LOC_01', deviceName: 'Entry Sensor', updatedAt: new Date() },
        { deviceId: 'GATE_01', deviceType: 'GATE', status: 'ONLINE', locationId: 'LOC_02', deviceName: 'Entry Gate', updatedAt: new Date() }
      ];
      const mockAlerts = [
        { _id: 'alert1', deviceId: 'SENSOR_01', alertType: 'ERROR', message: 'High temp', timestamp: new Date() }
      ];

      (ParkingSlot.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockSlots) });
      (Location.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockLocations) });
      (IoTDevice.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockDevices) });
      (InfrastructureAlert.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockAlerts) });

      mockReq = {};

      await MonitoringController.getLive(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
      const [body] = mockJson.mock.calls[0];
      expect(body.data.slots).toHaveLength(2);
      expect(body.data.devices).toHaveLength(2);
      expect(body.data.alerts).toHaveLength(1);
    });

    it('should map slot status correctly', async () => {
      (ParkingSlot.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([
        { slotId: 'SLOT_001', isAvailable: true },
        { slotId: 'SLOT_002', isAvailable: false }
      ]) });
      (Location.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (IoTDevice.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (InfrastructureAlert.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      mockReq = {};

      await MonitoringController.getLive(mockReq as Request, mockRes as Response);

      const [body] = mockJson.mock.calls[0];
      expect(body.data.slots[0].status).toBe('empty');
      expect(body.data.slots[1].status).toBe('occupied');
    });

    it('should map device types to lowercase', async () => {
      (ParkingSlot.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (Location.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (IoTDevice.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([
        { deviceId: 'D1', deviceType: 'SENSOR', status: 'ONLINE', deviceName: 'D1' }
      ]) });
      (InfrastructureAlert.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      mockReq = {};

      await MonitoringController.getLive(mockReq as Request, mockRes as Response);

      const [body] = mockJson.mock.calls[0];
      expect(body.data.devices[0].type).toBe('sensor');
      expect(body.data.devices[0].status).toBe('online');
    });

    it('should map alert severity based on alertType', async () => {
      (ParkingSlot.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (Location.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (IoTDevice.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([
        { deviceId: 'S1', deviceType: 'SENSOR', status: 'ONLINE', deviceName: 'S1' }
      ]) });
      (InfrastructureAlert.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([
        { _id: 'a1', deviceId: 'S1', alertType: 'ERROR', message: 'm', timestamp: new Date() },
        { _id: 'a2', deviceId: 'S1', alertType: 'OFFLINE', message: 'm', timestamp: new Date() }
      ]) });

      mockReq = {};

      await MonitoringController.getLive(mockReq as Request, mockRes as Response);

      const [body] = mockJson.mock.calls[0];
      expect(body.data.alerts[0].severity).toBe('error');
      expect(body.data.alerts[1].severity).toBe('critical');
    });

    it('should use default coordinates when location not found', async () => {
      (ParkingSlot.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([
        { slotId: 'SLOT_001', isAvailable: true }
      ]) });
      (Location.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (IoTDevice.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (InfrastructureAlert.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      mockReq = {};

      await MonitoringController.getLive(mockReq as Request, mockRes as Response);

      const [body] = mockJson.mock.calls[0];
      expect(body.data.slots[0].row).toBe(0);
      expect(body.data.slots[0].col).toBe(0);
    });

    it('should return 500 on error', async () => {
      (ParkingSlot.find as jest.Mock).mockImplementation(() => { throw new Error('DB Error') });

      mockReq = {};

      await MonitoringController.getLive(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'DB Error'
      }));
    });
  });
});