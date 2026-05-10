import mongoose, { Schema, Document } from 'mongoose';

export interface IMappingConfig extends Document {
  facilityId: string;
  layout: any[]; // Array of PlacedDevice
  updatedAt: Date;
}

const MappingConfigSchema: Schema = new Schema({
  facilityId: { type: String, required: true, unique: true, default: 'CAMPUS_PARKING_ALPHA' },
  layout: { type: Array, required: true, default: [] },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMappingConfig>('MappingConfig', MappingConfigSchema);
