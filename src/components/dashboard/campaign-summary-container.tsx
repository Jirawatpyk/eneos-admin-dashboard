/**
 * Campaign Summary Container
 * Story 2.9: Campaign Summary on Main Dashboard
 *
 * Data fetching wrapper using useDashboardData() hook
 */
'use client';

import { useDashboardData } from '@/hooks/use-dashboard-data';
import { CampaignSummary } from './campaign-summary';
import { CampaignSummarySkeleton } from './campaign-summary-skeleton';
import { CampaignSummaryEmpty } from './campaign-summary-empty';

export function CampaignSummaryContainer() {
  const { data, isLoading } = useDashboardData();

  if (isLoading) return <CampaignSummarySkeleton />;

  const campaignSummary = data?.campaignSummary;
  if (!campaignSummary) return <CampaignSummaryEmpty />;

  return <CampaignSummary data={campaignSummary} />;
}
