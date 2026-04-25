import type { AdminAlert, AdminDashboardStats } from "@/types/adminDashboard";
import { apiFetch } from "@/config/api";

/** Get infrastructure alerts (issues) */
export async function getAdminAlerts(): Promise<AdminAlert[]> {
  return apiFetch<AdminAlert[]>("/api/alerts");
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
export async function getAdminStats(): Promise<AdminDashboardStats> {
  return apiFetch<AdminDashboardStats>("/api/dashboard/stats");
}
