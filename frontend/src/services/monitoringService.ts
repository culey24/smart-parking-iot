import type {
  MonitoringData,
  Slot,
  InfrastructureDevice,
  InfrastructureAlert,
} from "@/types/monitoring";
import { apiFetch } from "@/config/api";

/** Get live monitoring data (slots, devices, alerts) */
export async function getMonitoringData(): Promise<MonitoringData | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: MonitoringData }>("/api/monitoring/live");
    return res.data ?? null;
  } catch {
    return null;
  }
}

export type { Slot, InfrastructureDevice, InfrastructureAlert };
