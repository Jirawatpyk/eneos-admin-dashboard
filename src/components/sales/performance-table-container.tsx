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

import { useState, useCallback, useEffect, useRef } from 'react';
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
import { RESPONSE_TIME_THRESHOLDS } from '@/lib/format-sales';

export function PerformanceTableContainer() {
  const { data, isLoading, isError, error, refetch } = useSalesPerformance();
  const [filterBelowThreshold, setFilterBelowThreshold] = useState(false);
  // Story 3.4: Filter slow responders (avgResponseTime > 60 min)
  const [filterSlowResponders, setFilterSlowResponders] = useState(false);
  // Track highlighted row for best performer highlight effect
  const [highlightedUserId, setHighlightedUserId] = useState<string | null>(null);
  // Ref to track highlight timeout for cleanup
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  // AC#4 (Story 3.2): Filter table to show only sales below threshold
  const handleFilterNeedsImprovement = useCallback(() => {
    setFilterBelowThreshold((prev) => !prev); // Toggle filter
    setFilterSlowResponders(false); // Clear other filter
  }, []);

  // AC#6 (Story 3.4): Filter table to show only slow responders
  const handleFilterSlowResponders = useCallback(() => {
    setFilterSlowResponders((prev) => !prev); // Toggle filter
    setFilterBelowThreshold(false); // Clear other filter
  }, []);

  // AC#3 (Story 3.2): Scroll to and highlight best performer row
  const handleHighlightBestPerformer = useCallback((userId: string) => {
    // Clear any existing timeout to prevent stale callbacks
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    // Set highlight state for React-controlled styling
    setHighlightedUserId(userId);

    // Scroll to the row
    const row = document.querySelector(`[data-testid="performance-row-${userId}"]`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Clear highlight after 2 seconds
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedUserId(null);
    }, 2000);
  }, []);

  // Apply filters if enabled
  let filteredData = data?.teamPerformance;
  if (filterBelowThreshold && data?.teamPerformance) {
    filteredData = data.teamPerformance.filter(
      (p) => p.conversionRate < CONVERSION_THRESHOLDS.NEEDS_IMPROVEMENT
    );
  } else if (filterSlowResponders && data?.teamPerformance) {
    // Story 3.4 AC#6: Filter slow responders (> 60 min, exactly 60 is acceptable)
    filteredData = data.teamPerformance.filter(
      (p) => p.avgResponseTime != null && p.avgResponseTime > RESPONSE_TIME_THRESHOLDS.ACCEPTABLE
    );
  }

  // Check if filter results in empty set
  const isFilterEmpty = (filterBelowThreshold || filterSlowResponders) && filteredData?.length === 0;
  const activeFilter = filterBelowThreshold ? 'conversion' : filterSlowResponders ? 'response' : null;

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
      {/* Story 3.2: Conversion Summary Cards + Story 3.4: Response Time Card */}
      <ConversionSummaryCards
        data={data}
        isLoading={false}
        onFilterNeedsImprovement={handleFilterNeedsImprovement}
        onHighlightBestPerformer={handleHighlightBestPerformer}
        onFilterSlowResponders={handleFilterSlowResponders}
      />

      {/* Story 3.3: Performance Bar Chart */}
      <PerformanceBarChart
        data={data.teamPerformance}
        onBarClick={handleHighlightBestPerformer}
      />

      {/* Filter indicator - Conversion Rate */}
      {activeFilter === 'conversion' && (
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

      {/* Story 3.4: Filter indicator - Slow Responders */}
      {activeFilter === 'response' && (
        <div
          className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3"
          data-testid="slow-responders-filter-indicator"
        >
          <span className="text-sm text-red-800">
            {isFilterEmpty
              ? 'All sales are responding within 60 minutes!'
              : `Showing ${filteredData?.length || 0} slow responders (> 60 min)`}
          </span>
          <button
            onClick={() => setFilterSlowResponders(false)}
            className="text-sm text-red-600 hover:text-red-800 underline"
            data-testid="clear-slow-filter-button"
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
      {isFilterEmpty && activeFilter === 'conversion' && (
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

      {/* Story 3.4: Empty slow responders filter message */}
      {isFilterEmpty && activeFilter === 'response' && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-testid="slow-filter-empty-state"
        >
          <p className="text-lg font-medium">Everyone is responding quickly!</p>
          <p className="text-sm mt-1">
            No team members have response times above {RESPONSE_TIME_THRESHOLDS.ACCEPTABLE} minutes
          </p>
        </div>
      )}
    </div>
  );
}
