import type { SystemConfig } from "@/types/systemConfig";
import { apiFetch } from "@/config/api";

export async function getSystemConfig(): Promise<SystemConfig | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: SystemConfig }>("/api/admin/config");
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function saveSystemConfig(data: SystemConfig): Promise<void> {
  await apiFetch("/api/admin/config", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
