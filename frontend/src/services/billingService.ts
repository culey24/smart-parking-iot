import type { BillingRecord } from "@/types/api";
import { apiFetch } from "@/config/api";

/** Get billing/payment history by cycle */
export async function getBillingHistory(userId?: string): Promise<BillingRecord[]> {
  const query = userId ? `?userId=${userId}` : "";
  const res = await apiFetch<{ success: boolean; data: BillingRecord[] }>(`/api/billing/history${query}`);
  return res.data ?? [];
}

/** Get debt for current billing cycle */
export async function getDebtForCurrentCycle(subjectId?: string): Promise<number> {
  const query = subjectId ? `?subjectId=${subjectId}` : "";
  const res = await apiFetch<{ success: boolean; data: { totalDebt: number } }>(`/api/billing/debt${query}`);
  return res.data?.totalDebt ?? 0;
}
