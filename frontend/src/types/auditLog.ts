/** Audit log entry for system traceability */

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string; // ISO
}
