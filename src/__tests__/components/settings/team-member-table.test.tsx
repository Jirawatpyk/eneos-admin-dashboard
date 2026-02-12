/**
 * TeamMemberTable Component Tests
 * Story 7.4: Admin User Management
 * AC#1: Display sales team members in table with columns (LINE ID masked, Name, Email, Role, Status, Created At)
 * AC#4: Click row to open edit modal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TeamMemberTable } from '@/components/settings/team-member-table';
import type { TeamMember } from '@/types/team';

const mockMembers: TeamMember[] = [
  {
    lineUserId: 'Uabcdef1234567890abcdef1234567890',
    name: 'John Admin',
    email: 'john@eneos.co.th',
    phone: '0812345678',
    role: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'active',
  },
  {
    lineUserId: 'U789012abcdef34567890abcdef456789',
    name: 'Jane Viewer',
    email: 'jane@eneos.co.th',
    phone: '0898765432',
    role: 'viewer',
    createdAt: '2024-02-20T14:30:00Z',
    status: 'active',
  },
  {
    lineUserId: 'U345678abcdef90123456abcdef012345',
    name: 'Bob Inactive',
    email: null,
    phone: null,
    role: 'viewer',
    createdAt: '2023-12-01T08:00:00Z',
    status: 'inactive',
  },
];

describe('TeamMemberTable Component', () => {
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    cleanup();
    mockOnEdit.mockReset();
  });

  describe('AC#1: Table columns', () => {
    it('should render table headers including Created At', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText('LINE ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created At')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render member names', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText('John Admin')).toBeInTheDocument();
      expect(screen.getByText('Jane Viewer')).toBeInTheDocument();
      expect(screen.getByText('Bob Inactive')).toBeInTheDocument();
    });

    it('should render member emails', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText('john@eneos.co.th')).toBeInTheDocument();
      expect(screen.getByText('jane@eneos.co.th')).toBeInTheDocument();
    });

    it('should show dash for null email', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      // Bob Inactive has null email
      const rows = screen.getAllByRole('row');
      const bobRow = rows.find(row => row.textContent?.includes('Bob Inactive'));
      expect(bobRow).toHaveTextContent('-');
    });

    it('should render role badges correctly (admin + viewer)', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      // Should have Admin and Viewer badges
      expect(screen.getByTestId('role-badge-admin')).toBeInTheDocument();
      expect(screen.getAllByTestId('role-badge-viewer')).toHaveLength(2);
      // Display text should be "Viewer" not "Sales"
      expect(screen.getByTestId('role-badge-admin')).toHaveTextContent('Admin');
      expect(screen.getAllByTestId('role-badge-viewer')[0]).toHaveTextContent('Viewer');
    });

    it('should map legacy "sales" role to display "Viewer"', () => {
      const legacyMembers: TeamMember[] = [
        {
          lineUserId: 'Ulegacy12345678901234567890123456',
          name: 'Legacy Sales',
          email: null,
          phone: null,
          role: 'sales',
          createdAt: '2024-01-01T00:00:00Z',
          status: 'active',
        },
      ];

      render(
        <TeamMemberTable
          members={legacyMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      // data-testid uses raw role value, but display text is "Viewer"
      expect(screen.getByTestId('role-badge-sales')).toHaveTextContent('Viewer');
    });

    it('should render status badges correctly', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getAllByTestId('status-badge-active')).toHaveLength(2);
      expect(screen.getByTestId('status-badge-inactive')).toBeInTheDocument();
    });

    it('should mask LINE User ID for privacy (first 4 and last 4 chars)', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      const lineIdCells = screen.getAllByTestId('line-id-cell');
      // First member: Uabcdef1234567890abcdef1234567890 -> Uabc...7890
      expect(lineIdCells[0]).toHaveTextContent('Uabc...7890');
    });

    it('should display Created At column with formatted date', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      const createdAtCells = screen.getAllByTestId('created-at-cell');
      // Jan 15, 2024
      expect(createdAtCells[0]).toHaveTextContent('Jan 15, 2024');
    });

    it('should show dash for empty createdAt', () => {
      const memberWithEmptyDate: TeamMember[] = [
        {
          lineUserId: 'Utest1234567890test1234567890test',
          name: 'Test User',
          email: null,
          phone: null,
          role: 'sales',
          createdAt: '',
          status: 'active',
        },
      ];

      render(
        <TeamMemberTable
          members={memberWithEmptyDate}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      const createdAtCells = screen.getAllByTestId('created-at-cell');
      expect(createdAtCells[0]).toHaveTextContent('-');
    });
  });

  describe('AC#4: Click row to edit', () => {
    it('should call onEdit when edit button is clicked', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      const editButtons = screen.getAllByTestId('edit-btn');
      fireEvent.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockMembers[0]);
    });

    it('should call onEdit with correct member data', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      const editButtons = screen.getAllByTestId('edit-btn');
      fireEvent.click(editButtons[1]); // Click second row

      expect(mockOnEdit).toHaveBeenCalledWith(mockMembers[1]);
    });
  });

  describe('Loading state', () => {
    it('should render skeleton rows when loading', () => {
      render(
        <TeamMemberTable
          members={[]}
          isLoading={true}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
    });

    it('should not render skeleton when not loading', () => {
      render(
        <TeamMemberTable
          members={mockMembers}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.queryByTestId('table-skeleton')).not.toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show empty message when no members', () => {
      render(
        <TeamMemberTable
          members={[]}
          isLoading={false}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText(/no team members found/i)).toBeInTheDocument();
    });
  });
});
