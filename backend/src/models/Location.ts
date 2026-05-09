import { Schema, model } from 'mongoose';

const LocationSchema = new Schema({
  locationId: { type: String, required: true, unique: true },
  locationName: { type: String, required: true },
  coordinates: {
    type: [Number], // [x, y] or [row, col]
    required: true,
    validate: {
      validator: (v: number[]) => v.length === 2,
      message: 'Coordinates must have exactly 2 numbers [x, y]',
    },
  },
  locationType: { type: String, enum: ['GATE', 'SLOT', 'INTERSECTION', 'CLOSET'], required: true },
}, { timestamps: true });

export const Location = model('Location', LocationSchema);
