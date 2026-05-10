/** IoT device row for admin DataTable */

export type IoTDeviceType = "sensor" | "gate" | "signage" | "camera";

export const DEVICE_TYPES: IoTDeviceType[] = ["sensor", "gate", "signage", "camera"];

export type IoTDeviceStatus = "online" | "offline" | "maintainance" | "error" | "installed";

export interface IoTDeviceRow {
  id: string;
  name: string;
  type: IoTDeviceType;
  zone: string;
  status: IoTDeviceStatus;
  lastActive: string;
}
