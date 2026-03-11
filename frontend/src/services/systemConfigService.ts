/**
 * System configuration service.
 * Replace with API when backend is ready.
 */

import type { SystemConfig } from "@/types/systemConfig";
import configData from "@/data/systemConfigData.json";

let config = { ...configData } as SystemConfig;

export async function getSystemConfig(): Promise<SystemConfig> {
  return { ...config };
}

export async function saveSystemConfig(data: SystemConfig): Promise<void> {
  config = { ...data };
}
