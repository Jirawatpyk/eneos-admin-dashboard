/**
 * Dashboard Content Component
 * Story 2.7: Date Filter Integration
 *
 * Client component that reads period from URL and passes to all containers
 */
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  KPICardsGrid,
  LeadTrendChartContainer,
  StatusDistributionContainer,
  TopSalesTableContainer,
  RecentActivityContainer,
  AlertsPanelContainer,
  DateFilter,
} from '@/components/dashboard';
import { KPICardsSkeletonGrid } from './kpi-card-skeleton';
import { LeadTrendChartSkeleton } from './lead-trend-chart-skeleton';
import { StatusDistributionSkeleton } from './status-distribution-skeleton';
import { TopSalesTableSkeleton } from './top-sales-table-skeleton';
import { RecentActivitySkeleton } from './recent-activity-skeleton';
import { AlertsPanelSkeleton } from './alerts-panel-skeleton';
import type { Period } from './date-filter';
import type { DashboardPeriod } from '@/types/dashboard';

/**
 * Valid periods for the dashboard
 */
const VALID_PERIODS: Period[] = ['today', 'week', 'month', 'lastMonth', 'custom'];

/**
 * Map Period to DashboardPeriod (API expects specific values)
 */
function mapPeriodToDashboardPeriod(period: Period): DashboardPeriod {
  switch (period) {
    case 'today':
      return 'today';
    case 'week':
      return 'week';
    case 'lastMonth':
      return 'month'; // API might need adjustment
    case 'custom':
      return 'month'; // Custom handled separately
    default:
      return 'month';
  }
}

interface DashboardHeaderProps {
  userName: string;
}

/**
 * Dashboard Header with Date Filter
 */
function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {userName}</p>
      </div>
      <Suspense fallback={<div className="h-9 w-[180px] bg-gray-100 rounded animate-pulse" />}>
        <DateFilter />
      </Suspense>
    </div>
  );
}

interface DashboardContentProps {
  userName: string;
}

/**
 * Dashboard Content Component
 * Reads period from URL and passes to all container components
 */
export function DashboardContent({ userName }: DashboardContentProps) {
  const searchParams = useSearchParams();

  // Get period from URL, validate, and map to API period
  const urlPeriod = searchParams.get('period') as Period | null;
  const period: Period = urlPeriod && VALID_PERIODS.includes(urlPeriod) ? urlPeriod : 'month';
  const apiPeriod = mapPeriodToDashboardPeriod(period);

  return (
    <div className="space-y-6">
      {/* Page Header with Date Filter */}
      <DashboardHeader userName={userName} />

      {/* KPI Cards - Story 2.1 */}
      <Suspense fallback={<KPICardsSkeletonGrid />}>
        <KPICardsGrid period={apiPeriod} />
      </Suspense>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Lead Trend Chart - Story 2.2 */}
        <Suspense fallback={<LeadTrendChartSkeleton />}>
          <LeadTrendChartContainer period={apiPeriod} />
        </Suspense>

        {/* Status Distribution Chart - Story 2.3 */}
        <Suspense fallback={<StatusDistributionSkeleton />}>
          <StatusDistributionContainer period={apiPeriod} />
        </Suspense>
      </div>

      {/* Top Sales Table - Story 2.4 */}
      <Suspense fallback={<TopSalesTableSkeleton />}>
        <TopSalesTableContainer period={apiPeriod} />
      </Suspense>

      {/* Bottom Section - Story 2.5 & 2.6 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity - Story 2.5 */}
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivityContainer period={apiPeriod} />
        </Suspense>

        {/* Alerts Panel - Story 2.6 */}
        <Suspense fallback={<AlertsPanelSkeleton />}>
          <AlertsPanelContainer period={apiPeriod} />
        </Suspense>
      </div>
    </div>
  );
}
