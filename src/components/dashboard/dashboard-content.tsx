/**
 * Dashboard Content Component
 * Story 2.7: Date Filter Integration
 * Story 2.8: Auto Refresh Integration
 *
 * Client component that renders all dashboard containers.
 * Period state is managed via URL params and read by useDashboardPeriod() hook
 * inside each container — no prop drilling needed.
 */
'use client';

import { Suspense } from 'react';
import {
  KPICardsGrid,
  LeadTrendChartContainer,
  StatusDistributionContainer,
  TopSalesTableContainer,
  RecentActivityContainer,
  AlertsPanelContainer,
  DateFilter,
  AutoRefreshToggle,
  RefreshButton,
  LastUpdated,
} from '@/components/dashboard';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { KPICardsSkeletonGrid } from './kpi-card-skeleton';
import { LeadTrendChartSkeleton } from './lead-trend-chart-skeleton';
import { StatusDistributionSkeleton } from './status-distribution-skeleton';
import { TopSalesTableSkeleton } from './top-sales-table-skeleton';
import { RecentActivitySkeleton } from './recent-activity-skeleton';
import { AlertsPanelSkeleton } from './alerts-panel-skeleton';

interface DashboardHeaderProps {
  userName: string;
  autoRefreshEnabled: boolean;
  onAutoRefreshToggle: (enabled: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

/**
 * Dashboard Header with Date Filter and Auto Refresh Controls
 */
function DashboardHeader({
  userName,
  autoRefreshEnabled,
  onAutoRefreshToggle,
  onRefresh,
  isRefreshing,
  lastUpdated,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">แดชบอร์ด</h1>
        <p className="text-muted-foreground mt-1">ยินดีต้อนรับ, {userName}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Last Updated Timestamp - AC#5 */}
        <LastUpdated timestamp={lastUpdated} />

        {/* Refresh Controls - AC#1, AC#4 */}
        <div className="flex items-center gap-2">
          <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} />
          <AutoRefreshToggle
            enabled={autoRefreshEnabled}
            onToggle={onAutoRefreshToggle}
          />
        </div>

        {/* Date Filter - Story 2.7 */}
        <Suspense fallback={<div className="h-9 w-[180px] bg-muted rounded animate-pulse" />}>
          <DateFilter />
        </Suspense>
      </div>
    </div>
  );
}

interface DashboardContentProps {
  userName: string;
}

/**
 * Dashboard Content Component
 * Renders all dashboard containers. Each container reads period from URL
 * via useDashboardPeriod() hook internally — no props needed.
 * Integrates auto-refresh functionality (Story 2.8)
 */
export function DashboardContent({ userName }: DashboardContentProps) {
  // Auto refresh hook (Story 2.8)
  const {
    enabled: autoRefreshEnabled,
    toggleEnabled: onAutoRefreshToggle,
    refresh,
    isRefreshing,
    lastUpdated,
  } = useAutoRefresh();

  return (
    <div className="space-y-6">
      {/* Page Header with Date Filter and Auto Refresh Controls */}
      <DashboardHeader
        userName={userName}
        autoRefreshEnabled={autoRefreshEnabled}
        onAutoRefreshToggle={onAutoRefreshToggle}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      {/* KPI Cards - Story 2.1 */}
      <Suspense fallback={<KPICardsSkeletonGrid />}>
        <KPICardsGrid />
      </Suspense>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Lead Trend Chart - Story 2.2 */}
        <Suspense fallback={<LeadTrendChartSkeleton />}>
          <LeadTrendChartContainer />
        </Suspense>

        {/* Status Distribution Chart - Story 2.3 */}
        <Suspense fallback={<StatusDistributionSkeleton />}>
          <StatusDistributionContainer />
        </Suspense>
      </div>

      {/* Top Sales Table - Story 2.4 */}
      <Suspense fallback={<TopSalesTableSkeleton />}>
        <TopSalesTableContainer />
      </Suspense>

      {/* Bottom Section - Story 2.5 & 2.6 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity - Story 2.5 */}
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivityContainer />
        </Suspense>

        {/* Alerts Panel - Story 2.6 */}
        <Suspense fallback={<AlertsPanelSkeleton />}>
          <AlertsPanelContainer />
        </Suspense>
      </div>
    </div>
  );
}
