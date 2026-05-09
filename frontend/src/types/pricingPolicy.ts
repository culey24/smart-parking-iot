export type VehicleType = "MOTORBIKE" | "CAR" | "BICYCLE";
export type PolicyStatus = "ACTIVE" | "INACTIVE";

export interface PricingPolicy {
  _id?: string;
  vehicleType: VehicleType;
  dayRate: number;
  nightOrSundayRate: number;
  status: PolicyStatus;
  effectiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// In the frontend, we usually fetch an array of policies
export type PricingPolicyConfig = PricingPolicy[];
