/**
 * Team Management Card Component (Story 7-4 + 7-4b)
 * Main container for team management functionality
 * AC#1: Table view with all members
 * AC#2, AC#3: Filter controls
 * AC#4-AC#9: Edit functionality
 * AC#10: Admin-only access (handled by page)
 * Story 7-4b: Add New Member button and modal
 * Task 12: Unlinked LINE Accounts tab
 */
'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeamList, useUnlinkedLINEAccounts } from '@/hooks';
import { TeamMemberFilter } from './team-member-filter';
import { TeamMemberTable } from './team-member-table';
import { TeamMemberEditModal } from './team-member-edit-modal';
import { AddMemberModal } from './add-member-modal';
import { LinkLineAccountModal } from './link-line-account-modal';
import { UnlinkedLineAccountsTable } from './unlinked-line-accounts-table';
import { ReverseLinkModal } from './reverse-link-modal';
import type { TeamMember, TeamFilter, UnlinkedLINEAccount } from '@/types';

interface TeamManagementCardProps {
  isAdmin?: boolean; // Story 7-4b AC#16: Admin-only access for add/link features
}

export function TeamManagementCard({ isAdmin = true }: TeamManagementCardProps) {
  // Tab state (Task 12.1)
  const [activeTab, setActiveTab] = useState<'members' | 'unlinked'>('members');

  // Filter state - default to active members, all roles
  const [filter, setFilter] = useState<TeamFilter>({
    status: 'active',
    role: 'all',
  });

  // Edit modal state
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add member modal state (Story 7-4b)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Link LINE account modal state (Story 7-4b AC#8, #9)
  const [linkMember, setLinkMember] = useState<TeamMember | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Reverse link modal state (Task 12.4)
  const [reverseLinkAccount, setReverseLinkAccount] = useState<UnlinkedLINEAccount | null>(null);
  const [isReverseLinkModalOpen, setIsReverseLinkModalOpen] = useState(false);

  // Fetch team data
  const { data, isLoading, error } = useTeamList(filter);

  // Fetch unlinked LINE accounts (Task 12)
  const {
    data: unlinkedAccounts,
    isLoading: isLoadingUnlinked,
    error: unlinkedError,
  } = useUnlinkedLINEAccounts({ enabled: activeTab === 'unlinked' });

  // Handle edit action
  const handleEdit = (member: TeamMember) => {
    setEditMember(member);
    setIsEditModalOpen(true);
  };

  // Handle edit modal close
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditMember(null);
  };

  // Handle add member modal (Story 7-4b)
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Handle link action (Story 7-4b AC#8, #9)
  const handleLink = (member: TeamMember) => {
    setLinkMember(member);
    setIsLinkModalOpen(true);
  };

  // Handle link modal close
  const handleCloseLinkModal = () => {
    setIsLinkModalOpen(false);
    setLinkMember(null);
  };

  // Handle reverse link action (Task 12.4)
  const handleLinkToMember = (account: UnlinkedLINEAccount) => {
    setReverseLinkAccount(account);
    setIsReverseLinkModalOpen(true);
  };

  // Handle reverse link modal close
  const handleCloseReverseLinkModal = () => {
    setIsReverseLinkModalOpen(false);
    setReverseLinkAccount(null);
  };

  return (
    <>
      <div className="space-y-4" data-testid="team-management-card">
        {/* Tabs (Task 12.1) */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'members' | 'unlinked')}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Tab list */}
            <TabsList>
              <TabsTrigger value="members" data-testid="tab-members">
                Team Members
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="unlinked" data-testid="tab-unlinked">
                  Unlinked LINE Accounts
                  {unlinkedAccounts && unlinkedAccounts.length > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {unlinkedAccounts.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
            </TabsList>

            {/* Add New Member button (Story 7-4b AC#1, AC#16: Admin-only) */}
            {isAdmin && activeTab === 'members' && (
              <Button
                type="button"
                onClick={handleOpenAddModal}
                disabled={isLoading}
                data-testid="add-member-btn"
                className="ml-auto"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            )}
          </div>

          {/* Team Members Tab */}
          <TabsContent value="members" className="space-y-4 mt-4">
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

            {/* Table - AC#16: Only pass onLink for admin users */}
            <TeamMemberTable
              members={data?.members || []}
              isLoading={isLoading}
              onEdit={handleEdit}
              onLink={isAdmin ? handleLink : undefined}
            />
          </TabsContent>

          {/* Unlinked LINE Accounts Tab (Task 12) */}
          {isAdmin && (
            <TabsContent value="unlinked" className="space-y-4 mt-4">
              {/* Results count */}
              {unlinkedAccounts && (
                <p className="text-sm text-muted-foreground" data-testid="unlinked-results-count">
                  {unlinkedAccounts.length} unlinked LINE account{unlinkedAccounts.length !== 1 ? 's' : ''}
                </p>
              )}

              {/* Error state */}
              {unlinkedError && (
                <div
                  className="rounded-md bg-red-50 p-4 text-sm text-red-800"
                  data-testid="unlinked-error-message"
                >
                  Failed to load unlinked accounts: {unlinkedError.message}
                </div>
              )}

              {/* Unlinked LINE Accounts Table (Task 12.2, 12.3) */}
              <UnlinkedLineAccountsTable
                accounts={unlinkedAccounts || []}
                isLoading={isLoadingUnlinked}
                onLinkToMember={handleLinkToMember}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Edit modal */}
      <TeamMemberEditModal
        member={editMember}
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
      />

      {/* Add member modal (Story 7-4b) */}
      <AddMemberModal open={isAddModalOpen} onClose={handleCloseAddModal} />

      {/* Link LINE account modal (Story 7-4b AC#9) */}
      <LinkLineAccountModal
        member={linkMember}
        open={isLinkModalOpen}
        onClose={handleCloseLinkModal}
      />

      {/* Reverse link modal (Task 12.4) */}
      <ReverseLinkModal
        lineAccount={reverseLinkAccount}
        open={isReverseLinkModalOpen}
        onClose={handleCloseReverseLinkModal}
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
