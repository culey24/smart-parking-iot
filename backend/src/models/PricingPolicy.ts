import { Schema, model, Document } from 'mongoose';

export interface IPricingPolicy extends Document {
  vehicleType: 'MOTORBIKE' | 'CAR' | 'BICYCLE';
  dayRate: number;
  nightOrSundayRate: number;
  status: 'ACTIVE' | 'INACTIVE';
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PricingPolicySchema = new Schema<IPricingPolicy>({
  vehicleType: { type: String, enum: ['MOTORBIKE', 'CAR', 'BICYCLE'], required: true },
  dayRate: { type: Number, required: true },
  nightOrSundayRate: { type: Number, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  effectiveDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const PricingPolicy = model<IPricingPolicy>('PricingPolicy', PricingPolicySchema);

