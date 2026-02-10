/**
 * Single Lead Hook
 * Story 4.1: Lead List Table
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * TanStack Query v5 hook for fetching single lead details
 * Used by LeadDetailSheet component
 */

import { useQuery } from '@tanstack/react-query';
import { fetchLeadById, LeadsApiError } from '@/lib/api/leads';
import type { LeadDetail } from '@/types/lead-detail';

export interface UseLeadOptions {
  enabled?: boolean;
}

export interface UseLeadReturn {
  /** Lead detail data with history and metrics */
  data: LeadDetail | undefined;
  /** True while fetching data */
  isLoading: boolean;
  /** True if fetch failed */
  isError: boolean;
  /** Error object if fetch failed */
  error: LeadsApiError | null;
  /** Function to manually refetch data */
  refetch: () => void;
}

/**
 * Type guard for LeadsApiError
 */
function isLeadsApiError(error: unknown): error is LeadsApiError {
  return error instanceof LeadsApiError;
}

/**
 * Custom hook for single lead data with enhanced details
 * Story 4.8: AC#1, AC#5, AC#9
 *
 * @param id - Lead UUID (undefined to skip query)
 * @param options - Query options
 * @returns Query result with lead detail data, loading, error states
 */
export function useLead(
  id: string | undefined,
  options: UseLeadOptions = {}
): UseLeadReturn {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLeadById(id!),
    // AC#9: staleTime 30 seconds for cache invalidation
    staleTime: 30 * 1000,
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // AC#5: Retry logic (2 retries for transient failures)
    retry: 2,
    // AC#1: Only fetch when id is defined and enabled
    enabled: enabled && !!id,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: isLeadsApiError(query.error) ? query.error : null,
    refetch: query.refetch,
  };
}
