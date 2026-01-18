/**
 * Type Definitions - Barrel Export
 * Re-exports all types for cleaner imports
 */

// Dashboard types
export type {
  ApiActivityItem,
  ApiAlert,
  DashboardSummary,
  DailyTrend,
  DashboardTrends,
  TopSalesPerson,
  DashboardData,
  DashboardResponse,
  DashboardPeriod,
} from './dashboard';

// Lead types (basic)
export type {
  LeadStatus,
  Lead,
  LeadsPagination,
  LeadsResponse,
  LeadDetailResponse,
  LeadsQueryParams,
} from './lead';

// Lead Detail types (Story 4.8)
export type {
  StatusHistoryItem,
  LeadMetrics,
  LeadDetailOwner,
  LeadDetailCampaign,
  LeadDetail,
} from './lead-detail';

// Sales Performance types
export type {
  SalesPersonMetrics,
  TeamPerformanceSummary,
  SalesPerformanceResponse,
  SalesPerformanceData,
  SalesSortingState,
  DailyMetric,
  SalesTrendData,
  TrendPeriod,
  TrendDirection,
} from './sales';
