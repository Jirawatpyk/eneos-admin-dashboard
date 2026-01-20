/**
 * TeamMemberFilter Component Tests
 * Story 7.4: Admin User Management
 * AC#2: Filter by status (active/inactive)
 * AC#3: Filter by role (admin/sales)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TeamMemberFilter } from '@/components/settings/team-member-filter';
import type { TeamFilter } from '@/types/team';

describe('TeamMemberFilter Component', () => {
  const mockOnFilterChange = vi.fn();
  const defaultFilter: TeamFilter = { status: 'active', role: 'all' };

  beforeEach(() => {
    cleanup();
    mockOnFilterChange.mockReset();
  });

  describe('Rendering', () => {
    it('should render filter container', () => {
      render(
        <TeamMemberFilter
          filter={defaultFilter}
          onFilterChange={mockOnFilterChange}
        />
      );

      expect(screen.getByTestId('team-member-filter')).toBeInTheDocument();
    });

    it('should render status filter dropdown', () => {
      render(
        <TeamMemberFilter
          filter={defaultFilter}
          onFilterChange={mockOnFilterChange}
        />
      );

      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
    });

    it('should render role filter dropdown', () => {
      render(
        <TeamMemberFilter
          filter={defaultFilter}
          onFilterChange={mockOnFilterChange}
        />
      );

      expect(screen.getByTestId('role-filter')).toBeInTheDocument();
    });

    it('should render filter label', () => {
      render(
        <TeamMemberFilter
          filter={defaultFilter}
          onFilterChange={mockOnFilterChange}
        />
      );

      expect(screen.getByText('Filters:')).toBeInTheDocument();
    });
  });

  describe('AC#2: Status filter display', () => {
    it('should show Active text when status is active', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'active', role: 'all' }}
          onFilterChange={mockOnFilterChange}
        />
      );

      const trigger = screen.getByTestId('status-filter');
      expect(trigger).toHaveTextContent('Active');
    });

    it('should show Inactive text when status is inactive', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'inactive', role: 'all' }}
          onFilterChange={mockOnFilterChange}
        />
      );

      const trigger = screen.getByTestId('status-filter');
      expect(trigger).toHaveTextContent('Inactive');
    });

    it('should show All Status text when status is all', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'all', role: 'all' }}
          onFilterChange={mockOnFilterChange}
        />
      );

      const trigger = screen.getByTestId('status-filter');
      expect(trigger).toHaveTextContent('All Status');
    });
  });

  describe('AC#3: Role filter display', () => {
    it('should show All Roles text when role is all', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'active', role: 'all' }}
          onFilterChange={mockOnFilterChange}
        />
      );

      const trigger = screen.getByTestId('role-filter');
      expect(trigger).toHaveTextContent('All Roles');
    });

    it('should show Admin text when role is admin', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'active', role: 'admin' }}
          onFilterChange={mockOnFilterChange}
        />
      );

      const trigger = screen.getByTestId('role-filter');
      expect(trigger).toHaveTextContent('Admin');
    });

    it('should show Sales text when role is sales', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'active', role: 'sales' }}
          onFilterChange={mockOnFilterChange}
        />
      );

      const trigger = screen.getByTestId('role-filter');
      expect(trigger).toHaveTextContent('Sales');
    });
  });

  describe('Reset button', () => {
    it('should not show reset button when filter is default', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'active', role: 'all' }}
          onFilterChange={mockOnFilterChange}
        />
      );

      expect(screen.queryByTestId('reset-filter-btn')).not.toBeInTheDocument();
    });

    it('should show reset button when status is not default', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'inactive', role: 'all' }}
          onFilterChange={mockOnFilterChange}
        />
      );

      expect(screen.getByTestId('reset-filter-btn')).toBeInTheDocument();
    });

    it('should show reset button when role is not default', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'active', role: 'admin' }}
          onFilterChange={mockOnFilterChange}
        />
      );

      expect(screen.getByTestId('reset-filter-btn')).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('should have disabled attribute on filters when disabled', () => {
      render(
        <TeamMemberFilter
          filter={defaultFilter}
          onFilterChange={mockOnFilterChange}
          disabled={true}
        />
      );

      const statusFilter = screen.getByTestId('status-filter');
      const roleFilter = screen.getByTestId('role-filter');

      // Radix UI uses data-disabled attribute
      expect(statusFilter).toHaveAttribute('data-disabled');
      expect(roleFilter).toHaveAttribute('data-disabled');
    });
  });
});
