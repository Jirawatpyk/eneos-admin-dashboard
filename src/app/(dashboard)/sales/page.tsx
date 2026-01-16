import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  PerformanceTableContainer,
  PerformanceTableSkeleton,
  SalesPeriodFilter,
  ConversionSummarySkeleton,
  PerformanceBarChartSkeleton,
} from '@/components/sales';

/**
 * Sales Performance Page
 * Story 3.1: Sales Team Performance Table
 * Story 3.6: Period Filter for Sales Performance
 *
 * Server Component that renders the Sales Performance content
 * Protected by middleware authentication
 *
 * Note: PerformanceTableContainer includes all sub-components:
 * - ConversionSummaryCards (Story 3.2)
 * - PerformanceBarChart (Story 3.3)
 * - ResponseTimeCard (Story 3.4)
 * - PerformanceTable (Story 3.1)
 */

export const metadata: Metadata = {
  title: 'Sales Performance - ENEOS Admin',
  description: 'View and analyze sales team performance metrics',
};

/**
 * Loading skeleton for the full container
 */
function PerformanceContainerSkeleton() {
  return (
    <div className="space-y-6">
      <ConversionSummarySkeleton />
      <PerformanceBarChartSkeleton />
      <PerformanceTableSkeleton />
    </div>
  );
}

export default function SalesPage() {
  return (
    <div className="space-y-6">
      {/* Header with Period Filter (Story 3.6 AC#1) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Sales Team Performance
          </h1>
          <p className="text-muted-foreground">
            View individual performance metrics and track your team&apos;s success
          </p>
        </div>
        {/* Period Filter - wrapped in Suspense for useSearchParams */}
        <Suspense fallback={<div className="h-10 w-[180px] animate-pulse bg-muted rounded-md" />}>
          <SalesPeriodFilter />
        </Suspense>
      </div>

      {/* All Sales Components (Story 3.1-3.4) - data managed by container */}
      <Suspense fallback={<PerformanceContainerSkeleton />}>
        <PerformanceTableContainer />
      </Suspense>
    </div>
  );
}
