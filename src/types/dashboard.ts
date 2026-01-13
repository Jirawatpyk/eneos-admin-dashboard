/**
 * Dashboard API Types
 * Story 2.1: KPI Cards
 * Story 2.4: Top Sales Table
 */

export interface DashboardSummary {
  totalLeads: number;
  claimed: number;
  contacted: number;
  closed: number;
  lost: number;
  unreachable: number;
  conversionRate: number;
  previousPeriodLeads?: number;
}

export interface DailyTrend {
  date: string;
  newLeads: number;
  closed: number;
}

export interface DashboardTrends {
  daily: DailyTrend[];
}

/**
 * Top Sales Person (Leaderboard)
 * Story 2.4: Top Sales Table
 */
export interface TopSalesPerson {
  id: string;              // LINE User ID
  name: string;
  email: string;
  claimed: number;
  contacted: number;
  closed: number;
  conversionRate: number;  // เปอร์เซ็นต์
  rank: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  trends: DashboardTrends;
  topSales?: TopSalesPerson[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  error?: {
    message: string;
    code?: string;
  };
}

export type DashboardPeriod = 'week' | 'month' | 'quarter' | 'year';
