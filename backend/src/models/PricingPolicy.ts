import { Schema, model } from 'mongoose';

const PricingPolicySchema = new Schema({
  vehicleType: { type: String, enum: ['MOTORBIKE', 'BICYCLE'], required: true },
  dayRate: { type: Number, required: true }, 
  nightOrSundayRate: { type: Number, required: true },  
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  effectiveDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const PricingPolicy = model('PricingPolicy', PricingPolicySchema);