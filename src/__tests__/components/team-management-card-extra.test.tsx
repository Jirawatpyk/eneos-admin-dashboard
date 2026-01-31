/**
 * Team Management Card - Extra Coverage Tests
 * Story 7-4 + 7-4b: Team management with tabs and modals
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock all hooks
vi.mock('@/hooks', () => ({
  useTeamList: vi.fn(),
  useUnlinkedLINEAccounts: vi.fn(),
}));

// Mock child components to simplify testing
vi.mock('@/components/settings/team-member-filter', () => ({
  TeamMemberFilter: vi.fn(({ filter, disabled }: {
    filter: { status: string; role: string };
    disabled: boolean;
  }) => (
    <div data-testid="mock-team-filter" data-disabled={disabled}>
      {filter.status}-{filter.role}
    </div>
  )),
}));

vi.mock('@/components/settings/team-member-table', () => ({
  TeamMemberTable: vi.fn(({ members, isLoading }: { members: unknown[]; isLoading: boolean }) => (
    <div data-testid="mock-team-table" data-count={members.length} data-loading={isLoading} />
  )),
}));

vi.mock('@/components/settings/team-member-edit-modal', () => ({
  TeamMemberEditModal: vi.fn(() => <div data-testid="mock-edit-modal" />),
}));

vi.mock('@/components/settings/add-member-modal', () => ({
  AddMemberModal: vi.fn(() => <div data-testid="mock-add-modal" />),
}));

vi.mock('@/components/settings/link-line-account-modal', () => ({
  LinkLineAccountModal: vi.fn(() => <div data-testid="mock-link-modal" />),
}));

vi.mock('@/components/settings/unlinked-line-accounts-table', () => ({
  UnlinkedLineAccountsTable: vi.fn(() => <div data-testid="mock-unlinked-table" />),
}));

vi.mock('@/components/settings/reverse-link-modal', () => ({
  ReverseLinkModal: vi.fn(() => <div data-testid="mock-reverse-link-modal" />),
}));

import { TeamManagementCard, TeamManagementCardSkeleton } from '@/components/settings/team-management-card';
import { useTeamList, useUnlinkedLINEAccounts } from '@/hooks';

const mockUseTeamList = useTeamList as ReturnType<typeof vi.fn>;
const mockUseUnlinkedLINEAccounts = useUnlinkedLINEAccounts as ReturnType<typeof vi.fn>;

describe('TeamManagementCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTeamList.mockReturnValue({
      data: { members: [{ lineUserId: 'U001', name: 'Rep 1' }], total: 1 },
      isLoading: false,
      error: null,
    });
    mockUseUnlinkedLINEAccounts.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
  });

  describe('[P1] Rendering', () => {
    it('should render container with testid', () => {
      render(<TeamManagementCard />);
      expect(screen.getByTestId('team-management-card')).toBeInTheDocument();
    });

    it('should render Team Members tab', () => {
      render(<TeamManagementCard />);
      expect(screen.getByTestId('tab-members')).toBeInTheDocument();
    });

    it('should render team table', () => {
      render(<TeamManagementCard />);
      expect(screen.getByTestId('mock-team-table')).toBeInTheDocument();
    });

    it('should render team filter', () => {
      render(<TeamManagementCard />);
      expect(screen.getByTestId('mock-team-filter')).toBeInTheDocument();
    });

    it('should render results count', () => {
      render(<TeamManagementCard />);
      expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 member');
    });
  });

  describe('[P1] Admin features', () => {
    it('should show Unlinked tab for admin', () => {
      render(<TeamManagementCard isAdmin={true} />);
      expect(screen.getByTestId('tab-unlinked')).toBeInTheDocument();
    });

    it('should show Add New Member button for admin', () => {
      render(<TeamManagementCard isAdmin={true} />);
      expect(screen.getByTestId('add-member-btn')).toBeInTheDocument();
    });

    it('should hide Unlinked tab for non-admin', () => {
      render(<TeamManagementCard isAdmin={false} />);
      expect(screen.queryByTestId('tab-unlinked')).not.toBeInTheDocument();
    });

    it('should hide Add button for non-admin', () => {
      render(<TeamManagementCard isAdmin={false} />);
      expect(screen.queryByTestId('add-member-btn')).not.toBeInTheDocument();
    });
  });

  describe('[P1] Unlinked badge count', () => {
    it('should show badge when unlinked accounts exist', () => {
      mockUseUnlinkedLINEAccounts.mockReturnValue({
        data: [{ lineUserId: 'U-new' }],
        isLoading: false,
        error: null,
      });

      render(<TeamManagementCard isAdmin={true} />);
      const tab = screen.getByTestId('tab-unlinked');
      expect(tab).toHaveTextContent('1');
    });
  });

  describe('[P1] Error state', () => {
    it('should show error message when team list fails', () => {
      mockUseTeamList.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Load failed'),
      });

      render(<TeamManagementCard />);
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load team members: Load failed');
    });
  });

  describe('[P1] Loading state', () => {
    it('should disable Add button when loading', () => {
      mockUseTeamList.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<TeamManagementCard />);
      expect(screen.getByTestId('add-member-btn')).toBeDisabled();
    });
  });
});

describe('TeamManagementCardSkeleton', () => {
  it('[P1] should render skeleton with testid', () => {
    render(<TeamManagementCardSkeleton />);
    expect(screen.getByTestId('team-management-skeleton')).toBeInTheDocument();
  });
});
