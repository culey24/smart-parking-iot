import { Schema, model, Document } from 'mongoose';

export interface IPricingPolicy extends Document {
  // Ràng buộc cứng luôn 3 loại xe, gõ sai chữ (VD: 'xe-may') là TypeScript báo lỗi ngay
  vehicleType: 'MOTORBIKE' | 'CAR' | 'BICYCLE';
  baseRate: number;
  hourlyRate: number;
  monthlyRate: number;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PricingPolicySchema = new Schema<IPricingPolicy>({
  vehicleType: { type: String, enum: ['MOTORBIKE', 'CAR', 'BICYCLE'], required: true },
  baseRate: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  monthlyRate: { type: Number, required: true },
  effectiveDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const PricingPolicy = model<IPricingPolicy>('PricingPolicy', PricingPolicySchema);