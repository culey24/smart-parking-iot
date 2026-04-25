import { Schema, model } from 'mongoose';

const SystemConfigSchema = new Schema({
  settingKey: { type: String, required: true, unique: true },
  settingValue: { type: Schema.Types.Mixed, required: true },
  description: { type: String },
}, { timestamps: true });

export const SystemConfig = model('SystemConfig', SystemConfigSchema);
