import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRevenueSummary } from "@/services/reportsService";
import type { RevenueSummary } from "@/types/reports";

const CHART_COLORS = ["#003087", "#1e5bb8", "#4a8ad4", "#7ab3e8"];

export function RevenueStatusPage() {
  const [data, setData] = useState<RevenueSummary | null>(null);

  useEffect(() => {
    getRevenueSummary().then(setData);
  }, []);

  if (!data) return null;

  const totalRevenue = data.bkpayTotal + data.cashTotal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#003087]">
          Revenue Status
        </h1>
        <p className="text-sm text-muted-foreground">
          Revenue by period, audience, and payment method
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-[#003087]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#003087]">
              BKPay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.bkpayTotal.toLocaleString()} VND
            </p>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0
                ? ((data.bkpayTotal / totalRevenue) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#003087]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#003087]">
              Cash (Visitors)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.cashTotal.toLocaleString()} VND
            </p>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0
                ? ((data.cashTotal / totalRevenue) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#003087]/20">
        <CardHeader>
          <CardTitle className="text-[#003087]">
            Revenue by Day
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily revenue (VND)
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byPeriod}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number | undefined) => [(v ?? 0).toLocaleString() + " VND", "Revenue"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#003087"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#003087]/20">
        <CardHeader>
          <CardTitle className="text-[#003087]">
            Revenue by Audience
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Breakdown by user group
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.byAudience}
                  dataKey="amount"
                  nameKey="audience"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {data.byAudience.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number | undefined) => (v ?? 0).toLocaleString() + " VND"}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
