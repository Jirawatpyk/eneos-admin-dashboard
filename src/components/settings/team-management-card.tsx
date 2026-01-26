/**
 * Team Management Card Component (Story 7-4)
 * Main container for team management functionality
 * AC#1: Table view with all members
 * AC#2, AC#3: Filter controls
 * AC#4-AC#9: Edit functionality
 * AC#10: Admin-only access (handled by page)
 */
'use client';

import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamList } from '@/hooks/use-team-management';
import { TeamMemberFilter } from './team-member-filter';
import { TeamMemberTable } from './team-member-table';
import { TeamMemberEditModal } from './team-member-edit-modal';
import type { TeamMember, TeamFilter } from '@/types/team';

export function TeamManagementCard() {
  // Filter state - default to active members, all roles
  const [filter, setFilter] = useState<TeamFilter>({
    status: 'active',
    role: 'all',
  });

  // Edit modal state
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch team data
  const { data, isLoading, error } = useTeamList(filter);

  // Handle edit action
  const handleEdit = (member: TeamMember) => {
    setEditMember(member);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditMember(null);
  };

  return (
    <>
      <div className="space-y-4" data-testid="team-management-card">
        {/* Filter controls */}
        <TeamMemberFilter
          filter={filter}
          onFilterChange={setFilter}
          disabled={isLoading}
        />

        {/* Results count */}
        {data && (
          <p className="text-sm text-muted-foreground" data-testid="results-count">
            Showing {data.members.length} member{data.members.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Error state */}
        {error && (
          <div
            className="rounded-md bg-red-50 p-4 text-sm text-red-800"
            data-testid="error-message"
          >
            Failed to load team members: {error.message}
          </div>
        )}

        {/* Table */}
        <TeamMemberTable
          members={data?.members || []}
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      </div>

      {/* Edit modal */}
      <TeamMemberEditModal
        member={editMember}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

/**
 * Skeleton loader for the card
 */
export function TeamManagementCardSkeleton() {
  return (
    <div className="space-y-4" data-testid="team-management-skeleton">
      {/* Filter skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
      {/* Results count skeleton */}
      <Skeleton className="h-4 w-24" />
      {/* Table skeleton */}
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
