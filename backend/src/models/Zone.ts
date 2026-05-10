import { Schema, model, Document } from 'mongoose';

export interface IParkingZone extends Document {
  zoneId: string;
  zoneName: string;
  capacity: number;
  currentUsage: number;
  updatedAt: Date;
  createdAt: Date;
}

const ParkingZoneSchema = new Schema<IParkingZone>({
  zoneId: { type: String, required: true, unique: true },
  zoneName: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentUsage: { type: Number, default: 0 },
}, { timestamps: true });

export const ParkingZone = model<IParkingZone>('ParkingZone', ParkingZoneSchema);
// For backward compatibility while refactoring other files
export const Zone = ParkingZone;
