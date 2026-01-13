/**
 * Dashboard API Types
 * Story 2.1: KPI Cards
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

export interface DashboardData {
  summary: DashboardSummary;
  trends: DashboardTrends;
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
