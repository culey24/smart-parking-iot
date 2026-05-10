import { Schema, model } from 'mongoose';

const TemporaryCardSchema = new Schema({
  tempCardID: { type: String, required: true, unique: true },
  cardStatus: { type: String, enum: ['ACTIVATING', 'DEACTIVATED'], default: 'ACTIVATING' },
}, { timestamps: true });

export const TemporaryCard = model('TemporaryCard', TemporaryCardSchema);