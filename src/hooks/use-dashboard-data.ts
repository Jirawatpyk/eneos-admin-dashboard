/**
 * Dashboard Data Hook
 * Story 2.1: KPI Cards
 *
 * TanStack Query v5 hook for fetching dashboard data
 * Uses object syntax per project context requirements
 *
 * Default: reads period from URL via useDashboardPeriod() — no prop drilling.
 * Override: pass explicit period/startDate/endDate for non-URL use cases
 *           (e.g. useQuickReports fetches today/week/month in parallel).
 */

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData, DashboardApiError } from '@/lib/api/dashboard';
import { useDashboardPeriod } from './use-dashboard-period';
import type { DashboardData, DashboardPeriod } from '@/types/dashboard';

interface UseDashboardDataOptions {
  /** Override period (default: read from URL) */
  period?: DashboardPeriod;
  /** Override startDate for custom period (default: read from URL) */
  startDate?: string;
  /** Override endDate for custom period (default: read from URL) */
  endDate?: string;
  enabled?: boolean;
}

export interface UseDashboardDataReturn {
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
 * Reads period from URL by default; pass options to override.
 * @param options - Optional period override and enabled flag
 * @returns Query result with data, loading, error states
 */
export function useDashboardData(
  options: UseDashboardDataOptions = {}
): UseDashboardDataReturn {
  const urlPeriod = useDashboardPeriod();
  const {
    period = urlPeriod.period,
    startDate = urlPeriod.startDate,
    endDate = urlPeriod.endDate,
    enabled = true,
  } = options;

  const query = useQuery({
    queryKey: ['dashboard', period, startDate, endDate],
    queryFn: () => fetchDashboardData(period, startDate, endDate),
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
