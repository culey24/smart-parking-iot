import type {
  ReconciliationRequest,
  SpmsData,
  BkpayData,
  RelatedSession,
  ReconciliationStatus,
} from "@/types/reconciliation";
import { apiFetch } from "@/config/api";

type ApiList<T> = { success: boolean; data: T[] };
type ApiItem<T> = { success: boolean; data: T };

export async function getReconciliationRequests(): Promise<ReconciliationRequest[]> {
  try {
    const res = await apiFetch<ApiList<ReconciliationRequest>>("/api/reconciliation/requests");
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function getSpmsData(sessionId: string): Promise<SpmsData | null> {
  try {
    const res = await apiFetch<ApiItem<SpmsData>>(`/api/reconciliation/session/${sessionId}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getBkpayData(sessionId: string): Promise<BkpayData | null> {
  try {
    const res = await apiFetch<ApiItem<BkpayData>>(`/api/reconciliation/session/${sessionId}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getRelatedSessions(userId: string): Promise<RelatedSession[]> {
  try {
    const res = await apiFetch<ApiList<RelatedSession>>(`/api/reconciliation/related/${userId}`);
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function updateRequestStatus(
  requestId: string,
  status: ReconciliationStatus,
  note?: string
): Promise<void> {
  await apiFetch(`/api/reconciliation/requests/${requestId}`, {
    method: "PUT",
    body: JSON.stringify({ status, note }),
  });
}
