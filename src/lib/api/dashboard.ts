/**
 * Dashboard API Functions
 * Story 2.1: KPI Cards
 *
 * Fetches dashboard data from backend API
 * Follows project context rules:
 * - Uses /api/admin/dashboard endpoint
 * - Handles { success, data, error } response pattern
 */

import type { DashboardData, DashboardPeriod, DashboardResponse } from '@/types/dashboard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class DashboardApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'DashboardApiError';
  }
}

/**
 * Fetch dashboard data from backend API
 * @param period - Time period filter (week, month, quarter, year)
 * @returns Dashboard data with summary and trends
 * @throws DashboardApiError on failure
 */
export async function fetchDashboardData(
  period: DashboardPeriod = 'month'
): Promise<DashboardData> {
  const url = `${API_BASE_URL}/api/admin/dashboard?period=${period}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for auth
  });

  // Handle 503 (circuit breaker) gracefully per project context
  if (response.status === 503) {
    throw new DashboardApiError(
      'Service temporarily unavailable. Please try again later.',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  if (!response.ok) {
    throw new DashboardApiError(
      `Failed to fetch dashboard data: ${response.statusText}`,
      response.status
    );
  }

  const result: DashboardResponse = await response.json();

  // Handle backend error response
  if (!result.success) {
    throw new DashboardApiError(
      result.error?.message || 'Unknown error occurred',
      response.status,
      result.error?.code
    );
  }

  return result.data;
}
