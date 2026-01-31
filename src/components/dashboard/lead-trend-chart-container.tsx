/**
 * Lead Trend Chart Container
 * Story 2.2: Lead Trend Chart
 *
 * Wrapper component that integrates with useDashboardData hook
 * Passes trends.daily data to LeadTrendChart component
 */
'use client';

import { LeadTrendChart } from './lead-trend-chart';
import { useDashboardData } from '@/hooks/use-dashboard-data';

/**
 * Container component that fetches data and renders LeadTrendChart
 */
export function LeadTrendChartContainer() {
  const { data, isLoading } = useDashboardData();

  return (
    <LeadTrendChart
      data={data?.trends?.daily}
      isLoading={isLoading}
    />
  );
}
