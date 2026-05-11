import { Request, Response } from 'express';
import { eventBus } from '../utils/eventBus';
import { ParkingSlot } from '../models/ParkingSlot';
import { Location } from '../models/Location';
import { IoTDevice } from '../models/IoTDevice';
import { InfrastructureAlert } from '../models/InfrastructureAlert';
import { ParkingSession } from '../models/ParkingSession';
import { SystemLogService } from '../services/SystemLogService';

/** Registered SSE clients */
const clients = new Set<Response>();

/** Build a fresh MonitoringData snapshot driven by active ParkingSessions */
async function buildSnapshot() {
  const [slots, locations, devices, allLocations, alerts, activeSessions] = await Promise.all([
    ParkingSlot.find().lean(),
    Location.find({ locationType: 'SLOT' }).lean(),
    IoTDevice.find().lean(),
    Location.find().lean(),
    InfrastructureAlert.find({ status: 'ACTIVE' }).lean(),
    ParkingSession.find({ sessionStatus: 'ACTIVE' }).lean(),
  ]);

  // Collect all deviceIds currently occupied by active sessions
  const occupiedDeviceIds = new Set(
    activeSessions.filter((s: any) => s.deviceId).map((s: any) => s.deviceId)
  );

  // Map ParkingSlots — a slot is occupied if its slotId matches an active session deviceId
  const mappedSlots = slots.map((slot: any) => {
    const loc = locations.find((l: any) => l.locationId === slot.slotId);
    const isOccupied = !slot.isAvailable || occupiedDeviceIds.has(slot.slotId);
    return {
      id: slot.slotId,
      row: loc?.coordinates?.[0] ?? 0,
      col: loc?.coordinates?.[1] ?? 0,
      status: isOccupied ? 'occupied' : 'empty',
      deviceStatus: 'online',
    };
  });

  // Map IoT devices — a sensor is 'occupied' if its deviceId is in active sessions
  const mappedDevices = devices.map((d: any) => {
    const loc = allLocations.find((l: any) => l.locationId === d.locationId);
    const isOccupied = d.deviceType === 'SENSOR' && occupiedDeviceIds.has(d.deviceId);
    const isError = d.status === 'ERROR' || d.status === 'OFFLINE';
    return {
      id: d.deviceId,
      type: d.deviceType.toLowerCase(),
      label: d.deviceName || d.deviceId,
      row: loc?.coordinates?.[0] ?? 0,
      col: loc?.coordinates?.[1] ?? 0,
      status: isError ? 'error' : isOccupied ? 'occupied' : d.status.toLowerCase(),
    };
  });

  const mappedAlerts = (alerts as any[]).map((a: any) => {
    const dev = (devices as any[]).find((d: any) => d.deviceId === a.deviceId);
    return {
      id: a._id.toString(),
      deviceId: a.deviceId,
      deviceType: dev ? dev.deviceType.toLowerCase() : 'sensor',
      message: a.message,
      severity: a.alertType?.toLowerCase() === 'error' ? 'error' : a.alertType?.toLowerCase() === 'offline' ? 'critical' : 'warning',
      timestamp: a.timestamp,
    };
  });

  // Availability summary for the left panel widget
  const sensorDevices = (devices as any[]).filter(d => d.deviceType === 'SENSOR');
  const totalSlots = sensorDevices.length || slots.length;
  const occupiedSlots = sensorDevices.filter(d => occupiedDeviceIds.has(d.deviceId)).length
    || activeSessions.length;
  const freeSlots = Math.max(0, totalSlots - occupiedSlots);

  return {
    slots: mappedSlots,
    devices: mappedDevices,
    alerts: mappedAlerts,
    summary: { totalSlots, occupiedSlots, freeSlots, activeSessions: activeSessions.length },
  };
}


/** Broadcast a message to all connected SSE clients */
function broadcast(payload: object) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    try { res.write(data); } catch { clients.delete(res); }
  }
}

// Wire up eventBus listeners (module-level, registered once)
eventBus.on('monitoring:snapshot', async () => {
  const snapshot = await buildSnapshot();
  broadcast({ type: 'snapshot', data: snapshot });
});

eventBus.on('monitoring:log', (entry: any) => {
  broadcast({ type: 'log', data: entry });
});

eventBus.on('monitoring:vehicle', (event: any) => {
  broadcast({ type: 'vehicle', data: event });
});

export const MonitoringSSEController = {
  /** GET /api/monitoring/stream */
  stream: async (req: Request, res: Response): Promise<void> => {
    // Explicit CORS for SSE
    // Since we use token-in-url auth for EventSource, we do not need credentials
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering
    res.flushHeaders();

    // Register client
    clients.add(res);

    // Immediately push full snapshot
    try {
      const snapshot = await buildSnapshot();
      res.write(`data: ${JSON.stringify({ type: 'snapshot', data: snapshot })}\n\n`);

      // Push recent logs on connect
      const recentLogs = await SystemLogService.getRecent(20);
      for (const log of recentLogs.reverse()) {
        res.write(`data: ${JSON.stringify({ type: 'log', data: log })}\n\n`);
      }
    } catch (err) {
      console.error('[SSE] Failed to send initial snapshot:', err);
    }

    // Heartbeat every 25s
    const heartbeat = setInterval(() => {
      try { res.write(': ping\n\n'); } catch { clearInterval(heartbeat); clients.delete(res); }
    }, 25000);

    // Cleanup on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      clients.delete(res);
    });
  },

  /** POST /api/monitoring/bind - Link a parking session to a sensor */
  bindSensor: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId, deviceId } = req.body;
      if (!sessionId || !deviceId) {
        res.status(400).json({ success: false, message: 'sessionId and deviceId required' });
        return;
      }
      const session = await ParkingSession.findOne({ sessionId, sessionStatus: 'ACTIVE' });
      if (!session) {
        res.status(404).json({ success: false, message: 'Active session not found' });
        return;
      }
      
      // Bind session to sensor device
      session.set('deviceId', deviceId);
      await session.save();

      // Trigger snapshot update to reflect new occupancy
      eventBus.emit('monitoring:snapshot');
      
      res.json({ success: true, message: `Session ${sessionId} bound to ${deviceId}` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /** POST /api/monitoring/refresh - Trigger SSE snapshot broadcast (called by frontend after animation) */
  refreshSnapshot: async (_req: Request, res: Response): Promise<void> => {
    eventBus.emit('monitoring:snapshot');
    res.json({ success: true });
  },
};
