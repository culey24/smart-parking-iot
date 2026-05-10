import { Schema, model, Document } from 'mongoose';

export interface ISpecialRule {
  name: string;
  startHour: number; // 0-23
  endHour: number;   // 0-23
  daysOfWeek: number[]; // 0 (Sunday) to 6 (Saturday)
  rate: number;
}

export interface IPricingPolicy extends Document {
  userRole: 'LEARNER' | 'FACULTY' | 'VISITOR';
  vehicleType: 'MOTORBIKE' | 'CAR' | 'BICYCLE';
  calculationType: 'HOURLY' | 'PER_TURN';
  billingIntervalMinutes: number; // e.g., 60 for 1 hour blocks
  specialRules: ISpecialRule[]; // First rule is the default
  discountPercent?: number; // For Faculty
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PricingPolicySchema = new Schema<IPricingPolicy>({
  userRole: { type: String, enum: ['LEARNER', 'FACULTY', 'VISITOR'], required: true },
  vehicleType: { type: String, enum: ['MOTORBIKE', 'CAR', 'BICYCLE'], required: true },
  calculationType: { type: String, enum: ['HOURLY', 'PER_TURN'], default: 'HOURLY' },
  billingIntervalMinutes: { type: Number, default: 60 },
  specialRules: [{
    name: { type: String, required: true },
    startHour: { type: Number, required: true },
    endHour: { type: Number, required: true },
    daysOfWeek: [{ type: Number }],
    rate: { type: Number, required: true }
  }],
  discountPercent: { type: Number, default: 0 },
  effectiveDate: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure unique policy per role and vehicle
PricingPolicySchema.index({ userRole: 1, vehicleType: 1 }, { unique: true });

export const PricingPolicy = model<IPricingPolicy>('PricingPolicy', PricingPolicySchema);

