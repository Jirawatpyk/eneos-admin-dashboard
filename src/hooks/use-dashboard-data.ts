/**
 * Dashboard Data Hook
 * Story 2.1: KPI Cards
 *
 * TanStack Query v5 hook for fetching dashboard data
 * Uses object syntax per project context requirements
 */

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData, DashboardApiError } from '@/lib/api/dashboard';
import type { DashboardData, DashboardPeriod } from '@/types/dashboard';

interface UseDashboardDataOptions {
  period?: DashboardPeriod;
  enabled?: boolean;
}

interface UseDashboardDataReturn {
  data: DashboardData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: DashboardApiError | null;
  refetch: () => void;
}

/**
 * Type guard for DashboardApiError
 */
function isDashboardApiError(error: unknown): error is DashboardApiError {
  return error instanceof DashboardApiError;
}

/**
 * Custom hook for dashboard data
 * @param options - Period and enabled flag
 * @returns Query result with data, loading, error states
 */
export function useDashboardData(
  options: UseDashboardDataOptions = {}
): UseDashboardDataReturn {
  const { period = 'month', enabled = true } = options;

  const query = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => fetchDashboardData(period),
    staleTime: 60 * 1000, // 1 minute - rate limit aware
    gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection time (TanStack Query v5)
    retry: 2,
    enabled,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: isDashboardApiError(query.error) ? query.error : null,
    refetch: query.refetch,
  };
}
