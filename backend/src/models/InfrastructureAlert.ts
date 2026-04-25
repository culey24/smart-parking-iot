import { Schema, model } from 'mongoose';

const InfrastructureAlertSchema = new Schema({
  deviceId: { type: String, required: true },
  alertType: { type: String, enum: ['OFFLINE', 'ERROR', 'WARNING'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'RESOLVED'], default: 'ACTIVE' },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export const InfrastructureAlert = model('InfrastructureAlert', InfrastructureAlertSchema);
