import { Schema, model } from 'mongoose';

const AuditLogSchema = new Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  targetResource: { type: String },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export const AuditLog = model('AuditLog', AuditLogSchema);
