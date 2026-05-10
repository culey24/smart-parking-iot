export type VehicleType = "MOTORBIKE" | "CAR" | "BICYCLE";
export type PolicyStatus = "ACTIVE" | "INACTIVE";
export type UserRole = "LEARNER" | "FACULTY" | "VISITOR";
export type CalculationType = "HOURLY" | "PER_TURN";

export interface SpecialRule {
  name: string;
  startHour: number;
  endHour: number;
  daysOfWeek: number[];
  rate: number;
}

export interface PricingPolicy {
  _id?: string;
  userRole: UserRole;
  vehicleType: VehicleType;
  calculationType: CalculationType;
  billingIntervalMinutes: number;
  specialRules: SpecialRule[]; // First rule is the default
  discountPercent?: number;
  effectiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// In the frontend, we usually fetch an array of policies
export type PricingPolicyConfig = PricingPolicy[];
