export type ParkingSessionStatus = "ongoing" | "completed";

export interface ParkingSession {
  id: string;
  licensePlate: string;
  startTime: Date;
  endTime?: Date;
  status: ParkingSessionStatus;
  amount?: number;
}
