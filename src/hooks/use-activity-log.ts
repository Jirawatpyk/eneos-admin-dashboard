/**
 * Activity Log Hook (Story 7-7)
 * Provides data fetching for activity log page
 *
 * AC#2: Display activity log with pagination
 * AC#3: Filter by date range
 * AC#4: Filter by status
 * AC#5: Filter by changed by
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  ActivityEntry,
  ActivityPagination,
  ActivityLogResponse,
  ActivityLogQueryParams,
  ChangedByOption,
} from '@/types/activity';

// ===========================================
// API Functions
// ===========================================

async function fetchActivityLog(params: ActivityLogQueryParams): Promise<ActivityLogResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  if (params.status) searchParams.set('status', params.status);
  if (params.changedBy) searchParams.set('changedBy', params.changedBy);

  const response = await fetch(`/api/admin/activity-log?${searchParams}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch activity log');
  }

  return data;
}

// ===========================================
// Custom Hooks
// ===========================================

/**
 * Hook for fetching activity log with pagination and filters
 *
 * @param params - Query parameters for filtering
 * @returns TanStack Query result with activity entries, pagination, and filter options
 */
export function useActivityLog(params: ActivityLogQueryParams) {
  return useQuery({
    queryKey: ['activity-log', params],
    queryFn: () => fetchActivityLog(params),
    staleTime: 30 * 1000, // 30 seconds - activity log changes frequently
    select: (data) => ({
      entries: data.data.entries,
      pagination: data.data.pagination,
      changedByOptions: data.data.filters.changedByOptions,
    }),
  });
}

// ===========================================
// Export Types
// ===========================================

export type {
  ActivityEntry,
  ActivityPagination,
  ActivityLogQueryParams,
  ChangedByOption,
};
