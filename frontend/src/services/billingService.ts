import type { BillingRecord } from "@/types/api";
import { apiFetch } from "@/config/api";

/** Get billing/payment history by cycle */
export async function getBillingHistory(userId?: string): Promise<BillingRecord[]> {
  const query = userId ? `?userId=${userId}` : "";
  const res = await apiFetch<{ success: boolean; data: any[] }>(`/api/billing/history${query}`);
  const sessions = res.data ?? [];
  // Map ParkingSession -> BillingRecord shape
  return sessions.map((s: any) => ({
    id: s.sessionId ?? s._id,
    cycleStart: s.startTime,
    cycleEnd: s.endTime,
    amount: s.fee ?? 0,
    paidAt: s.paidAt ?? s.updatedAt ?? s.createdAt,
    method: s.paymentMethod ?? s.paymentStatus ?? "N/A",
    status: s.paymentStatus ?? s.sessionStatus ?? "unknown",
  }));
}

/** Get debt for current billing cycle */
export async function getDebtForCurrentCycle(subjectID?: string): Promise<number> {
  const query = subjectID ? `?subjectID=${subjectID}` : "";
  const res = await apiFetch<{ success: boolean; data: { totalDebt: number } }>(`/api/billing/debt${query}`);
  return res.data?.totalDebt ?? 0;
}
