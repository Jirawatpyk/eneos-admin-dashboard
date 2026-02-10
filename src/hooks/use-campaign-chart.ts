/**
 * Campaign Chart Hook
 * Story 5.6: Campaign Performance Chart
 * Story 5.8: Added date filter support (dateFrom/dateTo)
 *
 * TanStack Query v5 hook for fetching and transforming campaign data for chart display.
 * Fetches all campaigns, sorts by openRate descending, and slices to limit.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchCampaignStats } from '@/lib/api/campaigns';
import { CampaignApiError } from '@/types/campaigns';
import type { ChartDataItem } from '@/types/campaigns';

// ===========================================
// Types
// ===========================================

export interface UseCampaignChartOptions {
  limit?: number;
  truncateLength?: number;
  enabled?: boolean;
  dateFrom?: string;  // Story 5.8: ISO 8601 date filter
  dateTo?: string;    // Story 5.8: ISO 8601 date filter
}

export interface UseCampaignChartReturn {
  data: ChartDataItem[] | undefined;
  isPending: boolean;
  isLoading: boolean;
  isError: boolean;
  error: CampaignApiError | null;
  refetch: () => void;
}

// ===========================================
// Helpers
// ===========================================

/**
 * Truncate campaign name for Y-axis readability
 */
export function truncateName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength)}...`;
}

// ===========================================
// Type Guards
// ===========================================

function isCampaignApiError(error: unknown): error is CampaignApiError {
  if (error instanceof CampaignApiError) return true;
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}

// ===========================================
// Hook
// ===========================================

/**
 * Custom hook for campaign performance chart data.
 * Fetches campaigns sorted by Open_Rate desc and slices to the given limit.
 *
 * @param options - limit (5, 10, 20), enabled flag
 * @returns Chart data items, loading/error states, refetch
 */
export function useCampaignChart(
  options: UseCampaignChartOptions = {}
): UseCampaignChartReturn {
  const { limit = 10, truncateLength = 25, enabled = true, dateFrom, dateTo } = options;

  const query = useQuery({
    // Story 5.8: Include date params in query key for cache separation
    queryKey: ['campaigns', 'chart', { dateFrom, dateTo }],
    queryFn: async (): Promise<ChartDataItem[]> => {
      // Fetch all campaigns sorted by Open_Rate descending
      // Story 5.8: Pass date filter params
      const response = await fetchCampaignStats({
        limit: 100,
        sortBy: 'Open_Rate',
        sortOrder: 'desc',
        dateFrom,
        dateTo,
      });

      const campaigns = response.data?.data ?? [];

      // Transform all campaigns (full dataset cached)
      return campaigns.map((c) => ({
        campaignName: c.campaignName,
        campaignId: c.campaignId,
        openRate: c.openRate,
        clickRate: c.clickRate,
        delivered: c.delivered,
      }));
    },
    // Slice to limit and truncate names client-side (AC#8 responsive truncation)
    select: (data) =>
      data.slice(0, limit).map((c) => ({
        ...c,
        campaignName: truncateName(c.campaignName, truncateLength),
      })),
    staleTime: 60 * 1000, // 1 minute - rate limit aware
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled,
  });

  const errorObj = query.error
    ? isCampaignApiError(query.error)
      ? query.error
      : new CampaignApiError(getErrorMessage(query.error))
    : null;

  return {
    data: query.data,
    isPending: query.isPending,
    isLoading: query.isLoading,
    isError: query.isError,
    error: errorObj,
    refetch: query.refetch,
  };
}
