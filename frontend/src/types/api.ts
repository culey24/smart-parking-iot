/** API types - align with JSON/DB schema for easy migration */

export interface ParkingRecord {
  _id: string;
  sessionId: string;
  startTime: string;       // entryTime equivalent
  endTime: string | null;  // exitTime equivalent
  plateNumber: string;     // licensePlate equivalent
  fee: number;
  sessionStatus: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PENDING' | 'PAID';
  vehicleType: string;
  type: 'REGISTERED' | 'TEMPORARY';
  subjectID: string;
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
