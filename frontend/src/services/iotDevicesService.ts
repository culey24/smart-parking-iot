/**
 * IoT devices service for admin.
 * Merges slots (sensors) + infrastructure devices into a unified list.
 */

import type { IoTDeviceRow, IoTDeviceStatus } from "@/types/iotDevices";
import { getMonitoringData } from "@/services/monitoringService";

function rowToZone(row: number): string {
  if (row <= 1) return "Zone A";
  if (row <= 3) return "Zone B";
  if (row <= 5) return "Zone C";
  return "Infrastructure";
}

function toStatus(s: string): IoTDeviceStatus {
  if (s === "online") return "online";
  if (s === "installed") return "installed";
  return "offline"; // error, offline, etc.
}

/** Get all IoT devices for DataTable */
export async function getIoTDevices(): Promise<IoTDeviceRow[]> {
  const data = await getMonitoringData();
  const sensors: IoTDeviceRow[] = data.slots.map((s) => ({
    id: s.id,
    type: "sensor" as const,
    zone: rowToZone(s.row),
    status: toStatus(s.deviceStatus),
  }));
  const devices: IoTDeviceRow[] = data.devices.map((d) => ({
    id: d.id,
    type: d.type,
    zone: rowToZone(d.row),
    status: toStatus(d.status),
  }));
  return [...sensors, ...devices];
}
