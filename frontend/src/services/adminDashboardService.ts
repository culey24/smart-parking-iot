/**
 * Admin dashboard service.
 * Currently loads from JSON. Replace with API when backend is ready.
 */

import type { AdminAlert, AdminDashboardStats } from "@/types/adminDashboard";
import adminAlertsData from "@/data/adminAlertsData.json";
import monitoringData from "@/data/monitoringData.json";

const alertsData = adminAlertsData as AdminAlert[];

/** Get infrastructure alerts (issues) */
export async function getAdminAlerts(): Promise<AdminAlert[]> {
  // TODO: Replace with API
  return [...alertsData].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/** Update alert status */
export async function updateAlertStatus(
  id: string,
  status: "pending" | "resolved"
): Promise<void> {
  // TODO: Replace with API
  const alert = alertsData.find((a) => a.id === id);
  if (alert) alert.status = status;
}

/** Get dashboard stats */
export async function getAdminStats(): Promise<AdminDashboardStats> {
  // TODO: Replace with API
  const slots = (monitoringData as { slots: { deviceStatus: string }[] }).slots;
  const devices = (monitoringData as { devices: { status: string }[] }).devices;
  const totalDevices = slots.length + devices.length;
  const devicesOnline =
    slots.filter((s) => s.deviceStatus === "online").length +
    devices.filter((d) => d.status === "online").length;
  const unresolvedErrors = alertsData.filter((a) => a.status === "pending").length;

  return {
    devicesOnline,
    totalDevices,
    unresolvedErrors,
    syncRate: 98.5,
  };
}
