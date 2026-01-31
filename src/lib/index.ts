/**
 * Library Barrel Export
 * Centralized exports for all lib utilities
 *
 * Tech Debt Resolution: Epic 3 Retrospective Action Item #1
 * Created: 2026-01-17
 *
 * Usage:
 * import { cn, formatConversionRate, CHART_COLORS } from '@/lib';
 */

// ===========================================
// Core Utilities
// ===========================================
export { cn, maskLineUserId } from './utils';

// ===========================================
// Sales Formatting (Story 3.1, 3.2, 3.4)
// ===========================================
export {
  formatConversionRate,
  getConversionRateValue,
  getConversionRateColor,
  formatResponseTime,
  getResponseTimeStatus,
  getResponseTimeColor,
  getResponseTimeBgColor,
  RESPONSE_TIME_THRESHOLDS,
} from './format-sales';

// ===========================================
// Sales Constants (Story 3.2)
// ===========================================
export {
  CONVERSION_THRESHOLDS,
  PROGRESS_BAR_MAX_RATE,
  getConversionStatus,
} from './sales-constants';

// ===========================================
// Target Utilities (Story 3.7)
// ===========================================
export {
  type TargetStatusType,
  type TargetStatusResult,
  getTargetStatus,
  prorateTarget,
  getDaysInRange,
  formatTargetDifference,
  getProgressColor,
  getProgressBarColor,
  getPeriodLabel as getTargetPeriodLabel,
} from './target-utils';

// ===========================================
// Export Utilities (Story 3.8)
// ===========================================
export {
  type ExportPeriodInfo,
  type ExportTargetData,
  exportIndividualToExcel,
  getPeriodLabel as getExportPeriodLabel,
  sanitizeFilename,
} from './export-utils';

// ===========================================
// Chart Configuration (Story 2.2, 3.3)
// ===========================================
export {
  CHART_COLORS,
  CHART_STYLES,
  STATUS_COLORS,
  SALES_BAR_COLORS,
  LEAD_TREND_COLORS,
  STATUS_LABELS,
  createGradientId,
  getGradientUrl,
  getChartColor,
} from './chart-config';

// ===========================================
// Activity Formatting (Story 2.5)
// ===========================================
export { formatActivityTime } from './format-activity-time';

// ===========================================
// API Client (Story 1.3)
// ===========================================
export { fetchWithAuth } from './api';

// ===========================================
// API Functions (Story 2.1, 3.1)
// ===========================================
export {
  fetchDashboardData,
  DashboardApiError,
} from './api/dashboard';

export {
  fetchSalesPerformance,
  SalesApiError,
  type FetchSalesPerformanceParams,
} from './api/sales-performance';

// ===========================================
// Permissions (Story 1.5) - Client Component
// Note: This module uses 'use client' directive
// ===========================================
export { permissions, usePermissions, type PermissionsResult } from './permissions';

// ===========================================
// Date Presets (Story 4.6)
// ===========================================
export {
  type DatePreset,
  type DateRange,
  type DatePresetOption,
  DATE_PRESET_OPTIONS,
  getPresetDateRange,
  formatDateRangeLabel,
  formatDateForApi,
} from './date-presets';

// ===========================================
// Campaign Benchmarks (Story 5.5)
// ===========================================
export {
  RATE_BENCHMARKS,
  classifyRatePerformance,
  getRateBenchmarkType,
  getRateTooltipMessage,
  RATE_TOOLTIP_MESSAGES,
  PERFORMANCE_LEVEL_CONFIG,
  type RateType,
  type RateBenchmarkType,
  type RatePerformanceLevel,
} from './campaign-benchmarks';

// ===========================================
// Auth Configuration (Server-side only)
// Import directly: import { authOptions } from '@/lib/auth';
// ===========================================
// Note: authOptions not exported here to prevent client-side import
// Use direct import for server components: import { authOptions } from '@/lib/auth';