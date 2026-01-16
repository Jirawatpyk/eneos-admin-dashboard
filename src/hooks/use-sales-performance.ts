/**
 * Sales Performance Data Hook
 * Story 3.1: Sales Team Performance Table
 * Story 3.6: Period Filter for Sales Performance
 *
 * TanStack Query v5 hook for fetching sales performance data
 * Uses object syntax per project context requirements
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchSalesPerformance,
  SalesApiError,
} from '@/lib/api/sales-performance';
import type { SalesPerformanceData } from '@/types/sales';
import { useSalesPeriodFilter } from './use-sales-period-filter';

interface UseSalesPerformanceOptions {
  enabled?: boolean;
}

export interface UseSalesPerformanceReturn {
  data: SalesPerformanceData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: SalesApiError | null;
  refetch: () => void;
  /** Current period from URL (Story 3.6) */
  period: string;
  /** Date range from/to (Story 3.6) */
  dateRange: { from: Date; to: Date };
}

/**
 * Type guard for SalesApiError
 */
function isSalesApiError(error: unknown): error is SalesApiError {
  return error instanceof SalesApiError;
}

/**
 * Custom hook for sales performance data with period filtering
 * Story 3.6: Integrates with useSalesPeriodFilter for date range
 *
 * @param options - enabled flag
 * @returns Query result with data, loading, error states, and period info
 */
export function useSalesPerformance(
  options: UseSalesPerformanceOptions = {}
): UseSalesPerformanceReturn {
  const { enabled = true } = options;

  // Story 3.6: Get period and date range from URL
  const { period, from, to } = useSalesPeriodFilter();

  const query = useQuery({
    // Story 3.6 AC#8: Include period/dates in query key for proper caching
    queryKey: ['sales-performance', period, from.toISOString(), to.toISOString()],
    queryFn: () =>
      fetchSalesPerformance({
        period,
        dateFrom: from.toISOString(),
        dateTo: to.toISOString(),
      }),
    staleTime: 60 * 1000, // 1 minute - rate limit aware (AC#3.4)
    gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection time (TanStack Query v5)
    retry: 2, // Retry twice on failure (AC#3.5)
    enabled,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: isSalesApiError(query.error) ? query.error : null,
    refetch: query.refetch,
    period,
    dateRange: { from, to },
  };
}
