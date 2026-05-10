import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISystemLog extends Document {
  logId: string;
  timestamp: Date;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  source: string;
  message: string;
  sessionId?: string;
  deviceId?: string;
  metadata?: Record<string, any>;
}

const SystemLogSchema = new Schema<ISystemLog>({
  logId:     { type: String, default: () => uuidv4(), unique: true },
  timestamp: { type: Date, default: Date.now },
  level:     { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'], required: true },
  source:    { type: String, required: true },
  message:   { type: String, required: true },
  sessionId: { type: String },
  deviceId:  { type: String },
  metadata:  { type: Schema.Types.Mixed },
}, { timestamps: false });

// TTL index: auto-delete logs older than 7 days
SystemLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
SystemLogSchema.index({ timestamp: -1 }); // fast recent-first queries

export const SystemLog = mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);
