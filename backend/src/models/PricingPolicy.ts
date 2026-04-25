import { Schema, model } from 'mongoose';

const PricingPolicySchema = new Schema({
  vehicleType: { type: String, enum: ['MOTORBIKE', 'CAR', 'BICYCLE'], required: true },
  baseRate: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  monthlyRate: { type: Number, required: true },
  effectiveDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const PricingPolicy = model('PricingPolicy', PricingPolicySchema);
