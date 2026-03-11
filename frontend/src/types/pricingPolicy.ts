/** Pricing policy configuration by audience group */

export type PricingUnit = "per_trip" | "per_hour";

export type PaymentCycle = "daily" | "weekly" | "monthly" | "semester";

export interface SpecialTimeSlot {
  startTime: string; // HH:mm
  endTime: string;
  discountPercent: number; // 0 = free, 100 = no discount
  label?: string;
}

export interface AudiencePricingConfig {
  unitPriceVnd: number;
  pricingUnit: PricingUnit;
  paymentCycle: PaymentCycle;
  specialSlots: SpecialTimeSlot[];
}

export interface PricingPolicyConfig {
  learner: AudiencePricingConfig;
  facultyStaff: AudiencePricingConfig;
  visitor: AudiencePricingConfig;
}
