/**
 * TeamMemberTable Integration Tests (Story 7-4b Task 15.3)
 * AC#8: "Not linked" badge for unlinked members + "Link" button
 * Tests specific to Story 7-4b features (base table tests may exist elsewhere)
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { TeamMember } from '@/types/team';

// Mock maskLineUserId
vi.mock('@/lib/utils', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/utils')>();
  return {
    ...original,
    maskLineUserId: (id: string) => `${id.substring(0, 4)}...`,
  };
});

import { TeamMemberTable } from '@/components/settings/team-member-table';

const mockLinkedMember: TeamMember = {
  lineUserId: 'Uabc123xyz',
  name: 'Linked User',
  email: 'linked@eneos.co.th',
  phone: '0812345678',
  role: 'viewer',
  createdAt: '2026-01-20T10:00:00Z',
  status: 'active',
};

const mockUnlinkedMember: TeamMember = {
  lineUserId: null,
  name: 'Unlinked User',
  email: 'unlinked@eneos.co.th',
  phone: null,
  role: 'viewer',
  createdAt: '2026-01-21T10:00:00Z',
  status: 'active',
};

describe('TeamMemberTable - Story 7-4b Features (Task 15.3)', () => {
  const mockOnEdit = vi.fn();
  const mockOnLink = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#8: "Not linked" badge
  it('should show "Not linked" badge for unlinked members (AC#8)', () => {
    render(
      <TeamMemberTable
        members={[mockUnlinkedMember]}
        onEdit={mockOnEdit}
        onLink={mockOnLink}
      />
    );

    expect(screen.getByTestId('not-linked-badge')).toBeInTheDocument();
    expect(screen.getByText('Not linked')).toBeInTheDocument();
  });

  it('should show masked LINE ID for linked members', () => {
    render(
      <TeamMemberTable
        members={[mockLinkedMember]}
        onEdit={mockOnEdit}
        onLink={mockOnLink}
      />
    );

    expect(screen.queryByTestId('not-linked-badge')).not.toBeInTheDocument();
    // Should show masked ID
    expect(screen.getByText('Uabc...')).toBeInTheDocument();
  });

  // AC#8: "Link" button for unlinked members
  it('should show "Link" button for unlinked members when onLink provided (AC#8)', () => {
    render(
      <TeamMemberTable
        members={[mockUnlinkedMember]}
        onEdit={mockOnEdit}
        onLink={mockOnLink}
      />
    );

    expect(screen.getByTestId('link-btn')).toBeInTheDocument();
  });

  it('should not show "Link" button when onLink is undefined', () => {
    render(
      <TeamMemberTable
        members={[mockUnlinkedMember]}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.queryByTestId('link-btn')).not.toBeInTheDocument();
  });

  it('should not show "Link" button for linked members', () => {
    render(
      <TeamMemberTable
        members={[mockLinkedMember]}
        onEdit={mockOnEdit}
        onLink={mockOnLink}
      />
    );

    expect(screen.queryByTestId('link-btn')).not.toBeInTheDocument();
  });

  // Opens correct modal on click
  it('should call onLink with member when Link button is clicked', async () => {
    render(
      <TeamMemberTable
        members={[mockUnlinkedMember]}
        onEdit={mockOnEdit}
        onLink={mockOnLink}
      />
    );
    const user = userEvent.setup();

    await user.click(screen.getByTestId('link-btn'));

    expect(mockOnLink).toHaveBeenCalledWith(mockUnlinkedMember);
  });

  it('should call onEdit with member when Edit button is clicked', async () => {
    render(
      <TeamMemberTable
        members={[mockLinkedMember]}
        onEdit={mockOnEdit}
        onLink={mockOnLink}
      />
    );
    const user = userEvent.setup();

    await user.click(screen.getByTestId('edit-btn'));

    expect(mockOnEdit).toHaveBeenCalledWith(mockLinkedMember);
  });

  // Mixed members
  it('should show both linked and unlinked members correctly', () => {
    render(
      <TeamMemberTable
        members={[mockLinkedMember, mockUnlinkedMember]}
        onEdit={mockOnEdit}
        onLink={mockOnLink}
      />
    );

    expect(screen.getByText('Linked User')).toBeInTheDocument();
    expect(screen.getByText('Unlinked User')).toBeInTheDocument();
    expect(screen.getByTestId('not-linked-badge')).toBeInTheDocument();
    // Only 1 link button (for unlinked member)
    expect(screen.getAllByTestId('link-btn')).toHaveLength(1);
  });

  // Loading state
  it('should show skeleton when loading', () => {
    render(
      <TeamMemberTable
        members={[]}
        isLoading={true}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
  });

  // Empty state
  it('should show empty state when no members', () => {
    render(
      <TeamMemberTable
        members={[]}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('No team members found')).toBeInTheDocument();
  });
});
