/**
 * Team Member Filter Tests
 * Story 7-4 AC#2, AC#3: Status and Role Filter
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamMemberFilter } from '@/components/settings/team-member-filter';
import type { TeamFilter } from '@/types';

const defaultFilter: TeamFilter = { status: 'active', role: 'all' };

describe('TeamMemberFilter', () => {
  describe('[P1] Rendering', () => {
    it('should render filter container', () => {
      render(
        <TeamMemberFilter filter={defaultFilter} onFilterChange={vi.fn()} />
      );

      expect(screen.getByTestId('team-member-filter')).toBeInTheDocument();
      expect(screen.getByText('Filters:')).toBeInTheDocument();
    });

    it('should render status and role filter triggers', () => {
      render(
        <TeamMemberFilter filter={defaultFilter} onFilterChange={vi.fn()} />
      );

      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
      expect(screen.getByTestId('role-filter')).toBeInTheDocument();
    });
  });

  describe('[P1] Reset button visibility', () => {
    it('should not show reset button when filter is default', () => {
      render(
        <TeamMemberFilter filter={defaultFilter} onFilterChange={vi.fn()} />
      );

      expect(screen.queryByTestId('reset-filter-btn')).not.toBeInTheDocument();
    });

    it('should show reset button when status is not default', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'inactive', role: 'all' }}
          onFilterChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('reset-filter-btn')).toBeInTheDocument();
    });

    it('should show reset button when role is not default', () => {
      render(
        <TeamMemberFilter
          filter={{ status: 'active', role: 'admin' }}
          onFilterChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('reset-filter-btn')).toBeInTheDocument();
    });

    it('should call onFilterChange with defaults when reset clicked', () => {
      const onChange = vi.fn();
      render(
        <TeamMemberFilter
          filter={{ status: 'inactive', role: 'admin' }}
          onFilterChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('reset-filter-btn'));
      expect(onChange).toHaveBeenCalledWith({ status: 'active', role: 'all' });
    });
  });

  describe('[P1] Disabled state', () => {
    it('should disable filters when disabled prop is true', () => {
      render(
        <TeamMemberFilter
          filter={defaultFilter}
          onFilterChange={vi.fn()}
          disabled={true}
        />
      );

      expect(screen.getByTestId('status-filter')).toBeDisabled();
      expect(screen.getByTestId('role-filter')).toBeDisabled();
    });
  });
});
