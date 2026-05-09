import type { AuditLogEntry } from "@/types/auditLog";
import { apiFetch } from "@/config/api";

export async function getAuditLog(limit = 100, offset = 0): Promise<AuditLogEntry[]> {
  return apiFetch<AuditLogEntry[]>(`/api/admin/logs?limit=${limit}&offset=${offset}`);
}

export async function appendAuditLog(
  actor: string,
  action: string,
  target: string,
  reason?: string
): Promise<void> {
  await apiFetch("/api/admin/logs", {
    method: "POST",
    body: JSON.stringify({ actor, action, target, reason }),
  });
}
