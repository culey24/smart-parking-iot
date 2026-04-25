import type { BillingRecord } from "@/types/api";
import { apiFetch } from "@/config/api";

/** Get billing/payment history by cycle */
export async function getBillingHistory(userId?: string): Promise<BillingRecord[]> {
  const query = userId ? `?userId=${userId}` : "";
  return apiFetch<BillingRecord[]>(`/api/billing/history${query}`);
}

/** Get debt for current billing cycle */
export async function getDebtForCurrentCycle(userId?: string): Promise<number> {
  const query = userId ? `?userId=${userId}` : "";
  const res = await apiFetch<{ amount: number }>(`/api/billing/debt${query}`);
  return res.amount;
}
