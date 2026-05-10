import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  History,
  User,
  MapPin,
  Headphones,
  Wallet,
  ChevronRight,
  BadgeCheck,
  BadgeX,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLiveDuration } from "@/hooks/useLiveDuration";
import { getRecentParkingSessions } from "@/services/parkingService";
import { getDebtForCurrentCycle } from "@/services/billingService";
import type { ParkingSession } from "@/types/parking";

const ROLE_LABELS: Record<string, string> = {
  LEARNER: "Student",
  FACULTY: "Faculty",
  OPERATOR: "Operator",
  ADMIN: "Admin",
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function ParkingHistoryItem({ session }: { session: ParkingSession }) {
  const liveDuration = useLiveDuration(
    session.status === "ongoing" ? session.startTime : null
  );

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            session.status === "ongoing"
              ? "bg-[#003087]/15 text-[#003087]"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {session.status === "ongoing" ? (
            <span className="text-xs font-bold">ON</span>
          ) : (
            <span className="text-xs font-bold">✓</span>
          )}
        </div>
        <div>
          <p className="font-medium">{session.licensePlate}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(session.startTime)} • {formatTime(session.startTime)}
          </p>
        </div>
      </div>
      <div className="text-right">
        {session.status === "ongoing" ? (
          <p className="text-sm font-semibold text-[#003087]">{liveDuration}</p>
        ) : session.amount ? (
          <p className="text-sm text-muted-foreground">
            {session.amount.toLocaleString()}₫
          </p>
        ) : null}
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    label: "Parking History",
    icon: History,
    path: "/history",
  },
  {
    label: "Personal Info",
    icon: User,
    path: "/profile",
  },
  {
    label: "Parking Map",
    icon: MapPin,
    path: "/parking-map",
  },
  {
    label: "Support",
    icon: Headphones,
    path: "/support",
  },
] as const;

export function DashboardPage() {
  const { user } = useAuth();
  const [debtAmount, setDebtAmount] = useState<number | null>(null);
  const [recentSessions, setRecentSessions] = useState<ParkingSession[]>([]);

  useEffect(() => {
    if (!user) return;
    getDebtForCurrentCycle(user.id).then(setDebtAmount).catch(() => setDebtAmount(0));
    getRecentParkingSessions(5).then(setRecentSessions).catch(() => setRecentSessions([]));
  }, [user]);

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Please log in</p>
      </div>
    );
  }

  const cardStatus = user.cardStatus ?? "Active";
  const CardStatusIcon = cardStatus === "Active" ? BadgeCheck : BadgeX;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003087]">{user.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{ROLE_LABELS[user.role] ?? user.role}</span>
            <span className="text-border">•</span>
            <span
              className={`inline-flex items-center gap-1.5 font-medium ${
                cardStatus === "Active"
                  ? "text-green-600"
                  : "text-amber-600"
              }`}
            >
              <CardStatusIcon className="h-4 w-4" />
              {cardStatus === "Active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </header>

      {/* Financial Summary Card */}
      <Card className="border-[#003087]/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-[#003087]" />
            Financial Summary
          </CardTitle>
          <CardDescription>Debt in current billing cycle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-bold text-[#003087]">
            {debtAmount !== null
              ? debtAmount.toLocaleString()
              : "—"}₫
          </p>
          <Button
            className="w-full bg-[#003087] hover:bg-[#003087]/90"
            onClick={() => {
              /* TODO: BKPay integration */
            }}
          >
            Pay
          </Button>
        </CardContent>
      </Card>

      {/* Recent History Section */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Parking Sessions</h2>
          <Link
            to="/history"
            className="text-sm font-medium text-[#003087] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentSessions.map((session, i) => (
            <ParkingHistoryItem key={session.id || i} session={session} />
          ))}
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <div className="group flex flex-col items-center justify-center rounded-xl border-2 border-[#003087]/20 bg-card p-6 transition-all hover:border-[#003087] hover:bg-[#003087]/5">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#003087]/15 text-[#003087] transition-colors group-hover:bg-[#003087]/25">
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="text-center font-semibold">{action.label}</p>
                  <ChevronRight className="mt-1 h-4 w-4 text-[#003087] opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
