/**
 * Parking data service.
 * Currently loads from JSON. Replace with API/DB calls when backend is ready.
 */

import type { ParkingRecord } from "@/types/api";
import type { ParkingSession } from "@/types/parking";
import parkingHistoryData from "@/data/parkingHistory.json";

const data = parkingHistoryData as ParkingRecord[];

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
export async function getParkingHistory(): Promise<ParkingRecord[]> {
  // TODO: Replace with: const res = await fetch('/api/parking/history'); return res.json();
  return [...data].sort(
    (a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
  );
}

/** Get recent sessions for Dashboard (ongoing first, then by date) */
export async function getRecentParkingSessions(
  limit = 5
): Promise<ParkingSession[]> {
  // TODO: Replace with: const res = await fetch(`/api/parking/recent?limit=${limit}`); return res.json();
  const ongoing = data.filter((r) => r.status === "ongoing");
  const completed = data.filter((r) => r.status === "completed");
  const sorted = [
    ...ongoing,
    ...completed.sort(
      (a, b) =>
        new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
    ),
  ];
  return sorted.slice(0, limit).map(toParkingSession);
}
