/**
 * Sales Performance Data Hook
 * Story 3.1: Sales Team Performance Table
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

interface UseSalesPerformanceOptions {
  enabled?: boolean;
}

export interface UseSalesPerformanceReturn {
  data: SalesPerformanceData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: SalesApiError | null;
  refetch: () => void;
}

/**
 * Type guard for SalesApiError
 */
function isSalesApiError(error: unknown): error is SalesApiError {
  return error instanceof SalesApiError;
}

/**
 * Custom hook for sales performance data
 * @param options - enabled flag
 * @returns Query result with data, loading, error states
 */
export function useSalesPerformance(
  options: UseSalesPerformanceOptions = {}
): UseSalesPerformanceReturn {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['sales-performance'],
    queryFn: () => fetchSalesPerformance(),
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
  };
}
