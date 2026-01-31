/**
 * Campaign Events Hook
 * Story 5.7: Campaign Detail Sheet
 *
 * TanStack Query v5 hook for fetching campaign event log
 * Supports pagination, event type filtering, and date range
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchCampaignEvents } from '@/lib/api/campaigns';
import { CampaignApiError } from '@/types/campaigns';
import type {
  CampaignEventsParams,
  CampaignEventsResponse,
} from '@/types/campaigns';

export interface UseCampaignEventsReturn {
  data: CampaignEventsResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: CampaignApiError | null;
  refetch: () => void;
}

/**
 * Type guard for CampaignApiError
 */
function isCampaignApiError(error: unknown): error is CampaignApiError {
  if (error instanceof CampaignApiError) {
    return true;
  }
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
 * Custom hook for fetching campaign events with pagination and filtering
 * @param params - Campaign ID, pagination, and filter parameters
 * @returns Query result with data, loading, error states
 */
export function useCampaignEvents(
  params: CampaignEventsParams
): UseCampaignEventsReturn {
  const { campaignId, page = 1, limit = 20, event, dateFrom, dateTo } = params;

  const query = useQuery({
    queryKey: ['campaigns', campaignId, 'events', { page, limit, event, dateFrom, dateTo }],
    queryFn: () => fetchCampaignEvents(params),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    retry: 2,
    enabled: !!campaignId,
    placeholderData: keepPreviousData,
  });

  const errorObj = query.error
    ? isCampaignApiError(query.error)
      ? query.error
      : new CampaignApiError(
          query.error instanceof Error ? query.error.message : 'An unexpected error occurred'
        )
    : null;

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: errorObj,
    refetch: query.refetch,
  };
}
