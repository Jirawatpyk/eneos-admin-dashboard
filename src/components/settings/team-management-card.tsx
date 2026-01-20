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
import { Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card data-testid="team-management-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Team Management</CardTitle>
          </div>
          <CardDescription>
            Manage sales team members, roles, and access permissions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

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
    <Card data-testid="team-management-skeleton">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}
