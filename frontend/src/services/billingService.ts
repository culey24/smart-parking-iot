/**
 * Billing data service.
 * Currently loads from JSON. Replace with API/DB calls when backend is ready.
 */

import type { BillingRecord } from "@/types/api";
import billingHistoryData from "@/data/billingHistory.json";
import dashboardData from "@/data/dashboard.json";

const data = billingHistoryData as BillingRecord[];

/** Get billing/payment history by cycle */
export async function getBillingHistory(): Promise<BillingRecord[]> {
  // TODO: Replace with: const res = await fetch('/api/billing/history'); return res.json();
  return [...data].sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
  );
}

/** Get debt for current billing cycle */
export async function getDebtForCurrentCycle(): Promise<number> {
  // TODO: Replace with: const res = await fetch('/api/billing/debt'); return (await res.json()).amount;
  return (dashboardData as { debtAmount: number }).debtAmount;
}
