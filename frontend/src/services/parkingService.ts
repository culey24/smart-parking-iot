import type { ParkingRecord } from "@/types/api";
import type { ParkingSession } from "@/types/parking";
import { apiFetch } from "@/config/api";

function toParkingSession(record: ParkingRecord): ParkingSession {
  return {
    id: record.id,
    licensePlate: record.licensePlate,
    startTime: new Date(record.entryTime),
    endTime: record.exitTime ? new Date(record.exitTime) : undefined,
    status: record.status as "ongoing" | "completed",
    amount: record.fee,
  };
}

/** Get full parking history (for History page) */
export async function getParkingHistory(userId?: string): Promise<ParkingRecord[]> {
  if (userId) {
    return apiFetch<ParkingRecord[]>(`/api/sessions/user/${userId}`);
  }
  return apiFetch<ParkingRecord[]>("/api/sessions");
}

/** Get recent sessions for Dashboard (ongoing first, then by date) */
export async function getRecentParkingSessions(limit = 5): Promise<ParkingSession[]> {
  const records = await apiFetch<ParkingRecord[]>(`/api/sessions/recent?limit=${limit}`);
  return records.map(toParkingSession);
}
