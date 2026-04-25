import type {
  ReconciliationRequest,
  SpmsData,
  BkpayData,
  RelatedSession,
  ReconciliationStatus,
} from "@/types/reconciliation";
import { apiFetch } from "@/config/api";

export async function getReconciliationRequests(): Promise<ReconciliationRequest[]> {
  return apiFetch<ReconciliationRequest[]>("/api/reconciliation/requests");
}

export async function getSpmsData(sessionId: string): Promise<SpmsData | null> {
  return apiFetch<SpmsData | null>(`/api/reconciliation/session/${sessionId}`);
}

export async function getBkpayData(sessionId: string): Promise<BkpayData | null> {
  return apiFetch<BkpayData | null>(`/api/reconciliation/session/${sessionId}`);
}

export async function getRelatedSessions(userId: string): Promise<RelatedSession[]> {
  return apiFetch<RelatedSession[]>(`/api/reconciliation/related/${userId}`);
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
