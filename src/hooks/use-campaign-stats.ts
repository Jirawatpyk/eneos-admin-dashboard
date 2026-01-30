/**
 * Campaign Stats Hook
 * Story 5.3: Campaign Summary Cards
 *
 * TanStack Query v5 hook for fetching campaign stats
 * Uses object syntax per project context requirements
 */

import { useQuery } from '@tanstack/react-query';
import { fetchCampaignStats, aggregateCampaignStats } from '@/lib/api/campaigns';
import { CampaignApiError } from '@/types/campaigns';
import type { CampaignAggregate } from '@/types/campaigns';

export interface UseCampaignStatsOptions {
  enabled?: boolean;
}

export interface UseCampaignStatsReturn {
  data: CampaignAggregate | undefined;
  isLoading: boolean;
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
 * Custom hook for campaign stats
 * @param options - enabled flag
 * @returns Query result with aggregated data, loading, error states
 */
export function useCampaignStats(
  options: UseCampaignStatsOptions = {}
): UseCampaignStatsReturn {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['campaigns', 'stats'],
    queryFn: async () => {
      // Fetch all campaigns (set high limit to get all for aggregation)
      // NOTE: If >100 campaigns exist, consider pagination loop or backend summary endpoint
      const response = await fetchCampaignStats({ limit: 100 });
      // Extract campaigns array from nested response: { data: { data: [...] } }
      return aggregateCampaignStats(response.data.data);
    },
    staleTime: 60 * 1000, // 1 minute - rate limit aware
    gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection time (TanStack Query v5)
    retry: 2,
    enabled,
  });

  // Create error object that preserves message even for non-CampaignApiError
  const errorObj = query.error
    ? isCampaignApiError(query.error)
      ? query.error
      : new CampaignApiError(getErrorMessage(query.error))
    : null;

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: errorObj,
    refetch: query.refetch,
  };
}
