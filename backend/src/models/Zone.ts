import { Schema, model } from 'mongoose';

const ZoneSchema = new Schema({
  zoneId: { type: String, required: true, unique: true },
  zoneName: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentUsage: { type: Number, default: 0 },
}, { timestamps: true });

export const Zone = model('Zone', ZoneSchema);

