/**
 * Leads API Functions
 * Story 4.1: Lead List Table
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * Fetches leads data from Next.js API proxy route
 * Follows project context rules:
 * - Uses /api/admin/leads endpoint (proxy pattern)
 * - Handles { success, data, error } response pattern
 */

import type {
  Lead,
  LeadsResponse,
  LeadDetailResponse,
  LeadsQueryParams,
  LeadsAvailableFilters,
} from '@/types/lead';
import type { LeadDetail } from '@/types/lead-detail';

// Use Next.js API route as proxy to Backend
const API_BASE_URL = '';

export class LeadsApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'LeadsApiError';
  }
}

/**
 * Build query string from params object
 * Story 4.4: status is now array - join with comma (AC#4)
 * Story 4.5: owner is now array - join with comma (AC#4)
 * Story 4.6: from/to for date filter (AC#5)
 * Story 4.14: leadSource for single-select filter (AC#4)
 */
function buildQueryString(params: LeadsQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  // Story 4.4 AC#4: status array - join with comma for backend
  if (params.status && params.status.length > 0) {
    searchParams.set('status', params.status.join(','));
  }
  // Story 4.5 AC#4: owner array - join with comma for backend
  // Supports 'unassigned' special value for leads without owner
  if (params.owner && params.owner.length > 0) {
    searchParams.set('owner', params.owner.join(','));
  }
  // Deprecated: use owner instead
  if (params.salesOwnerId) searchParams.set('salesOwnerId', params.salesOwnerId);
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  // Story 4.6 AC#5: Date filter params (YYYY-MM-DD format)
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  // Story 4.14 AC#4: Lead source filter (single-select)
  if (params.leadSource) searchParams.set('leadSource', params.leadSource);

  return searchParams.toString();
}

/**
 * Fetch leads list from API
 * @param params - Query parameters for filtering/pagination
 * @returns Leads data with pagination info and available filters
 * @throws LeadsApiError on failure
 * Story 4.14: Added availableFilters to return type
 */
export async function fetchLeads(
  params: LeadsQueryParams = {}
): Promise<{
  leads: Lead[];
  pagination: LeadsResponse['pagination'];
  availableFilters?: LeadsAvailableFilters;
}> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}/api/admin/leads${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  // Handle 503 (circuit breaker) gracefully
  if (response.status === 503) {
    throw new LeadsApiError(
      'Service temporarily unavailable. Please try again later.',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  if (!response.ok) {
    throw new LeadsApiError(
      `Failed to fetch leads: ${response.statusText}`,
      response.status
    );
  }

  const result: LeadsResponse = await response.json();

  // Handle backend error response
  if (!result.success) {
    throw new LeadsApiError(
      result.error?.message || 'Unknown error occurred',
      response.status,
      result.error?.code
    );
  }

  return {
    leads: result.data.leads,
    pagination: result.data.pagination,
    // Story 4.14: Include available filters for LeadSourceFilter
    availableFilters: result.data.availableFilters,
  };
}

/**
 * Fetch single lead by ID (row number)
 * Story 4.8: Returns LeadDetail with history and metrics
 * @param id - Lead row number
 * @returns Lead details with history and metrics
 * @throws LeadsApiError on failure
 */
export async function fetchLeadById(id: number): Promise<LeadDetail> {
  const url = `${API_BASE_URL}/api/admin/leads/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  // Handle 503 (circuit breaker) gracefully
  if (response.status === 503) {
    throw new LeadsApiError(
      'Service temporarily unavailable. Please try again later.',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  if (response.status === 404) {
    throw new LeadsApiError(
      'Lead not found',
      404,
      'NOT_FOUND'
    );
  }

  if (!response.ok) {
    throw new LeadsApiError(
      `Failed to fetch lead details: ${response.statusText}`,
      response.status
    );
  }

  const result: LeadDetailResponse = await response.json();

  // Handle backend error response
  if (!result.success) {
    throw new LeadsApiError(
      result.error?.message || 'Unknown error occurred',
      response.status,
      result.error?.code
    );
  }

  return result.data;
}
