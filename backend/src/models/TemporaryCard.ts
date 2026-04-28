import { Schema, model } from 'mongoose';

const TemporaryCardSchema = new Schema({
  cardId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['AVAILABLE', 'IN_USE', 'LOST'], default: 'AVAILABLE' },
  lastAssignedTo: { type: String }, // Plate number or Session ID
}, { timestamps: true });

export const TemporaryCard = model('TemporaryCard', TemporaryCardSchema);