import type { SystemConfig } from "@/types/systemConfig";
import { apiFetch } from "@/config/api";

export async function getSystemConfig(): Promise<SystemConfig> {
  return apiFetch<SystemConfig>("/api/admin/config");
}

export async function saveSystemConfig(data: SystemConfig): Promise<void> {
  await apiFetch("/api/admin/config", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
