/**
 * Campaign API Functions
 * Story 5.3: Campaign Summary Cards
 *
 * Fetches campaign stats from backend API
 * Follows project context rules:
 * - Uses /api/admin/campaigns/stats endpoint
 * - Handles { success, data, error } response pattern
 */

import type {
  CampaignStatsResponse,
  CampaignAggregate,
  CampaignStatsItem,
  CampaignTableParams,
  CampaignEventsParams,
  CampaignEventsResponse,
} from '@/types/campaigns';
import { CampaignApiError } from '@/types/campaigns';

// Use Next.js API route as proxy to Backend (handles authentication)
const API_BASE_URL = '';

/**
 * Fetch campaign stats from backend API
 * @param params - Pagination and sorting parameters
 * @returns Campaign stats response with array of campaigns
 * @throws CampaignApiError on failure
 */
export async function fetchCampaignStats(
  params: CampaignTableParams = {}
): Promise<CampaignStatsResponse> {
  const { page = 1, limit = 20, sortBy, sortOrder, dateFrom, dateTo } = params;

  // Build query string
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  // Only add sorting params if provided (API has defaults)
  if (sortBy) searchParams.set('sortBy', sortBy);
  if (sortOrder) searchParams.set('sortOrder', sortOrder);
  // Story 5.8: Date filter params
  if (dateFrom) searchParams.set('dateFrom', dateFrom);
  if (dateTo) searchParams.set('dateTo', dateTo);

  const url = `${API_BASE_URL}/api/admin/campaigns/stats?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for auth
  });

  // Handle 503 (circuit breaker) gracefully per project context
  if (response.status === 503) {
    throw new CampaignApiError(
      'Campaign service temporarily unavailable',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  if (!response.ok) {
    throw new CampaignApiError(
      `Failed to fetch campaign stats: ${response.statusText}`,
      response.status
    );
  }

  const result: CampaignStatsResponse = await response.json();

  // Handle backend error response
  if (!result.success) {
    throw new CampaignApiError(
      result.error?.message || 'Unknown error occurred',
      response.status,
      result.error?.code
    );
  }

  // Validate that data structure is correct
  if (!result.data || !Array.isArray(result.data.data)) {
    throw new CampaignApiError(
      'Invalid response format from server',
      response.status,
      'INVALID_RESPONSE'
    );
  }

  return result;
}

/**
 * Aggregate campaign stats for KPI cards display
 * Calculates totals and rates across all campaigns
 * @param campaigns - Array of campaign stats from API
 * @returns Aggregated stats for display
 */
export function aggregateCampaignStats(campaigns: CampaignStatsItem[]): CampaignAggregate {
  const totalCampaigns = campaigns.length;

  const totals = campaigns.reduce(
    (acc, campaign) => ({
      delivered: acc.delivered + campaign.delivered,
      opened: acc.opened + campaign.opened,
      clicked: acc.clicked + campaign.clicked,
      uniqueOpens: acc.uniqueOpens + campaign.uniqueOpens,
      uniqueClicks: acc.uniqueClicks + campaign.uniqueClicks,
    }),
    { delivered: 0, opened: 0, clicked: 0, uniqueOpens: 0, uniqueClicks: 0 }
  );

  // Calculate aggregated rates (avoid division by zero)
  const openRate = totals.delivered > 0
    ? (totals.uniqueOpens / totals.delivered) * 100
    : 0;
  const clickRate = totals.delivered > 0
    ? (totals.uniqueClicks / totals.delivered) * 100
    : 0;

  return {
    totalCampaigns,
    ...totals,
    openRate: Number(openRate.toFixed(1)),
    clickRate: Number(clickRate.toFixed(1)),
  };
}

/**
 * Fetch campaign events for detail sheet
 * Story 5.7: Campaign Detail Sheet (AC#3)
 * @param params - Campaign ID, pagination, and filter parameters
 * @returns Campaign events response with array of events
 * @throws CampaignApiError on failure
 */
export async function fetchCampaignEvents(
  params: CampaignEventsParams
): Promise<CampaignEventsResponse> {
  const { campaignId, page = 1, limit = 20, event, dateFrom, dateTo } = params;

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (event) searchParams.set('event', event);
  if (dateFrom) searchParams.set('dateFrom', dateFrom);
  if (dateTo) searchParams.set('dateTo', dateTo);

  const url = `${API_BASE_URL}/api/admin/campaigns/${campaignId}/events?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (response.status === 503) {
    throw new CampaignApiError(
      'Campaign service temporarily unavailable',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  if (response.status === 404) {
    throw new CampaignApiError(
      'Campaign not found',
      404,
      'NOT_FOUND'
    );
  }

  if (!response.ok) {
    throw new CampaignApiError(
      `Failed to fetch campaign events: ${response.statusText}`,
      response.status
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new CampaignApiError(
      result.error?.message || 'Unknown error occurred',
      response.status,
      result.error?.code
    );
  }

  return result;
}

// Re-export for convenience
export { CampaignApiError } from '@/types/campaigns';
