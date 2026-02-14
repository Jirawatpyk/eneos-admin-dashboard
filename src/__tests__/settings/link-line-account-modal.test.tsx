/**
 * LinkLineAccountModal Component Tests (Story 7-4b Task 15.2)
 * AC#9: Link LINE Account Modal - display member details, list unlinked accounts
 * AC#10: Empty state when no unlinked LINE accounts
 * AC#12: Linking Confirmation dialog
 * AC#11: Successful link
 * AC#15: Already-linked error handling
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { TeamMember, UnlinkedLINEAccount } from '@/types/team';

// Mock data
const mockMember: TeamMember = {
  lineUserId: null,
  name: 'Test User',
  email: 'test@eneos.co.th',
  phone: '0812345678',
  role: 'viewer',
  createdAt: '2026-01-20T10:00:00Z',
  status: 'active',
};

const mockUnlinkedAccounts: UnlinkedLINEAccount[] = [
  { lineUserId: 'Uabc123', name: 'LINE User A', createdAt: '2026-01-18T10:00:00Z' },
  { lineUserId: 'Udef456', name: 'LINE User B', createdAt: '2026-01-19T10:00:00Z' },
];

// Mock hooks
const mockMutateAsync = vi.fn();
const mockRefetch = vi.fn();
const mockToast = vi.fn();

let mockUnlinkedData: UnlinkedLINEAccount[] | undefined = mockUnlinkedAccounts;
let mockIsLoading = false;
let mockError: Error | null = null;

vi.mock('@/hooks/use-team-management', () => ({
  useUnlinkedLINEAccounts: vi.fn(() => ({
    data: mockUnlinkedData,
    isLoading: mockIsLoading,
    error: mockError,
    refetch: mockRefetch,
  })),
  useLinkLINEAccount: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  })),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: mockToast,
  })),
}));

// Mock maskLineUserId
vi.mock('@/lib/utils', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/utils')>();
  return {
    ...original,
    maskLineUserId: (id: string) => `${id.substring(0, 4)}...`,
  };
});

import { LinkLineAccountModal } from '@/components/settings/link-line-account-modal';

describe('LinkLineAccountModal (Task 15.2)', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnlinkedData = mockUnlinkedAccounts;
    mockIsLoading = false;
    mockError = null;
  });

  // AC#9: Displays member details
  it('should display member details when open (AC#9)', () => {
    render(<LinkLineAccountModal member={mockMember} open={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('member-details')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@eneos.co.th')).toBeInTheDocument();
  });

  // AC#9: Lists unlinked LINE accounts
  it('should list unlinked LINE accounts (AC#9)', () => {
    render(<LinkLineAccountModal member={mockMember} open={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('line-accounts-list')).toBeInTheDocument();
    expect(screen.getByText('LINE User A')).toBeInTheDocument();
    expect(screen.getByText('LINE User B')).toBeInTheDocument();
  });

  // AC#10: Empty state
  it('should show empty state when no unlinked accounts (AC#10)', () => {
    mockUnlinkedData = [];

    render(<LinkLineAccountModal member={mockMember} open={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/No unlinked LINE accounts/)).toBeInTheDocument();
  });

  // AC#12: Confirmation dialog
  it('should show confirmation dialog when link is clicked (AC#12)', async () => {
    render(<LinkLineAccountModal member={mockMember} open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    // Select a LINE account
    await user.click(screen.getByTestId('line-account-Uabc123'));

    // Click link button
    await user.click(screen.getByTestId('link-button'));

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });
  });

  // AC#11: Links successfully
  it('should link successfully and show success toast (AC#11)', async () => {
    mockMutateAsync.mockResolvedValue({ success: true });

    render(<LinkLineAccountModal member={mockMember} open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    // Select and confirm link
    await user.click(screen.getByTestId('line-account-Uabc123'));
    await user.click(screen.getByTestId('link-button'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('confirm-link'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@eneos.co.th',
        targetLineUserId: 'Uabc123',
      });
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'LINE account linked successfully',
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // AC#15: Already-linked error
  it('should show error on already-linked account (AC#15)', async () => {
    mockMutateAsync.mockRejectedValue(new Error('LINE account already linked to Another User'));

    render(<LinkLineAccountModal member={mockMember} open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('line-account-Uabc123'));
    await user.click(screen.getByTestId('link-button'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('confirm-link'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'LINE account already linked',
          variant: 'destructive',
        })
      );
    });
  });

  // Error state
  it('should show error message when fetch fails', () => {
    mockError = new Error('Network error');

    render(<LinkLineAccountModal member={mockMember} open={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
  });

  // Returns null when no member
  it('should return null when member is null', () => {
    const { container } = render(<LinkLineAccountModal member={null} open={true} onClose={mockOnClose} />);

    expect(container.innerHTML).toBe('');
  });
});
