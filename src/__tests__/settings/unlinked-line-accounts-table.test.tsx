/**
 * UnlinkedLineAccountsTable Component Tests (Story 7-4b Task 15.4)
 * AC#13: Display LINE accounts without dashboard members
 * AC#14: Link to Member action (opens reverse linking modal)
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { UnlinkedLINEAccount } from '@/types/team';

// Mock maskLineUserId
vi.mock('@/lib/utils', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/utils')>();
  return {
    ...original,
    maskLineUserId: (id: string) => `${id.substring(0, 4)}...`,
  };
});

import { UnlinkedLineAccountsTable } from '@/components/settings/unlinked-line-accounts-table';

const mockAccounts: UnlinkedLINEAccount[] = [
  { lineUserId: 'Uabc123', name: 'LINE User A', createdAt: '2026-01-18T10:00:00Z' },
  { lineUserId: 'Udef456', name: 'LINE User B', createdAt: '2026-01-19T10:00:00Z' },
];

describe('UnlinkedLineAccountsTable (Task 15.4)', () => {
  const mockOnLinkToMember = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#13: Renders unlinked accounts list
  it('should render unlinked accounts table (AC#13)', () => {
    render(
      <UnlinkedLineAccountsTable
        accounts={mockAccounts}
        onLinkToMember={mockOnLinkToMember}
      />
    );

    expect(screen.getByTestId('unlinked-line-accounts-table')).toBeInTheDocument();
    expect(screen.getByText('LINE User A')).toBeInTheDocument();
    expect(screen.getByText('LINE User B')).toBeInTheDocument();
  });

  it('should show masked LINE IDs (AC#13)', () => {
    render(
      <UnlinkedLineAccountsTable
        accounts={mockAccounts}
        onLinkToMember={mockOnLinkToMember}
      />
    );

    expect(screen.getByText('Uabc...')).toBeInTheDocument();
    expect(screen.getByText('Udef...')).toBeInTheDocument();
  });

  it('should show formatted dates', () => {
    render(
      <UnlinkedLineAccountsTable
        accounts={mockAccounts}
        onLinkToMember={mockOnLinkToMember}
      />
    );

    // Date should be formatted (Jan 18, 2026 format)
    expect(screen.getByText(/Jan 18, 2026/)).toBeInTheDocument();
  });

  // AC#14: Link to Member button opens reverse linking modal
  it('should call onLinkToMember when Link to Member is clicked (AC#14)', async () => {
    render(
      <UnlinkedLineAccountsTable
        accounts={mockAccounts}
        onLinkToMember={mockOnLinkToMember}
      />
    );
    const user = userEvent.setup();

    const linkButtons = screen.getAllByTestId('link-to-member-btn');
    await user.click(linkButtons[0]);

    expect(mockOnLinkToMember).toHaveBeenCalledWith(mockAccounts[0]);
  });

  // Empty state
  it('should show empty state when no accounts', () => {
    render(
      <UnlinkedLineAccountsTable
        accounts={[]}
        onLinkToMember={mockOnLinkToMember}
      />
    );

    expect(screen.getByText(/No unlinked LINE accounts found/)).toBeInTheDocument();
  });

  // Loading state
  it('should show skeleton when loading', () => {
    render(
      <UnlinkedLineAccountsTable
        accounts={[]}
        isLoading={true}
        onLinkToMember={mockOnLinkToMember}
      />
    );

    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
  });
});
