/**
 * Fee reconciliation service – UC 3.6 report issues.
 * Replace with API when backend is ready.
 */

import type {
  ReconciliationRequest,
  SpmsData,
  BkpayData,
  RelatedSession,
  ReconciliationStatus,
} from "@/types/reconciliation";
import reconciliationData from "@/data/reconciliationData.json";

const data = reconciliationData as {
  requests: ReconciliationRequest[];
  spmsBySession: Record<string, SpmsData>;
  bkpayBySession: Record<string, BkpayData>;
  relatedSessionsByUser: Record<string, RelatedSession[]>;
};

export async function getReconciliationRequests(): Promise<
  ReconciliationRequest[]
> {
  return [...data.requests].sort(
    (a, b) =>
      new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );
}

export async function getSpmsData(
  sessionId: string
): Promise<SpmsData | null> {
  return data.spmsBySession[sessionId] ?? null;
}

export async function getBkpayData(
  sessionId: string
): Promise<BkpayData | null> {
  return data.bkpayBySession[sessionId] ?? null;
}

export async function getRelatedSessions(
  userId: string
): Promise<RelatedSession[]> {
  const sessions = data.relatedSessionsByUser[userId] ?? [];
  return [...sessions].sort(
    (a, b) =>
      new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
  );
}

export async function updateRequestStatus(
  requestId: string,
  status: ReconciliationStatus,
  _note?: string
): Promise<void> {
  const req = data.requests.find((r) => r.id === requestId);
  if (req) {
    req.status = status;
    // TODO: store note for audit when backend is ready
  }
}
