/**
 * Campaigns Header Component
 * Extracted from CampaignsContent to isolate useSearchParams() inside its own Suspense boundary.
 * This prevents hydration mismatch by matching the Dashboard pattern where
 * useSearchParams() is only called inside Suspense-wrapped children, never at the parent level.
 */
'use client';

import { CampaignPeriodFilter } from './campaign-period-filter';
import { CampaignExportDropdown } from './campaign-export-dropdown';
import { useCampaignDateFilter } from '@/hooks/use-campaign-date-filter';
import { useCampaignStats } from '@/hooks/use-campaign-stats';

export function CampaignsHeader() {
  const { dateFrom, dateTo } = useCampaignDateFilter();
  const { data: statsData, isLoading: isStatsLoading } = useCampaignStats({ dateFrom, dateTo });
  const campaignCount = statsData?.totalCampaigns ?? 0;

  return (
    <div className="flex justify-end items-center gap-2">
      <CampaignPeriodFilter />
      <CampaignExportDropdown
        dateFrom={dateFrom}
        dateTo={dateTo}
        campaignCount={campaignCount}
        disabled={isStatsLoading}
      />
    </div>
  );
}
