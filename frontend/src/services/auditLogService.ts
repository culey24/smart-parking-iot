/**
 * Audit log service – system events trace.
 * Replace with API when backend is ready.
 */

import type { AuditLogEntry } from "@/types/auditLog";
import auditLogData from "@/data/auditLogData.json";

const entries = auditLogData as AuditLogEntry[];

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  return [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

let nextId = 100;

export async function appendAuditLog(
  actor: string,
  action: string,
  target: string
): Promise<void> {
  const entry: AuditLogEntry = {
    id: `AL${String(nextId++).padStart(2, "0")}`,
    actor,
    action,
    target,
    timestamp: new Date().toISOString(),
  };
  entries.unshift(entry);
}
