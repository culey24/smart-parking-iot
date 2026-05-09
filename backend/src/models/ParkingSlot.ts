import { Schema, model } from 'mongoose';

const ParkingSlotSchema = new Schema({
  slotId: { type: String, required: true, unique: true }, // References locationId
  zoneId: { type: String, required: true }, // References Zone
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

export const ParkingSlot = model('ParkingSlot', ParkingSlotSchema);
