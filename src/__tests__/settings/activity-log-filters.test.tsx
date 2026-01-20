/**
 * ActivityLogFilters Component Tests
 * Story 7.7: Activity Log Page
 *
 * Tests for activity log filter components.
 * AC#3: Filter by date range
 * AC#4: Filter by status
 * AC#5: Filter by changed by
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActivityLogFilters, type ActivityLogFiltersProps } from '@/components/settings/activity-log-filters';
import type { LeadStatus } from '@/types/lead';
import type { ChangedByOption } from '@/types/activity';

const mockChangedByOptions: ChangedByOption[] = [
  { id: 'U1234567890', name: 'John Sales' },
  { id: 'U9876543210', name: 'Jane Manager' },
  { id: 'System', name: 'System' },
];

describe('ActivityLogFilters Component', () => {
  const defaultProps: ActivityLogFiltersProps = {
    statusValue: [],
    dateRangeValue: null,
    changedByValue: null,
    changedByOptions: mockChangedByOptions,
    onStatusChange: vi.fn(),
    onDateRangeChange: vi.fn(),
    onChangedByChange: vi.fn(),
    onClearAll: vi.fn(),
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all filter components', () => {
      render(<ActivityLogFilters {...defaultProps} />);

      expect(screen.getByTestId('activity-log-filters')).toBeInTheDocument();
      expect(screen.getByTestId('activity-status-filter')).toBeInTheDocument();
      expect(screen.getByTestId('activity-date-filter')).toBeInTheDocument();
      expect(screen.getByTestId('activity-changed-by-filter')).toBeInTheDocument();
    });

    it('does not show Clear all button when no filters active', () => {
      render(<ActivityLogFilters {...defaultProps} />);

      expect(screen.queryByTestId('clear-all-filters')).not.toBeInTheDocument();
    });

    it('shows Clear all button when filters are active', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['new'] as LeadStatus[]}
        />
      );

      expect(screen.getByTestId('clear-all-filters')).toBeInTheDocument();
    });
  });

  describe('AC#4: Status Filter', () => {
    it('shows Status label by default', () => {
      render(<ActivityLogFilters {...defaultProps} />);

      expect(screen.getByTestId('status-filter-trigger')).toHaveTextContent('Status');
    });

    it('shows selected status count', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['new', 'contacted'] as LeadStatus[]}
        />
      );

      expect(screen.getByTestId('status-filter-trigger')).toHaveTextContent('2 statuses');
    });

    it('shows single status name when only one selected', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['closed'] as LeadStatus[]}
        />
      );

      expect(screen.getByTestId('status-filter-trigger')).toHaveTextContent('Closed');
    });

    it('opens status popover on click', () => {
      render(<ActivityLogFilters {...defaultProps} />);

      fireEvent.click(screen.getByTestId('status-filter-trigger'));

      // Popover content should be visible
      expect(screen.getByTestId('status-option-all')).toBeInTheDocument();
      expect(screen.getByTestId('status-option-new')).toBeInTheDocument();
      expect(screen.getByTestId('status-option-contacted')).toBeInTheDocument();
    });

    it('calls onStatusChange when status is toggled', () => {
      const onStatusChange = vi.fn();
      render(
        <ActivityLogFilters
          {...defaultProps}
          onStatusChange={onStatusChange}
        />
      );

      // Open popover
      fireEvent.click(screen.getByTestId('status-filter-trigger'));
      // Click on a status option
      fireEvent.click(screen.getByTestId('status-option-new'));

      expect(onStatusChange).toHaveBeenCalledWith(['new']);
    });

    it('removes status from selection when clicked again', () => {
      const onStatusChange = vi.fn();
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['new', 'contacted'] as LeadStatus[]}
          onStatusChange={onStatusChange}
        />
      );

      // Open popover
      fireEvent.click(screen.getByTestId('status-filter-trigger'));
      // Click on already selected status
      fireEvent.click(screen.getByTestId('status-option-new'));

      expect(onStatusChange).toHaveBeenCalledWith(['contacted']);
    });

    it('clears status when All Statuses is clicked', () => {
      const onStatusChange = vi.fn();
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['new', 'contacted'] as LeadStatus[]}
          onStatusChange={onStatusChange}
        />
      );

      // Open popover
      fireEvent.click(screen.getByTestId('status-filter-trigger'));
      // Click All Statuses
      fireEvent.click(screen.getByTestId('status-option-all'));

      expect(onStatusChange).toHaveBeenCalledWith([]);
    });

    it('shows clear button when status is selected', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['new'] as LeadStatus[]}
        />
      );

      expect(screen.getByTestId('status-filter-clear')).toBeInTheDocument();
    });

    it('clears status via clear button', () => {
      const onStatusChange = vi.fn();
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['new', 'contacted'] as LeadStatus[]}
          onStatusChange={onStatusChange}
        />
      );

      fireEvent.click(screen.getByTestId('status-filter-clear'));

      expect(onStatusChange).toHaveBeenCalledWith([]);
    });
  });

  describe('AC#3: Date Range Filter', () => {
    it('shows Date range label by default', () => {
      render(<ActivityLogFilters {...defaultProps} />);

      expect(screen.getByTestId('date-filter-trigger')).toHaveTextContent('Date range');
    });

    it('shows selected date range', () => {
      const from = new Date('2026-01-01');
      const to = new Date('2026-01-15');

      render(
        <ActivityLogFilters
          {...defaultProps}
          dateRangeValue={{ from, to }}
        />
      );

      // Should show formatted dates
      const trigger = screen.getByTestId('date-filter-trigger');
      expect(trigger).toHaveTextContent(/Jan/);
    });

    it('shows clear button when date range is selected', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          dateRangeValue={{ from: new Date(), to: new Date() }}
        />
      );

      expect(screen.getByTestId('date-filter-quick-clear')).toBeInTheDocument();
    });

    it('clears date range via quick clear button', () => {
      const onDateRangeChange = vi.fn();
      render(
        <ActivityLogFilters
          {...defaultProps}
          dateRangeValue={{ from: new Date(), to: new Date() }}
          onDateRangeChange={onDateRangeChange}
        />
      );

      fireEvent.click(screen.getByTestId('date-filter-quick-clear'));

      expect(onDateRangeChange).toHaveBeenCalledWith(null);
    });

    it('opens calendar popover on click', () => {
      render(<ActivityLogFilters {...defaultProps} />);

      fireEvent.click(screen.getByTestId('date-filter-trigger'));

      // Calendar should be visible
      expect(screen.getByTestId('date-filter-clear')).toBeInTheDocument();
      expect(screen.getByTestId('date-filter-apply')).toBeInTheDocument();
    });
  });

  describe('AC#5: Changed By Filter', () => {
    it('shows All users by default', () => {
      render(<ActivityLogFilters {...defaultProps} />);

      expect(screen.getByTestId('changed-by-trigger')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          isLoading={true}
        />
      );

      // Trigger should be disabled when loading
      const trigger = screen.getByTestId('changed-by-trigger');
      expect(trigger).toBeDisabled();
    });

    it('shows selected user name', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          changedByValue="U1234567890"
        />
      );

      // The select shows the selected value
      const trigger = screen.getByTestId('changed-by-trigger');
      expect(trigger).toHaveTextContent('John Sales');
    });

    it('shows clear button when user is selected', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          changedByValue="U1234567890"
        />
      );

      expect(screen.getByTestId('changed-by-filter-clear')).toBeInTheDocument();
    });

    it('clears changed by via clear button', () => {
      const onChangedByChange = vi.fn();
      render(
        <ActivityLogFilters
          {...defaultProps}
          changedByValue="U1234567890"
          onChangedByChange={onChangedByChange}
        />
      );

      fireEvent.click(screen.getByTestId('changed-by-filter-clear'));

      expect(onChangedByChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Clear All Filters', () => {
    it('calls onClearAll when clicked', () => {
      const onClearAll = vi.fn();
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['new'] as LeadStatus[]}
          onClearAll={onClearAll}
        />
      );

      fireEvent.click(screen.getByTestId('clear-all-filters'));

      expect(onClearAll).toHaveBeenCalled();
    });

    it('shows Clear all when date range is selected', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          dateRangeValue={{ from: new Date(), to: new Date() }}
        />
      );

      expect(screen.getByTestId('clear-all-filters')).toBeInTheDocument();
    });

    it('shows Clear all when changed by is selected', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          changedByValue="U1234567890"
        />
      );

      expect(screen.getByTestId('clear-all-filters')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables all filters when disabled prop is true', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          disabled={true}
        />
      );

      expect(screen.getByTestId('status-filter-trigger')).toBeDisabled();
      expect(screen.getByTestId('date-filter-trigger')).toBeDisabled();
      expect(screen.getByTestId('changed-by-trigger')).toBeDisabled();
    });
  });

  describe('filter combinations', () => {
    it('handles multiple filters simultaneously', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['new', 'contacted'] as LeadStatus[]}
          dateRangeValue={{ from: new Date(), to: new Date() }}
          changedByValue="U1234567890"
        />
      );

      // All filter indicators should be shown
      expect(screen.getByTestId('status-filter-clear')).toBeInTheDocument();
      expect(screen.getByTestId('date-filter-quick-clear')).toBeInTheDocument();
      expect(screen.getByTestId('changed-by-filter-clear')).toBeInTheDocument();
      expect(screen.getByTestId('clear-all-filters')).toBeInTheDocument();
    });
  });
});
