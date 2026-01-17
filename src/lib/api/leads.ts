/**
 * Leads API Functions
 * Story 4.1: Lead List Table
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
} from '@/types/lead';

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
 */
function buildQueryString(params: LeadsQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.salesOwnerId) searchParams.set('salesOwnerId', params.salesOwnerId);
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);

  return searchParams.toString();
}

/**
 * Fetch leads list from API
 * @param params - Query parameters for filtering/pagination
 * @returns Leads data with pagination info
 * @throws LeadsApiError on failure
 */
export async function fetchLeads(
  params: LeadsQueryParams = {}
): Promise<{ leads: Lead[]; pagination: LeadsResponse['pagination'] }> {
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
    leads: result.data,
    pagination: result.pagination,
  };
}

/**
 * Fetch single lead by ID (row number)
 * @param id - Lead row number
 * @returns Lead details
 * @throws LeadsApiError on failure
 */
export async function fetchLeadById(id: number): Promise<Lead> {
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
