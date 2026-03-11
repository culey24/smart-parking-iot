/** IoT device row for admin DataTable */

export type IoTDeviceType = "sensor" | "gateway" | "signage" | "camera";

export type IoTDeviceStatus = "online" | "offline" | "installed";

export interface IoTDeviceRow {
  id: string;
  type: IoTDeviceType;
  zone: string;
  status: IoTDeviceStatus;
}
