/**
 * Sales Components Barrel Export
 * Story 3.1: Sales Team Performance Table
 * Story 3.2: Conversion Rate Analytics
 * Story 3.3: Sales Performance Bar Chart
 * Story 3.4: Response Time Analytics
 * Story 3.5: Individual Performance Trend
 * Story 3.6: Period Filter for Sales Performance
 */

// Performance Table (Story 3.1)
export { PerformanceTable } from './performance-table';
export { PerformanceTableSkeleton } from './performance-table-skeleton';
export { PerformanceTableEmpty } from './performance-table-empty';
export { PerformanceTableError } from './performance-table-error';
export { PerformanceTableContainer } from './performance-table-container';

// Sales Detail Sheet (Story 3.1 - AC#7)
export { SalesDetailSheet } from './sales-detail-sheet';

// Conversion Summary Cards (Story 3.2 - AC#1-4, #7-8)
export { ConversionSummaryCards } from './conversion-summary-cards';
export { ConversionSummarySkeleton } from './conversion-summary-skeleton';
export { TeamAverageCard } from './team-average-card';
export { BestPerformerCard } from './best-performer-card';
export { NeedsImprovementCard } from './needs-improvement-card';

// Conversion Progress Bar (Story 3.2 - AC#5)
export { ConversionProgressBar } from './conversion-progress-bar';

// Performance Bar Chart (Story 3.3 - AC#1-10)
export { PerformanceBarChart } from './performance-bar-chart';
export { PerformanceBarChartSkeleton } from './performance-bar-chart-skeleton';
export { PerformanceBarChartEmpty } from './performance-bar-chart-empty';
export { PerformanceBarChartTooltip } from './performance-bar-chart-tooltip';
export { AccessibleLegend } from './accessible-legend';

// Response Time Analytics (Story 3.4 - AC#1-9)
export { ResponseTimeCard } from './response-time-card';
export { ResponseTimeCardSkeleton } from './response-time-card-skeleton';
export { ResponseTimeGauge } from './response-time-gauge';

// Individual Trend Chart (Story 3.5 - AC#1-9)
export { IndividualTrendChart } from './individual-trend-chart';
export { TrendChartSkeleton } from './trend-chart-skeleton';
export { TrendChartEmpty } from './trend-chart-empty';
export { TrendChartTooltip } from './trend-chart-tooltip';
export { TrendIndicator, calculateTrendDirection } from './trend-indicator';

// Period Filter (Story 3.6 - AC#1-9)
export { SalesPeriodFilter, SALES_PERIOD_OPTIONS, isValidSalesPeriod } from './sales-period-filter';
export type { SalesPeriod } from './sales-period-filter';
export { CustomDateRange } from './custom-date-range';

// Target vs Actual (Story 3.7 - AC#1-10)
export { TargetProgressCard, TargetProgressCardSkeleton } from './target-progress-card';
export { TargetProgressCell, TargetAchievementBadge } from './target-progress-cell';
