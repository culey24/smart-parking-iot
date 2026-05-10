import type { IoTDeviceRow } from "@/types/iotDevices";
import { apiFetch } from "@/config/api";

/** Fetch all IoT devices */
export async function getIoTDevices(): Promise<IoTDeviceRow[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: IoTDeviceRow[] }>("/api/iot/devices");
    return res.data ?? [];
  } catch {
    return [];
  }
}
