import type { ParkingRecord } from "@/types/api";
import type { ParkingSession } from "@/types/parking";
import { apiFetch } from "@/config/api";

function toParkingSession(record: ParkingRecord): ParkingSession {
  return {
    id: record.sessionId ?? record._id,
    licensePlate: record.plateNumber,
    startTime: new Date(record.startTime),
    endTime: record.endTime ? new Date(record.endTime) : undefined,
    status: record.sessionStatus === 'ACTIVE' ? 'ongoing' : 'completed',
    amount: record.fee,
  };
}

/** Get full parking history (for History page) */
export async function getParkingHistory(userId?: string): Promise<ParkingRecord[]> {
  if (userId) {
    const res = await apiFetch<{ success: boolean; data: ParkingRecord[] }>(`/api/sessions/user/${userId}`);
    return res.data ?? [];
  }
  const res = await apiFetch<{ success: boolean; data: ParkingRecord[] }>("/api/sessions");
  return res.data ?? [];
}

/** Get recent sessions for Dashboard (ongoing first, then by date) */
export async function getRecentParkingSessions(limit = 5): Promise<ParkingSession[]> {
  const res = await apiFetch<{ success: boolean; data: ParkingRecord[] }>(`/api/sessions/recent?limit=${limit}`);
  return (res.data ?? []).map(toParkingSession);
}
