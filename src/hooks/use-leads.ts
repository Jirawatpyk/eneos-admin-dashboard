/**
 * Leads Hook
 * Story 4.1: Lead List Table
 *
 * TanStack Query v5 hook for fetching leads list
 * Uses object syntax per project context requirements
 */

import { useQuery } from '@tanstack/react-query';
import { fetchLeads, LeadsApiError } from '@/lib/api/leads';
import type { Lead, LeadsQueryParams, LeadsPagination } from '@/types/lead';

export interface UseLeadsOptions extends LeadsQueryParams {
  enabled?: boolean;
}

export interface UseLeadsReturn {
  data: Lead[] | undefined;
  pagination: LeadsPagination | undefined;
  isLoading: boolean;
  isError: boolean;
  error: LeadsApiError | null;
  refetch: () => void;
}

/**
 * Type guard for LeadsApiError
 */
function isLeadsApiError(error: unknown): error is LeadsApiError {
  return error instanceof LeadsApiError;
}

/**
 * Custom hook for leads list data
 * @param options - Query parameters and enabled flag
 * @returns Query result with leads, pagination, loading, error states
 */
export function useLeads(options: UseLeadsOptions = {}): UseLeadsReturn {
  const {
    enabled = true,
    page = 1,
    limit = 50,
    status,
    salesOwnerId,
    search,
    sortBy = 'createdAt',
    sortDir = 'desc',
  } = options;

  const queryParams: LeadsQueryParams = {
    page,
    limit,
    status,
    salesOwnerId,
    search,
    sortBy,
    sortDir,
  };

  const query = useQuery({
    queryKey: ['leads', queryParams],
    queryFn: () => fetchLeads(queryParams),
    staleTime: 60 * 1000, // 1 minute - rate limit aware
    gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection time (TanStack Query v5)
    retry: 2,
    enabled,
  });

  return {
    data: query.data?.leads,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: isLeadsApiError(query.error) ? query.error : null,
    refetch: query.refetch,
  };
}
