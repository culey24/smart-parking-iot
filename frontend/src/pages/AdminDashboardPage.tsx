import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Map,
  Cpu,
  Shield,
  FileText,
  SlidersHorizontal,
  Banknote,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAdminAlerts,
  getAdminStats,
  updateAlertStatus,
} from "@/services/adminDashboardService";
import type { AdminAlert, AdminDashboardStats } from "@/types/adminDashboard";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const QUICK_NAV = [
  { label: "Layout Mapping", path: "/layout-mapping", icon: Map },
  { label: "IoT Devices", path: "/iot-devices", icon: Cpu },
  { label: "Permissions", path: "/permissions", icon: Shield },
  { label: "Audit Log", path: "/audit-log", icon: FileText },
  { label: "System Config", path: "/system-config", icon: SlidersHorizontal },
  { label: "Pricing Policy", path: "/pricing-policy", icon: Banknote },
  { label: "Fee Reconciliation", path: "/fee-reconciliation", icon: Banknote },
] as const;

export function AdminDashboardPage() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    getAdminAlerts().then(setAlerts);
    getAdminStats().then(setStats);
  }, []);

  async function handleStatusChange(id: string, status: "pending" | "resolved") {
    await updateAlertStatus(id, status);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    if (stats) {
      setStats((s) =>
        s
          ? {
              ...s,
              unresolvedErrors:
                status === "resolved"
                  ? s.unresolvedErrors - 1
                  : s.unresolvedErrors + 1,
            }
          : null
      );
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#003087]">
        Admin & Alerts Dashboard
      </h1>
      <p className="text-muted-foreground">
        Operations center – manage system errors and infrastructure
      </p>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Devices Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#003087]">
              {stats ? `${stats.devicesOnline}/${stats.totalDevices}` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unresolved Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {stats?.unresolvedErrors ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data Sync Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {stats ? `${stats.syncRate}%` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick navigation */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Navigation</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Card className="transition-colors hover:border-[#003087] hover:bg-[#003087]/5">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#003087]/15 text-[#003087]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Issue-style alerts */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Infrastructure Alerts</h2>
        <Card>
          <CardContent className="p-0">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No alerts
              </div>
            ) : (
              <ul className="divide-y">
                {alerts.map((alert, i) => (
                  <li
                    key={alert.id || i}
                    className={`flex flex-wrap items-center justify-between gap-4 p-4 transition-colors ${
                      alert.status === "resolved"
                        ? "bg-muted/30 opacity-75"
                        : ""
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleStatusChange(
                              alert.id,
                              alert.status === "resolved" ? "pending" : "resolved"
                            )
                          }
                          title={
                            alert.status === "resolved"
                              ? "Mark as Pending"
                              : "Mark as Resolved"
                          }
                        >
                          {alert.status === "resolved" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : alert.severity === "error"
                                ? "destructive"
                                : "secondary"
                          }
                          className="shrink-0"
                        >
                          {alert.severity === "critical"
                            ? "Critical"
                            : alert.severity === "error"
                              ? "Error"
                              : "Warning"}
                        </Badge>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.deviceId} • {alert.deviceType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(alert.timestamp)}
                      </span>
                      <Badge
                        variant={
                          alert.status === "resolved" ? "success" : "outline"
                        }
                      >
                        {alert.status === "resolved" ? "Resolved" : "Pending"}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
