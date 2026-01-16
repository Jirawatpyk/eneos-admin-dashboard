/**
 * Performance Table Container Component
 * Story 3.1: Sales Team Performance Table
 * Story 3.2: Conversion Rate Analytics
 * Story 3.3: Sales Performance Bar Chart
 *
 * AC#1-8: Container component that handles:
 * - Data fetching with useSalesPerformance hook
 * - Loading/error/empty states
 * - Passing data to presentation component
 * - Summary cards integration (Story 3.2)
 * - Bar chart integration (Story 3.3)
 * - Filter and highlight callbacks (Story 3.2, 3.3)
 */
'use client';

import { useState, useCallback } from 'react';
import { useSalesPerformance } from '@/hooks/use-sales-performance';
import { PerformanceTable } from './performance-table';
import { PerformanceTableSkeleton } from './performance-table-skeleton';
import { PerformanceTableEmpty } from './performance-table-empty';
import { PerformanceTableError } from './performance-table-error';
import { ConversionSummaryCards } from './conversion-summary-cards';
import { ConversionSummarySkeleton } from './conversion-summary-skeleton';
import { PerformanceBarChart } from './performance-bar-chart';
import { PerformanceBarChartSkeleton } from './performance-bar-chart-skeleton';
import { CONVERSION_THRESHOLDS } from '@/lib/sales-constants';

export function PerformanceTableContainer() {
  const { data, isLoading, isError, error, refetch } = useSalesPerformance();
  const [filterBelowThreshold, setFilterBelowThreshold] = useState(false);
  // Track highlighted row for best performer highlight effect
  const [highlightedUserId, setHighlightedUserId] = useState<string | null>(null);

  // AC#4 (Story 3.2): Filter table to show only sales below threshold
  const handleFilterNeedsImprovement = useCallback(() => {
    setFilterBelowThreshold((prev) => !prev); // Toggle filter
  }, []);

  // AC#3 (Story 3.2): Scroll to and highlight best performer row
  const handleHighlightBestPerformer = useCallback((userId: string) => {
    // Set highlight state for React-controlled styling
    setHighlightedUserId(userId);

    // Scroll to the row
    const row = document.querySelector(`[data-testid="performance-row-${userId}"]`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Clear highlight after 2 seconds
    setTimeout(() => {
      setHighlightedUserId(null);
    }, 2000);
  }, []);

  // Apply filter if enabled
  const filteredData = filterBelowThreshold && data?.teamPerformance
    ? data.teamPerformance.filter((p) => p.conversionRate < CONVERSION_THRESHOLDS.NEEDS_IMPROVEMENT)
    : data?.teamPerformance;

  // Check if filter results in empty set
  const isFilterEmpty = filterBelowThreshold && filteredData?.length === 0;

  // AC#8: Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <ConversionSummarySkeleton />
        <PerformanceBarChartSkeleton />
        <PerformanceTableSkeleton />
      </div>
    );
  }

  // AC#8: Error state with retry
  if (isError) {
    return (
      <PerformanceTableError
        message={error?.message || 'Failed to load sales performance data'}
        onRetry={refetch}
      />
    );
  }

  // AC#8: Empty state
  if (!data || !data.teamPerformance || data.teamPerformance.length === 0) {
    return <PerformanceTableEmpty />;
  }

  // AC#1-7, 9: Render summary cards and table with data
  return (
    <div className="space-y-6">
      {/* Story 3.2: Conversion Summary Cards */}
      <ConversionSummaryCards
        data={data}
        isLoading={false}
        onFilterNeedsImprovement={handleFilterNeedsImprovement}
        onHighlightBestPerformer={handleHighlightBestPerformer}
      />

      {/* Story 3.3: Performance Bar Chart */}
      <PerformanceBarChart
        data={data.teamPerformance}
        onBarClick={handleHighlightBestPerformer}
      />

      {/* Filter indicator */}
      {filterBelowThreshold && (
        <div
          className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-3"
          data-testid="filter-indicator"
        >
          <span className="text-sm text-amber-800">
            {isFilterEmpty
              ? 'No sales below 10% threshold'
              : `Showing ${filteredData?.length || 0} sales below 10% threshold`}
          </span>
          <button
            onClick={() => setFilterBelowThreshold(false)}
            className="text-sm text-amber-600 hover:text-amber-800 underline"
            data-testid="clear-filter-button"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Story 3.1: Performance Table */}
      {!isFilterEmpty && (
        <PerformanceTable
          data={filteredData || []}
          highlightedUserId={highlightedUserId}
        />
      )}

      {/* Empty filter results message */}
      {isFilterEmpty && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-testid="filter-empty-state"
        >
          <p className="text-lg font-medium">Everyone is on track!</p>
          <p className="text-sm mt-1">
            No team members have conversion rates below {CONVERSION_THRESHOLDS.NEEDS_IMPROVEMENT}%
          </p>
        </div>
      )}
    </div>
  );
}
