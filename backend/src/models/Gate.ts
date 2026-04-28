import { Schema, model } from 'mongoose';

const GateSchema = new Schema({
  gateId: { type: String, required: true, unique: true },
  gateName: { type: String, required: true },
  gateType: { type: String, enum: ['IN', 'OUT'], required: true },
  location: { type: String },
}, { timestamps: true });

export const Gate = model('Gate', GateSchema);