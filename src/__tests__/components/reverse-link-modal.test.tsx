/**
 * Reverse Link Modal Tests
 * Story 7-4b Task 12.4: Link LINE account to Dashboard member
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/hooks', () => ({
  useUnlinkedDashboardMembers: vi.fn(),
  useReverseLinkAccount: vi.fn(),
}));

vi.mock('@/lib', () => ({
  maskLineUserId: (id: string) => `${id.slice(0, 4)}***`,
}));

import { ReverseLinkModal } from '@/components/settings/reverse-link-modal';
import { useUnlinkedDashboardMembers, useReverseLinkAccount } from '@/hooks';

const mockUseUnlinkedDashboardMembers = useUnlinkedDashboardMembers as ReturnType<typeof vi.fn>;
const mockUseReverseLinkAccount = useReverseLinkAccount as ReturnType<typeof vi.fn>;

const mockLineAccount = {
  lineUserId: 'U1234567890abcdef',
  name: 'LINE User',
  displayName: 'LINE User',
};

describe('ReverseLinkModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUnlinkedDashboardMembers.mockReturnValue({
      data: [
        { email: 'alice@co.th', name: 'Alice', role: 'sales' },
        { email: 'bob@co.th', name: 'Bob', role: 'admin' },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseReverseLinkAccount.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  describe('[P1] Null state', () => {
    it('should render nothing when lineAccount is null', () => {
      const { container } = render(
        <ReverseLinkModal lineAccount={null} open={true} onClose={vi.fn()} />
      );
      // Should not render modal content
      expect(container.querySelector('[data-testid="reverse-link-modal"]')).not.toBeInTheDocument();
    });
  });

  describe('[P1] Open state with data', () => {
    it('should render modal when open with lineAccount', () => {
      render(
        <ReverseLinkModal lineAccount={mockLineAccount} open={true} onClose={vi.fn()} />
      );
      expect(screen.getByTestId('reverse-link-modal')).toBeInTheDocument();
    });

    it('should display LINE account name', () => {
      render(
        <ReverseLinkModal lineAccount={mockLineAccount} open={true} onClose={vi.fn()} />
      );
      expect(screen.getByText('LINE User')).toBeInTheDocument();
    });

    it('should display masked LINE user ID', () => {
      render(
        <ReverseLinkModal lineAccount={mockLineAccount} open={true} onClose={vi.fn()} />
      );
      expect(screen.getByTestId('line-account-details')).toBeInTheDocument();
    });

    it('should display dashboard members list', () => {
      render(
        <ReverseLinkModal lineAccount={mockLineAccount} open={true} onClose={vi.fn()} />
      );
      expect(screen.getByTestId('dashboard-members-list')).toBeInTheDocument();
    });

    it('should render member options', () => {
      render(
        <ReverseLinkModal lineAccount={mockLineAccount} open={true} onClose={vi.fn()} />
      );
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should render cancel and link buttons', () => {
      render(
        <ReverseLinkModal lineAccount={mockLineAccount} open={true} onClose={vi.fn()} />
      );
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('link-button')).toBeInTheDocument();
    });

    it('should disable link button when no member selected', () => {
      render(
        <ReverseLinkModal lineAccount={mockLineAccount} open={true} onClose={vi.fn()} />
      );
      expect(screen.getByTestId('link-button')).toBeDisabled();
    });
  });

  describe('[P1] Loading state', () => {
    it('should show skeleton when loading', () => {
      mockUseUnlinkedDashboardMembers.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <ReverseLinkModal lineAccount={mockLineAccount} open={true} onClose={vi.fn()} />
      );
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('[P1] Error state', () => {
    it('should show error message', () => {
      mockUseUnlinkedDashboardMembers.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
        refetch: vi.fn(),
      });

      render(
        <ReverseLinkModal lineAccount={mockLineAccount} open={true} onClose={vi.fn()} />
      );
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load');
    });
  });

  describe('[P1] Empty state', () => {
    it('should show empty message when no unlinked members', () => {
      mockUseUnlinkedDashboardMembers.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <ReverseLinkModal lineAccount={mockLineAccount} open={true} onClose={vi.fn()} />
      );
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText(/No unlinked dashboard members/)).toBeInTheDocument();
    });
  });
});
