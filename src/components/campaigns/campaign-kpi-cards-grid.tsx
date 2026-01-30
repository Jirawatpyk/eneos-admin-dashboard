/**
 * Campaign KPI Cards Grid Component
 * Story 5.3: Campaign Summary Cards
 *
 * AC#1: Renders 4 KPI cards (Total Campaigns, Delivered, Opened, Clicked)
 * AC#2: Accurate data from API
 * AC#3: Rate calculations for Opened/Clicked
 * AC#6: Empty state with hint message
 * AC#7: Responsive layout (4 cols desktop, 2x2 tablet, stack mobile)
 */
'use client';

import { CampaignKPICard } from './campaign-kpi-card';
import { CampaignKPICardsSkeleton } from './campaign-kpi-card-skeleton';
import { CampaignsError } from './campaigns-error';
import { useCampaignStats } from '@/hooks/use-campaign-stats';

/**
 * Grid of 4 Campaign KPI cards with loading and error states
 */
export function CampaignKPICardsGrid() {
  const { data, isLoading, isError, error, refetch } = useCampaignStats();

  // AC#4: Show skeleton while loading
  if (isLoading) {
    return <CampaignKPICardsSkeleton />;
  }

  // AC#5: Show error state with retry
  if (isError) {
    return <CampaignsError message={error?.message} onRetry={refetch} />;
  }

  if (!data) {
    return null;
  }

  const {
    totalCampaigns,
    delivered,
    uniqueOpens,
    uniqueClicks,
    openRate,
    clickRate,
  } = data;

  // AC#6: Empty state - show cards with 0 values + hint message
  const isEmpty = totalCampaigns === 0;

  return (
    <div className="space-y-4" data-testid="campaign-kpi-cards-container">
      {isEmpty && (
        <div
          className="text-center py-4 text-muted-foreground"
          data-testid="campaign-empty-message"
        >
          No campaign data available yet. Campaign metrics will appear here once Brevo sends events.
        </div>
      )}
      <div
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        data-testid="campaign-kpi-cards-grid"
      >
        <CampaignKPICard
          title="Total Campaigns"
          value={totalCampaigns}
          icon="campaigns"
        />
        <CampaignKPICard
          title="Delivered"
          value={delivered}
          icon="delivered"
        />
        <CampaignKPICard
          title="Opened"
          value={uniqueOpens}
          rate={openRate}
          rateLabel="open rate"
          icon="opened"
        />
        <CampaignKPICard
          title="Clicked"
          value={uniqueClicks}
          rate={clickRate}
          rateLabel="click rate"
          icon="clicked"
        />
      </div>
    </div>
  );
}
