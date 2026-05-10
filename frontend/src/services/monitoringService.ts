import type {
  MonitoringData,
  Slot,
  InfrastructureDevice,
  InfrastructureAlert,
} from "@/types/monitoring";
import { apiFetch } from "@/config/api";

/** Get live monitoring data (slots, devices, alerts) */
export async function getMonitoringData(): Promise<MonitoringData> {
  return apiFetch<MonitoringData>("/api/monitoring/live");
  // return apiFetch<MonitoringData>("/api/dashboard/live");
}

export type { Slot, InfrastructureDevice, InfrastructureAlert };
