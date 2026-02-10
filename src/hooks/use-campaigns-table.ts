/**
 * Campaign Table Hook
 * Story 5.4: Campaign Table
 *
 * TanStack Query v5 hook for fetching paginated and sortable campaign data
 * Uses object syntax per project context requirements
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchCampaignStats } from '@/lib/api/campaigns';
import { CampaignApiError } from '@/types/campaigns';
import type {
  CampaignTableParams,
  CampaignStatsResponse,
  CampaignSortBy,
} from '@/types/campaigns';

export interface UseCampaignsTableOptions extends CampaignTableParams {
  enabled?: boolean;
}

export interface UseCampaignsTableReturn {
  data: CampaignStatsResponse | undefined;
  isPending: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: CampaignApiError | null;
  refetch: () => void;
}

/**
 * Type guard for CampaignApiError
 * Handles both instance checks and duck-typing for serialized errors
 */
function isCampaignApiError(error: unknown): error is CampaignApiError {
  if (error instanceof CampaignApiError) {
    return true;
  }
  // Duck-type check for serialized errors (lost prototype during serialization)
  if (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === 'CampaignApiError'
  ) {
    return true;
  }
  return false;
}

/**
 * Extract error message from any error type
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}

/**
 * Custom hook for campaign table with pagination and sorting
 * @param options - Pagination, sorting, and enabled options
 * @returns Query result with data, loading, error states
 */
export function useCampaignsTable(
  options: UseCampaignsTableOptions = {}
): UseCampaignsTableReturn {
  const {
    page = 1,
    limit = 20,
    sortBy = 'Last_Updated' as CampaignSortBy,
    sortOrder = 'desc',
    dateFrom,
    dateTo,
    enabled = true,
  } = options;

  const query = useQuery({
    // Story 5.8: Include date params in query key for cache separation
    queryKey: ['campaigns', 'table', { page, limit, sortBy, sortOrder, dateFrom, dateTo }],
    queryFn: () => fetchCampaignStats({ page, limit, sortBy, sortOrder, dateFrom, dateTo }),
    staleTime: 10 * 1000, // 10 seconds - near real-time
    gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection time (TanStack Query v5)
    refetchInterval: 10 * 1000, // Auto-refresh every 10 seconds
    retry: 2,
    enabled,
    // Keep previous data while fetching new page/sort (UX improvement)
    placeholderData: keepPreviousData,
  });

  // Create error object that preserves message even for non-CampaignApiError
  const errorObj = query.error
    ? isCampaignApiError(query.error)
      ? query.error
      : new CampaignApiError(getErrorMessage(query.error))
    : null;

  return {
    data: query.data,
    isPending: query.isPending,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: errorObj,
    refetch: query.refetch,
  };
}
