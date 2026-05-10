import { Zone } from '../models/Zone';
import { Response, Request } from 'express';

export class NavigationService {
  static async getZonesByUsage() {
    return Zone.find().sort({ currentUsage: 1 }).exec();
  }

  static async getLeastUsedZone() {
    return Zone.findOne().sort({ currentUsage: 1 }).exec();
  }

  static async getStats() {
    const zones = await Zone.find().exec();
    const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
    const totalUsage = zones.reduce((sum, z) => sum + z.currentUsage, 0);

    return {
      totalCapacity,
      totalUsage,
      utilizationRate: totalCapacity > 0 ? totalUsage / totalCapacity : 0
    };
  }

  // static async streamLiveMonitoring(req: Request, res: Response) {
  //   // Set headers for SSE
  //   res.setHeader('Content-Type', 'text/event-stream');
  //   res.setHeader('Cache-Control', 'no-cache');
  //   res.setHeader('Connection', 'keep-alive');

  //   // Flush headers immediately (for some Express setups)
  //   res.flushHeaders?.();

  //   // Send initial snapshot so client has data right away
  //   const zones = await Zone.find().exec();
  //   res.write(`data: ${JSON.stringify({ type: 'snapshot', zones })}\n\n`);

  //   // Watch MongoDB changes
  //   const changeStream = Zone.watch();

  //   changeStream.on('change', (change) => {
  //     res.write(`data: ${JSON.stringify({ type: 'update', change })}\n\n`);
  //   });

  //   // Clean up when client disconnects
  //   req.on('close', () => {
  //     changeStream.close();
  //   });
  // }

  static async streamLiveMonitoring(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    console.log("here")

    // Initial snapshot
    const zones = await Zone.find().exec();
    console.log("Initial snapshot:", zones);
    res.write(`data: ${JSON.stringify({ type: 'snapshot', zones })}\n\n`);

    // Watch MongoDB changes
    const changeStream = Zone.watch();
    changeStream.on('change', (change) => {
      console.log("Change event:", change);
      res.write(`data: ${JSON.stringify({ type: 'update', change })}\n\n`);
    });

    req.on('close', () => {
      console.log("Client disconnected, closing change stream");
      changeStream.close();
    });
  }

  static async getLiveMonitoringSimple() {
    return Zone.find().exec();
  }
}
