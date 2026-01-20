/**
 * Team Management Hook (Story 7-4)
 * Provides data fetching and mutations for team management
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TeamMember,
  TeamFilter,
  TeamMemberUpdate,
  TeamListResponse,
  TeamMemberResponse,
} from '@/types/team';

// ===========================================
// API Functions
// ===========================================

async function fetchTeamList(filter: TeamFilter): Promise<TeamListResponse> {
  const params = new URLSearchParams({
    status: filter.status,
    role: filter.role,
  });

  const response = await fetch(`/api/admin/sales-team/list?${params}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch team list');
  }

  return data;
}

async function fetchTeamMember(lineUserId: string): Promise<TeamMemberResponse> {
  const response = await fetch(`/api/admin/sales-team/${lineUserId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch team member');
  }

  return data;
}

async function updateTeamMember(
  lineUserId: string,
  updates: TeamMemberUpdate
): Promise<TeamMemberResponse> {
  const response = await fetch(`/api/admin/sales-team/${lineUserId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to update team member');
  }

  return data;
}

// ===========================================
// Custom Hooks
// ===========================================

/**
 * Hook for fetching team list with filters
 * Returns TanStack Query result with team members
 */
export function useTeamList(filter: TeamFilter) {
  return useQuery({
    queryKey: ['team-management', 'list', filter],
    queryFn: () => fetchTeamList(filter),
    staleTime: 60 * 1000, // 1 minute
    select: (data) => ({
      members: data.data,
      total: data.total,
    }),
  });
}

/**
 * Hook for fetching single team member
 */
export function useTeamMember(lineUserId: string | null) {
  return useQuery({
    queryKey: ['team-management', 'member', lineUserId],
    queryFn: () => fetchTeamMember(lineUserId!),
    enabled: !!lineUserId,
    staleTime: 60 * 1000,
    select: (data) => data.data,
  });
}

/**
 * Hook for updating team member
 * Automatically invalidates team list on success
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lineUserId, updates }: { lineUserId: string; updates: TeamMemberUpdate }) =>
      updateTeamMember(lineUserId, updates),
    onSuccess: () => {
      // Invalidate team list to refresh data
      queryClient.invalidateQueries({ queryKey: ['team-management', 'list'] });
    },
  });
}

// ===========================================
// Export Types
// ===========================================

export type { TeamMember, TeamFilter, TeamMemberUpdate };
