/** API types - align with JSON/DB schema for easy migration */

export interface ParkingRecord {
  id: string;
  entryTime: string;
  exitTime: string | null;
  licensePlate: string;
  fee: number;
  status: "ongoing" | "completed";
}

export interface BillingRecord {
  id: string;
  cycleStart: string;
  cycleEnd: string;
  amount: number;
  paidAt: string;
  method: string;
  status: string;
}

export interface UserProfileRecord {
  mssvMscb: string;
  fullName: string;
  email: string;
  faculty: string;
  registeredVehicleType: string;
  country: string;
  province: string;
  timezone: string;
}

export interface DashboardData {
  debtAmount: number;
}
