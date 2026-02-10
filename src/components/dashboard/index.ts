/**
 * Dashboard Components Barrel Export
 * Story 2.1: KPI Cards
 * Story 2.2: Lead Trend Chart
 * Story 2.3: Status Distribution Chart
 * Story 2.4: Top Sales Table
 * Story 2.5: Recent Activity Feed
 */

// KPI Cards (Story 2.1)
export { KPICard } from './kpi-card';
export type { KPIIconType } from './kpi-card';
export { KPICardSkeleton, KPICardsSkeletonGrid } from './kpi-card-skeleton';
export { DashboardError } from './dashboard-error';
export { KPICardsGrid } from './kpi-cards-grid';

// Lead Trend Chart (Story 2.2)
export { LeadTrendChart } from './lead-trend-chart';
export { LeadTrendChartSkeleton } from './lead-trend-chart-skeleton';
export { LeadTrendChartEmpty } from './lead-trend-chart-empty';
export { LeadTrendChartContainer } from './lead-trend-chart-container';

// Campaign Summary (Story 2.9 — replaces Status Distribution)
export { CampaignSummary } from './campaign-summary';
export { CampaignSummarySkeleton } from './campaign-summary-skeleton';
export { CampaignSummaryEmpty } from './campaign-summary-empty';
export { CampaignSummaryContainer } from './campaign-summary-container';

// Top Sales Table (Story 2.4)
export { TopSalesTable } from './top-sales-table';
export { TopSalesTableSkeleton } from './top-sales-table-skeleton';
export { TopSalesTableEmpty } from './top-sales-table-empty';
export { TopSalesTableContainer } from './top-sales-table-container';

// Recent Activity Feed (Story 2.5)
export { RecentActivity } from './recent-activity';
export { ActivityItem, type Activity, type ActivityType } from './activity-item';
export { RecentActivitySkeleton } from './recent-activity-skeleton';
export { RecentActivityContainer } from './recent-activity-container';

// Alerts Panel (Story 2.6)
export { AlertsPanel } from './alerts-panel';
export { AlertItem } from './alert-item';
export { AlertsPanelSkeleton } from './alerts-panel-skeleton';
export { AlertsPanelContainer } from './alerts-panel-container';

// Date Filter (Story 2.7)
export { DateFilter, PERIOD_OPTIONS, isValidPeriod, type Period } from './date-filter';
export { CustomDateRange } from './custom-date-range';
export { DashboardContent } from './dashboard-content';

// Auto Refresh (Story 2.8)
export { AutoRefreshToggle } from './auto-refresh-toggle';
export { RefreshButton } from './refresh-button';
export { LastUpdated } from './last-updated';
