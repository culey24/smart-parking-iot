/** Device types for parking lot monitoring */

export type DeviceStatus = "online" | "offline" | "error";

export type SlotStatus = "empty" | "occupied" | "error";

export interface Slot {
  id: string;
  row: number;
  col: number;
  status: SlotStatus;
  deviceStatus: DeviceStatus;
}

export type DeviceType = "gate" | "signage" | "camera";


export interface InfrastructureDevice {
  id: string;
  type: DeviceType;
  label: string;
  row: number;
  col: number;
  status: DeviceStatus;
}

export interface InfrastructureAlert {
  id: string;
  deviceId: string;
  deviceType: DeviceType | "sensor";
  message: string;
  severity: "warning" | "error" | "critical";
  timestamp: string;
}

export interface MonitoringData {
  slots: Slot[];
  devices: InfrastructureDevice[];
  alerts: InfrastructureAlert[];
}
