/**
 * KPI Cards Grid Component
 * Story 2.1: KPI Cards
 *
 * AC#1: Renders 4 KPI cards (Total Leads, Claimed, Contacted, Closed)
 * AC#2: Accurate data from API
 * AC#3: Percentage calculations
 * AC#7: Responsive layout (4 cols desktop, 2x2 tablet, stack mobile)
 */
'use client';

import { KPICard } from './kpi-card';
import { KPICardsSkeletonGrid } from './kpi-card-skeleton';
import { DashboardError } from './dashboard-error';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import type { DashboardPeriod } from '@/types/dashboard';

interface KPICardsGridProps {
  period?: DashboardPeriod;
}

/**
 * Grid of 4 KPI cards with loading and error states
 */
export function KPICardsGrid({ period = 'month' }: KPICardsGridProps) {
  const { data, isLoading, isError, error, refetch } = useDashboardData({
    period,
  });

  // AC#5: Show skeleton while loading
  if (isLoading) {
    return <KPICardsSkeletonGrid />;
  }

  // AC#6: Show error state with retry
  if (isError) {
    return <DashboardError message={error?.message} onRetry={refetch} />;
  }

  if (!data) {
    return null;
  }

  const { summary } = data;
  // Prevent division by zero
  const total = summary.totalLeads || 1;

  // AC#3: Use % change from API (Story 0-13) or fallback to manual calculation
  const totalChange = summary.changes?.totalLeads ?? (
    summary.totalLeads === 0 && (summary.previousPeriodLeads === 0 || summary.previousPeriodLeads === undefined)
      ? 0
      : ((summary.totalLeads - (summary.previousPeriodLeads ?? total)) / ((summary.previousPeriodLeads ?? total) || 1)) * 100
  );

  // AC#3: Calculate rates for other metrics
  const claimRate = (summary.claimed / total) * 100;
  const contactRate = (summary.contacted / total) * 100;
  const closeRate = (summary.closed / total) * 100;

  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      data-testid="kpi-cards-grid"
    >
      <KPICard
        title="Total Leads"
        value={summary.totalLeads}
        change={totalChange}
        changeLabel="vs last period"
        icon="leads"
      />
      <KPICard
        title="Claimed"
        value={summary.claimed}
        change={claimRate}
        changeLabel="claim rate"
        icon="claimed"
        isRate
      />
      <KPICard
        title="Contacted"
        value={summary.contacted}
        change={contactRate}
        changeLabel="contact rate"
        icon="contacted"
        isRate
      />
      <KPICard
        title="Closed"
        value={summary.closed}
        change={closeRate}
        changeLabel="close rate"
        icon="closed"
        isRate
      />
    </div>
  );
}
