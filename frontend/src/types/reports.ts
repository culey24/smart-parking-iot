/** Report types for Revenue & Activity stats */

export interface RevenueByPeriod {
  label: string;
  revenue: number;
  date?: string;
}

export interface RevenueByAudience {
  audience: string;
  amount: number;
  percent: number;
}

export interface RevenueSummary {
  byPeriod: RevenueByPeriod[];
  byAudience: RevenueByAudience[];
  bkpayTotal: number;
  cashTotal: number;
}

export interface UsageByHour {
  hour: number;
  usage: number;
  label: string;
}

export interface ActivityStats {
  usageByHour: UsageByHour[];
  avgOccupancyRate: number;
  deviceErrorsWeek: number;
  deviceErrorsMonth: number;
}
