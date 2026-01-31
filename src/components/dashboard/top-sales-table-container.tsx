/**
 * Top Sales Table Container Component
 * Story 2.4: Top Sales Table
 *
 * Container component that handles data fetching and passes to presentational component
 */
'use client';

import { useDashboardData } from '@/hooks/use-dashboard-data';
import { TopSalesTable } from './top-sales-table';
import { DashboardError } from './dashboard-error';

export function TopSalesTableContainer() {
  const { data, isLoading, isError, error, refetch } = useDashboardData();

  // Error state
  if (isError && error) {
    return (
      <DashboardError
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  // Extract topSales data or empty array
  const topSalesData = data?.topSales || [];

  return <TopSalesTable data={topSalesData} isLoading={isLoading} />;
}
