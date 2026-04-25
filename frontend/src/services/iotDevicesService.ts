import type { IoTDeviceRow } from "@/types/iotDevices";
import { apiFetch } from "@/config/api";

/** Get all IoT devices for DataTable */
export async function getIoTDevices(): Promise<IoTDeviceRow[]> {
  return apiFetch<IoTDeviceRow[]>("/api/devices/iot-list");
}
