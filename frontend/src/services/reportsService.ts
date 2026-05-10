import type { RevenueSummary, ActivityStats } from "@/types/reports";
import { apiFetch } from "@/config/api";

interface DailyRevenueRow {
  _id: string;        // date YYYY-MM-DD
  totalRevenue: number;
  vehicleCount: number;
}

export async function getRevenueSummary(): Promise<RevenueSummary> {
  const res = await apiFetch<{ success: boolean; data: DailyRevenueRow[] }>("/api/reports/revenue");
  const rows = res.data ?? [];
  const total = rows.reduce((s, r) => s + r.totalRevenue, 0);
  return {
    byPeriod: rows.map(r => ({ label: r._id, revenue: r.totalRevenue })),
    byAudience: [
      { audience: "Registered", amount: Math.round(total * 0.7), percent: 70 },
      { audience: "Visitor",    amount: Math.round(total * 0.3), percent: 30 },
    ],
    bkpayTotal: Math.round(total * 0.7),
    cashTotal:  Math.round(total * 0.3),
  };
}

export async function getActivityStats(): Promise<ActivityStats | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: ActivityStats }>("/api/reports/activity");
    return res.data ?? null;
  } catch {
    return null;
  }
}
