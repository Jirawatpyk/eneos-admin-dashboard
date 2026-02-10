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
import { useCampaignDateFilter } from '@/hooks/use-campaign-date-filter';
import { cn } from '@/lib/utils';

/**
 * Props for CampaignKPICardsGrid
 * Story 5.8: Accept date filter params (optional — falls back to URL params via hook)
 */
interface CampaignKPICardsGridProps {
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Grid of 4 Campaign KPI cards with loading and error states
 */
export function CampaignKPICardsGrid(props: CampaignKPICardsGridProps) {
  const filter = useCampaignDateFilter();
  const dateFrom = props.dateFrom ?? filter.dateFrom;
  const dateTo = props.dateTo ?? filter.dateTo;

  const { data, isLoading, isFetching, isError, error, refetch } = useCampaignStats({
    dateFrom,
    dateTo,
  });

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
      {/* Story 5.8 Fix #7: Show dimmed opacity while refetching (AC#3 loading indicator) */}
      <div
        className={cn(
          'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          isFetching && !isLoading && 'opacity-70 transition-opacity'
        )}
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
