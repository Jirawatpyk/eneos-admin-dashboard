/**
 * Campaign Types
 * Story 5.3: Campaign Summary Cards
 *
 * Types for campaign stats API and components
 */

/**
 * Individual campaign stats from backend API
 */
export interface CampaignStatsItem {
  campaignId: number;
  campaignName: string;
  delivered: number;
  opened: number;
  clicked: number;
  uniqueOpens: number;
  uniqueClicks: number;
  openRate: number;
  clickRate: number;
  hardBounce: number;
  softBounce: number;
  unsubscribe: number;
  spam: number;
  firstEvent: string;
  lastUpdated: string;
}

/**
 * Pagination info from API
 */
export interface CampaignStatsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * API response for campaign stats endpoint
 * Backend wraps data in: { success, data: { data: [...], pagination: {...} } }
 */
export interface CampaignStatsResponse {
  success: boolean;
  data: {
    data: CampaignStatsItem[];
    pagination: CampaignStatsPagination;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Aggregated campaign stats for KPI cards display
 */
export interface CampaignAggregate {
  totalCampaigns: number;
  delivered: number;
  opened: number;
  clicked: number;
  uniqueOpens: number;
  uniqueClicks: number;
  openRate: number;
  clickRate: number;
}

/**
 * Custom error class for campaign API errors
 */
export class CampaignApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'CampaignApiError';
  }
}
