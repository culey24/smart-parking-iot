import { SystemLog, ISystemLog } from '../models/SystemLog';
import { eventBus } from '../utils/eventBus';

interface LogMeta {
  sessionId?: string;
  deviceId?: string;
  metadata?: Record<string, any>;
}

export class SystemLogService {
  /**
   * Persists a log entry to MongoDB and broadcasts it via SSE.
   */
  static async log(
    level: ISystemLog['level'],
    source: string,
    message: string,
    meta: LogMeta = {}
  ): Promise<void> {
    try {
      const entry = await SystemLog.create({ level, source, message, ...meta });
      // Broadcast to all connected SSE clients
      eventBus.emit('monitoring:log', {
        logId: entry.logId,
        timestamp: entry.timestamp,
        level: entry.level,
        source: entry.source,
        message: entry.message,
        sessionId: entry.sessionId,
        deviceId: entry.deviceId,
      });
    } catch (err) {
      // Don't crash the calling service if logging fails
      console.error('[SystemLogService] Failed to persist log:', err);
    }
  }

  /**
   * Returns the N most recent log entries.
   */
  static async getRecent(limit = 50): Promise<ISystemLog[]> {
    return SystemLog.find().sort({ timestamp: -1 }).limit(limit).lean();
  }
}
