/**
 * Campaigns Content Wrapper (Client Component)
 * Story 5.8: Campaign Date Filter
 * Story 5.9: Campaign Export
 *
 * Pure layout wrapper — NO useSearchParams() at this level.
 * Each child calls useCampaignDateFilter() internally inside its own Suspense boundary.
 * This matches the Dashboard pattern and prevents hydration mismatch.
 */
'use client';

import { Suspense } from 'react';
import { CampaignsHeader } from './campaigns-header';
import { CampaignKPICardsGrid } from './campaign-kpi-cards-grid';
import { CampaignKPICardsSkeleton } from './campaign-kpi-card-skeleton';
import { CampaignTable } from './campaign-table';
import { CampaignTableSkeleton } from './campaign-table-skeleton';
import { CampaignPerformanceChart } from './campaign-performance-chart';
import { CampaignChartSkeleton } from './campaign-chart-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Client wrapper — pure layout, no hooks.
 * All useSearchParams() calls are inside Suspense-wrapped children.
 */
export function CampaignsContent() {
  return (
    <div className="space-y-6">
      {/* Header: Date Filter + Export Dropdown (Story 5.8 + 5.9) */}
      <Suspense fallback={<div className="flex justify-end"><Skeleton className="h-9 w-[180px]" /></div>}>
        <CampaignsHeader />
      </Suspense>

      {/* KPI Cards (AC#8) */}
      <Suspense fallback={<CampaignKPICardsSkeleton />}>
        <CampaignKPICardsGrid />
      </Suspense>

      {/* Campaign Table (AC#3) */}
      <Suspense fallback={<CampaignTableSkeleton />}>
        <CampaignTable />
      </Suspense>

      {/* Campaign Performance Chart (Story 5.6) */}
      <Suspense fallback={<CampaignChartSkeleton />}>
        <CampaignPerformanceChart />
      </Suspense>
    </div>
  );
}
