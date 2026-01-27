/**
 * Team Management Hook (Story 7-4 + 7-4b)
 * Provides data fetching and mutations for team management
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TeamFilter,
  TeamMemberUpdate,
  TeamListResponse,
  TeamMemberResponse,
  CreateTeamMemberInput,
  UnlinkedLINEAccount,
  LinkLINEAccountInput,
  UnlinkedDashboardMember,
  ReverseLinkInput,
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

async function createTeamMember(
  input: CreateTeamMemberInput
): Promise<TeamMemberResponse> {
  const response = await fetch('/api/admin/sales-team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to create team member');
  }

  return data;
}

/**
 * Fetch unlinked LINE accounts (Story 7-4b)
 * Returns LINE accounts that haven't been linked to dashboard members
 */
async function fetchUnlinkedLINEAccounts(): Promise<UnlinkedLINEAccount[]> {
  const response = await fetch('/api/admin/sales-team/unlinked-line-accounts');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch unlinked LINE accounts');
  }

  return data.data || [];
}

/**
 * Link LINE account to dashboard member (Story 7-4b)
 * Uses email as identifier since dashboard members may not have lineUserId
 */
async function linkLINEAccount(input: LinkLINEAccountInput): Promise<TeamMemberResponse> {
  const response = await fetch(`/api/admin/sales-team/email/${encodeURIComponent(input.email)}/link`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetLineUserId: input.targetLineUserId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || data.error || 'Failed to link LINE account');
  }

  return data;
}

/**
 * Fetch unlinked dashboard members (Story 7-4b Task 12)
 * Returns dashboard members without LINE accounts (for reverse linking)
 */
async function fetchUnlinkedDashboardMembers(): Promise<UnlinkedDashboardMember[]> {
  const response = await fetch('/api/admin/sales-team/unlinked-dashboard-members');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch unlinked dashboard members');
  }

  return data.data || [];
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

/**
 * Hook for creating new team member (Story 7-4b)
 * Automatically invalidates team list on success
 */
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTeamMemberInput) => createTeamMember(input),
    onSuccess: () => {
      // Invalidate team list to refresh data
      queryClient.invalidateQueries({ queryKey: ['team-management', 'list'] });
    },
  });
}

/**
 * Hook for fetching unlinked LINE accounts (Story 7-4b AC#9, #10)
 * Returns LINE accounts that can be linked to dashboard members
 */
export function useUnlinkedLINEAccounts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['team-management', 'unlinked-line-accounts'],
    queryFn: fetchUnlinkedLINEAccounts,
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000, // 30 seconds (shorter because data changes when linking)
  });
}

/**
 * Hook for linking LINE account to dashboard member (Story 7-4b AC#11)
 * Automatically invalidates team list and unlinked accounts on success
 */
export function useLinkLINEAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LinkLINEAccountInput) => linkLINEAccount(input),
    onSuccess: () => {
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['team-management', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['team-management', 'unlinked-line-accounts'] });
    },
  });
}

/**
 * Hook for fetching unlinked dashboard members (Story 7-4b Task 12 AC#14)
 * Returns dashboard members that can be linked to LINE accounts
 */
export function useUnlinkedDashboardMembers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['team-management', 'unlinked-dashboard-members'],
    queryFn: fetchUnlinkedDashboardMembers,
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for reverse linking (LINE account → dashboard member) (Story 7-4b Task 12)
 * Reuses the same backend endpoint but from LINE account perspective
 */
export function useReverseLinkAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReverseLinkInput) =>
      linkLINEAccount({ email: input.targetEmail, targetLineUserId: input.lineUserId }),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['team-management', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['team-management', 'unlinked-line-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['team-management', 'unlinked-dashboard-members'] });
    },
  });
}

// Types are imported directly from '@/types/team' by consumers
