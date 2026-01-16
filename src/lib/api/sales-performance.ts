/**
 * Sales Performance API Functions
 * Story 3.1: Sales Team Performance Table
 * Story 3.6: Period Filter for Sales Performance
 *
 * Fetches sales performance data from backend API
 * Follows project context rules:
 * - Uses /api/admin/sales-performance endpoint
 * - Handles { success, data, error } response pattern
 */

import type {
  SalesPerformanceData,
  SalesPerformanceResponse,
} from '@/types/sales';

// Use Next.js API route as proxy to Backend (handles authentication)
const API_BASE_URL = '';

export class SalesApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'SalesApiError';
  }
}

/**
 * Parameters for fetching sales performance data
 * Story 3.6: Period Filter support
 */
export interface FetchSalesPerformanceParams {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Fetch sales team performance data from backend API
 * @param params - Optional period and date range parameters (Story 3.6)
 * @returns Sales performance data with team metrics and summary
 * @throws SalesApiError on failure
 */
export async function fetchSalesPerformance(
  params?: FetchSalesPerformanceParams
): Promise<SalesPerformanceData> {
  // Build URL with query params
  const queryParams = new URLSearchParams();

  if (params?.period) {
    // Map frontend period to backend period
    // Backend expects: 'today', 'week', 'month', 'quarter', 'year', 'custom'
    // Frontend sends: 'week', 'month', 'quarter', 'lastQuarter', 'custom'
    if (params.period === 'lastQuarter') {
      // For lastQuarter, we use custom with calculated dates
      queryParams.set('period', 'custom');
    } else {
      queryParams.set('period', params.period);
    }
  }

  if (params?.dateFrom) {
    queryParams.set('startDate', params.dateFrom);
  }

  if (params?.dateTo) {
    queryParams.set('endDate', params.dateTo);
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/api/admin/sales-performance${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for auth
  });

  // Handle 503 (circuit breaker) gracefully per project context
  if (response.status === 503) {
    throw new SalesApiError(
      'Service temporarily unavailable. Please try again later.',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  if (!response.ok) {
    throw new SalesApiError(
      `Failed to fetch sales performance data: ${response.statusText}`,
      response.status
    );
  }

  const result: SalesPerformanceResponse = await response.json();

  // Handle backend error response
  if (!result.success) {
    throw new SalesApiError(
      result.error?.message || 'Unknown error occurred',
      response.status,
      result.error?.code
    );
  }

  // Validate that data exists even when success is true
  if (!result.data || !result.data.teamPerformance) {
    throw new SalesApiError(
      'Invalid response: missing data',
      response.status,
      'INVALID_RESPONSE'
    );
  }

  return result.data;
}
