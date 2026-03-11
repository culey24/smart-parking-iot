export type IssueStatus = "pending" | "resolved";

export type AlertSeverity = "critical" | "warning" | "error";

export interface AdminAlert {
  id: string;
  deviceId: string;
  deviceType: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  status: IssueStatus;
}

export interface AdminDashboardStats {
  devicesOnline: number;
  totalDevices: number;
  unresolvedErrors: number;
  syncRate: number;
}
