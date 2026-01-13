/**
 * Dashboard API Types
 * Story 2.1: KPI Cards
 * Story 2.4: Top Sales Table
 * Story 2.5: Recent Activity Feed
 */

/**
 * API Activity Item (from backend)
 * Different from frontend Activity type - needs transformation
 */
export interface ApiActivityItem {
  id: string;
  type: 'new' | 'claimed' | 'contacted' | 'closed' | 'lost' | 'unreachable';
  salesId: string;
  salesName: string;
  leadId: number;
  company: string;
  customerName: string;
  timestamp: string;
}

/**
 * Alert/Warning Item from backend
 */
export interface ApiAlert {
  id: string;
  type: 'unclaimed' | 'stale_contacted' | 'campaign_ending';
  message: string;
  count?: number;
  severity: 'warning' | 'info';
  link?: string;
}

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
  recentActivity?: ApiActivityItem[];
  alerts?: ApiAlert[];
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
