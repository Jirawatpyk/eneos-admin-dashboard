/**
 * Campaigns Content Wrapper (Client Component)
 * Story 5.8: Campaign Date Filter
 * Story 5.9: Campaign Export
 *
 * AC#1: Date filter displayed above Campaign Table
 * AC#3: Filter application updates KPI Cards and Campaign Table
 * AC#8: KPI Cards update with filtered data
 * Story 5.9 AC#1: Export dropdown next to date filter
 *
 * Wraps campaign components with date filter state from URL params
 */
'use client';

import { Suspense } from 'react';
import { CampaignPeriodFilter } from './campaign-period-filter';
import { CampaignExportDropdown } from './campaign-export-dropdown';
import { CampaignKPICardsGrid } from './campaign-kpi-cards-grid';
import { CampaignKPICardsSkeleton } from './campaign-kpi-card-skeleton';
import { CampaignTable } from './campaign-table';
import { CampaignTableSkeleton } from './campaign-table-skeleton';
import { CampaignPerformanceChart } from './campaign-performance-chart';
import { CampaignChartSkeleton } from './campaign-chart-skeleton';
import { useCampaignDateFilter } from '@/hooks/use-campaign-date-filter';
import { useCampaignStats } from '@/hooks/use-campaign-stats';

/**
 * Client wrapper that manages date filter state and passes to child components
 */
export function CampaignsContent() {
  const { dateFrom, dateTo } = useCampaignDateFilter();
  // Story 5.9: Get campaign stats for export count
  const { data: statsData, isLoading: isStatsLoading } = useCampaignStats({ dateFrom, dateTo });
  const campaignCount = statsData?.totalCampaigns ?? 0;

  return (
    <div className="space-y-6">
      {/* Header: Date Filter + Export Dropdown (Story 5.8 + 5.9) */}
      <div className="flex justify-end items-center gap-2">
        <CampaignPeriodFilter />
        <CampaignExportDropdown
          dateFrom={dateFrom}
          dateTo={dateTo}
          campaignCount={campaignCount}
          disabled={isStatsLoading}
        />
      </div>

      {/* KPI Cards with date filter (AC#8) */}
      <Suspense fallback={<CampaignKPICardsSkeleton />}>
        <CampaignKPICardsGrid dateFrom={dateFrom} dateTo={dateTo} />
      </Suspense>

      {/* Campaign Table with date filter (AC#3) */}
      <Suspense fallback={<CampaignTableSkeleton />}>
        <CampaignTable dateFrom={dateFrom} dateTo={dateTo} />
      </Suspense>

      {/* Campaign Performance Chart (Story 5.6) - Story 5.8: Pass date filter */}
      <Suspense fallback={<CampaignChartSkeleton />}>
        <CampaignPerformanceChart dateFrom={dateFrom} dateTo={dateTo} />
      </Suspense>
    </div>
  );
}
