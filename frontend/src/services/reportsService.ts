import type { RevenueSummary, ActivityStats } from "@/types/reports";
import { apiFetch } from "@/config/api";

export async function getRevenueSummary(): Promise<RevenueSummary> {
  return apiFetch<RevenueSummary>("/api/reports/revenue");
}

export async function getActivityStats(): Promise<ActivityStats> {
  return apiFetch<ActivityStats>("/api/reports/activity");
}
