/**
 * Reports service – Revenue & Activity stats.
 * Replace with API when backend is ready.
 */

import type { RevenueSummary, ActivityStats } from "@/types/reports";
import revenueData from "@/data/revenueData.json";
import activityData from "@/data/activityStatsData.json";

export async function getRevenueSummary(): Promise<RevenueSummary> {
  return revenueData as RevenueSummary;
}

export async function getActivityStats(): Promise<ActivityStats> {
  return activityData as ActivityStats;
}
