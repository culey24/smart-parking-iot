import type { AdminAlert, AdminDashboardStats } from "@/types/adminDashboard";
import { apiFetch } from "@/config/api";

/** Get infrastructure alerts (issues) */
export async function getAdminAlerts(): Promise<AdminAlert[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: AdminAlert[] }>("/api/alerts");
    return res.data ?? [];
  } catch {
    return [];
  }
}

/** Update alert status */
export async function updateAlertStatus(
  id: string,
  status: "pending" | "resolved"
): Promise<void> {
  await apiFetch(`/api/alerts/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

/** Get dashboard stats */
export async function getAdminStats(): Promise<AdminDashboardStats | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: AdminDashboardStats }>("/api/dashboard/stats");
    return res.data ?? null;
  } catch {
    return null;
  }
}
