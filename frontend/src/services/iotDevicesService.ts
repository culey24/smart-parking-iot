import type { IoTDeviceRow } from "@/types/iotDevices";
import { apiFetch } from "@/config/api";

/** Fetch all IoT devices */
export async function getIoTDevices(): Promise<IoTDeviceRow[]> {
  return apiFetch<IoTDeviceRow[]>("/api/iot/devices");
}
