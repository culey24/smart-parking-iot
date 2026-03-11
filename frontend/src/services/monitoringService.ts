/**
 * Parking lot monitoring service.
 * Currently loads from JSON. Replace with WebSocket/API when backend is ready.
 */

import type {
  MonitoringData,
  Slot,
  InfrastructureDevice,
  InfrastructureAlert,
} from "@/types/monitoring";
import monitoringData from "@/data/monitoringData.json";

/** Get live monitoring data (slots, devices, alerts) */
export async function getMonitoringData(): Promise<MonitoringData> {
  // TODO: Replace with WebSocket or polling: fetch('/api/monitoring/live')
  return monitoringData as MonitoringData;
}

export type { Slot, InfrastructureDevice, InfrastructureAlert };
