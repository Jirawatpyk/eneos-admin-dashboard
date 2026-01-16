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
