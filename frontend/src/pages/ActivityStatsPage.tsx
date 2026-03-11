import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivityStats } from "@/services/reportsService";
import type { ActivityStats } from "@/types/reports";

export function ActivityStatsPage() {
  const [data, setData] = useState<ActivityStats | null>(null);

  useEffect(() => {
    getActivityStats().then(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#003087]">
          Activity Statistics
        </h1>
        <p className="text-sm text-muted-foreground">
          Usage density, occupancy rate, device errors
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[#003087]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#003087]">
              Avg. Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.avgOccupancyRate}%</p>
            <p className="text-xs text-muted-foreground">
              Lot fill rate
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#003087]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#003087]">
              Device Errors (Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.deviceErrorsWeek}</p>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#003087]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#003087]">
              Device Errors (Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.deviceErrorsMonth}</p>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#003087]/20">
        <CardHeader>
          <CardTitle className="text-[#003087]">
            Usage Density by Hour
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Parking lot usage across time slots (slots in use)
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.usageByHour}>
                <defs>
                  <linearGradient
                    id="usageGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#003087"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="#003087"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(v: number | undefined) => [(v ?? 0) + " slots", "Usage"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#003087"
                  strokeWidth={2}
                  fill="url(#usageGradient)"
                  name="Usage"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#003087]/20">
        <CardHeader>
          <CardTitle className="text-[#003087]">
            Usage Heatmap (Simplified)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Intensity by hour – darker = higher usage
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {data.usageByHour.map((d) => {
              const maxUsage = Math.max(...data.usageByHour.map((x) => x.usage));
              const intensity = maxUsage > 0 ? d.usage / maxUsage : 0;
              return (
                <div
                  key={d.hour}
                  className="flex flex-col items-center gap-1"
                  title={`${d.label}: ${d.usage} slots`}
                >
                  <div
                    className="h-8 w-10 rounded transition-colors"
                    style={{
                      backgroundColor: `rgba(0, 48, 135, ${0.2 + intensity * 0.8})`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
