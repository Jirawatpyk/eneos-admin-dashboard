/**
 * Sales Performance API Types
 * Story 3.1: Sales Team Performance Table
 *
 * Note: ALL time values are in MINUTES (from backend)
 */

/**
 * Sales Person Performance Metrics
 * Returned from GET /api/admin/sales-performance
 */
export interface SalesPersonMetrics {
  userId: string;
  name: string;
  email: string;
  claimed: number;
  contacted: number;
  closed: number;
  lost: number;
  unreachable: number;
  conversionRate: number; // Pre-calculated by backend as percentage
  avgResponseTime: number; // IN MINUTES
}

/**
 * Team Performance Summary
 */
export interface TeamPerformanceSummary {
  totalClaimed: number;
  totalContacted: number;
  totalClosed: number;
  avgConversionRate: number;
  avgResponseTime: number; // IN MINUTES
}

/**
 * Sales Performance API Response
 */
export interface SalesPerformanceResponse {
  success: boolean;
  data: {
    teamPerformance: SalesPersonMetrics[];
    summary: TeamPerformanceSummary;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Sales Performance Data (extracted from response)
 */
export interface SalesPerformanceData {
  teamPerformance: SalesPersonMetrics[];
  summary: TeamPerformanceSummary;
}

/**
 * Sorting state for TanStack Table
 */
export interface SalesSortingState {
  id: string;
  desc: boolean;
}

// ===========================================
// Story 3.5: Individual Performance Trend
// ===========================================

/**
 * Daily metrics for a single sales person
 */
export interface DailyMetric {
  date: string; // ISO format: "2026-01-15"
  claimed: number;
  contacted: number;
  closed: number;
  conversionRate: number;
}

/**
 * Trend data for individual sales person
 * Response from /api/admin/sales-performance/trend
 */
export interface SalesTrendData {
  userId: string;
  name: string;
  period: number; // days
  dailyData: DailyMetric[];
  teamAverage: DailyMetric[]; // Team avg for same period
}

/**
 * Period options for trend chart
 */
export type TrendPeriod = 7 | 30 | 90;

/**
 * Trend direction indicator
 */
export type TrendDirection = 'up' | 'down' | 'stable';
