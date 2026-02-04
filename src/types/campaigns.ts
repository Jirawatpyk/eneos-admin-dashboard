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

/**
 * Story 5.4: Campaign Table Types
 */

/**
 * Valid sort columns for campaign table
 */
export type CampaignSortBy =
  | 'Last_Updated'
  | 'First_Event'
  | 'Campaign_Name'
  | 'Delivered'
  | 'Opened'
  | 'Clicked'
  | 'Open_Rate'
  | 'Click_Rate';

/**
 * Parameters for campaign table API request
 */
export interface CampaignTableParams {
  page?: number;
  limit?: number;
  sortBy?: CampaignSortBy;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;  // ISO 8601
  dateTo?: string;    // ISO 8601
}

/**
 * Story 5.8: Campaign Date Filter Types
 */

/**
 * Valid period values for campaign date filter
 */
export type CampaignPeriod = 'allTime' | 'today' | 'week' | 'month' | 'lastMonth' | 'custom';

/**
 * Parameters returned by the campaign date filter hook
 */
export interface CampaignDateFilterParams {
  period: CampaignPeriod;
  dateFrom?: string;  // ISO 8601
  dateTo?: string;    // ISO 8601
}

/**
 * Story 5.6: Chart-specific type for campaign performance chart
 */
export interface ChartDataItem {
  campaignName: string;
  campaignId: number;
  openRate: number;
  clickRate: number;
  delivered: number;
}

/**
 * Story 5.7: Campaign Detail Sheet Types
 */

/**
 * Individual campaign event from backend API
 */
export interface CampaignEventItem {
  eventId: number;
  email: string;
  event: 'delivered' | 'opened' | 'click';
  eventAt: string;
  url: string | null;
  // Contact data from Campaign_Contacts (Story 5-11)
  firstname: string;
  lastname: string;
  company: string;
}

/**
 * API response for campaign events endpoint
 */
export interface CampaignEventsResponse {
  success: boolean;
  data: {
    data: CampaignEventItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Parameters for campaign events API request
 */
export interface CampaignEventsParams {
  campaignId: number;
  page?: number;
  limit?: number;
  event?: 'delivered' | 'opened' | 'click';
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Event type filter options (includes 'all' for UI filter tabs)
 */
export type CampaignEventType = 'all' | 'delivered' | 'opened' | 'click';

/**
 * Combined filter state for campaign event log UI
 */
export interface CampaignEventsFilters {
  eventType: CampaignEventType;
  search: string;
  dateFrom: string | null;
  dateTo: string | null;
}
