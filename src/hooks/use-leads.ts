/**
 * Leads Hook
 * Story 4.1: Lead List Table
 * Story 4.2: Pagination - Added keepPreviousData and isFetching
 * Story 4.3: Search - Added search parameter support (AC#3, AC#4)
 * Story 4.5: Owner Filter - Added owner parameter support (AC#4, AC#6)
 * Story 4.6: Date Filter - Added from/to parameter support (AC#5, AC#6)
 * Story 4.14: Lead Source Filter - Added leadSource parameter support (AC#4, AC#6)
 *
 * TanStack Query v5 hook for fetching leads list
 * Uses object syntax per project context requirements
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchLeads, LeadsApiError } from '@/lib/api/leads';
import type { Lead, LeadsQueryParams, LeadsPagination, LeadsAvailableFilters } from '@/types/lead';

export interface UseLeadsOptions extends LeadsQueryParams {
  enabled?: boolean;
}

export interface UseLeadsReturn {
  data: Lead[] | undefined;
  pagination: LeadsPagination | undefined;
  /** Story 4.14: Available filter options from backend */
  availableFilters: LeadsAvailableFilters | undefined;
  isLoading: boolean;
  /** Use isFetching (not isLoading) for pagination transitions - AC#5 */
  isFetching: boolean;
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
    limit = 20, // Story 4.2 AC#2: Default page size is 20
    status,
    salesOwnerId,
    owner, // Story 4.5: Owner filter (multi-select)
    search,
    sortBy = 'createdAt',
    sortDir = 'desc',
    from, // Story 4.6: Date filter - start date
    to, // Story 4.6: Date filter - end date
    leadSource, // Story 4.14: Lead source filter
  } = options;

  const queryParams: LeadsQueryParams = {
    page,
    limit,
    status,
    salesOwnerId,
    owner, // Story 4.5 AC#4: Pass owner filter to API
    search,
    sortBy,
    sortDir,
    from, // Story 4.6 AC#5: Pass date filter to API
    to, // Story 4.6 AC#5: Pass date filter to API
    leadSource, // Story 4.14 AC#4: Pass lead source filter to API
  };

  const query = useQuery({
    // Story 4.5 AC#6, Story 4.6 AC#6: Include filters in queryKey for proper cache invalidation
    queryKey: ['leads', queryParams],
    queryFn: () => fetchLeads(queryParams),
    staleTime: 60 * 1000, // 1 minute - rate limit aware
    gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection time (TanStack Query v5)
    retry: 2,
    enabled,
    // Story 4.2 AC#5: Keep previous data during pagination for smooth transitions
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data?.leads,
    pagination: query.data?.pagination,
    // Story 4.14: Available filters for LeadSourceFilter
    availableFilters: query.data?.availableFilters,
    isLoading: query.isLoading,
    // Story 4.2 AC#5: Use isFetching (not isLoading) for pagination transitions
    isFetching: query.isFetching,
    isError: query.isError,
    error: isLeadsApiError(query.error) ? query.error : null,
    refetch: query.refetch,
  };
}
