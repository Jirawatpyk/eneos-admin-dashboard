/**
 * Status Distribution Chart Container
 * Story 2.3: Status Distribution Chart
 *
 * Wrapper component that integrates with useDashboardData hook
 * Passes summary data to StatusDistributionChart component
 */
'use client';

import { StatusDistributionChart } from './status-distribution-chart';
import { useDashboardData } from '@/hooks/use-dashboard-data';

/**
 * Container component that fetches data and renders StatusDistributionChart
 */
export function StatusDistributionContainer() {
  const { data, isLoading } = useDashboardData();

  // Provide default values if data is not available
  const summary = data?.summary ?? {
    totalLeads: 0,
    claimed: 0,
    contacted: 0,
    closed: 0,
    lost: 0,
    unreachable: 0,
    conversionRate: 0,
  };

  return (
    <StatusDistributionChart
      data={summary}
      isLoading={isLoading}
    />
  );
}
