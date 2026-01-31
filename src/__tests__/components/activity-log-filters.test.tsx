/**
 * Activity Log Filters Tests
 * Story 7-7: AC#3, AC#4, AC#5 - Date, Status, Changed By Filters
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityLogFilters } from '@/components/settings/activity-log-filters';
import type { ActivityLogFiltersProps } from '@/components/settings/activity-log-filters';

const defaultProps: ActivityLogFiltersProps = {
  statusValue: [],
  dateRangeValue: null,
  changedByValue: null,
  changedByOptions: [
    { id: 'user-1', name: 'Alice Smith' },
    { id: 'user-2', name: 'Bob Jones' },
  ],
  onStatusChange: vi.fn(),
  onDateRangeChange: vi.fn(),
  onChangedByChange: vi.fn(),
  onClearAll: vi.fn(),
};

describe('ActivityLogFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('[P1] Rendering', () => {
    it('should render all three filter sections', () => {
      render(<ActivityLogFilters {...defaultProps} />);

      expect(screen.getByTestId('activity-log-filters')).toBeInTheDocument();
      expect(screen.getByTestId('activity-status-filter')).toBeInTheDocument();
      expect(screen.getByTestId('activity-date-filter')).toBeInTheDocument();
      expect(screen.getByTestId('activity-changed-by-filter')).toBeInTheDocument();
    });

    it('should render status filter trigger', () => {
      render(<ActivityLogFilters {...defaultProps} />);
      expect(screen.getByTestId('status-filter-trigger')).toBeInTheDocument();
    });

    it('should render date filter trigger', () => {
      render(<ActivityLogFilters {...defaultProps} />);
      expect(screen.getByTestId('date-filter-trigger')).toBeInTheDocument();
    });

    it('should render changed-by filter trigger', () => {
      render(<ActivityLogFilters {...defaultProps} />);
      expect(screen.getByTestId('changed-by-trigger')).toBeInTheDocument();
    });
  });

  describe('[P1] Clear all button', () => {
    it('should not show "Clear all" when no filters active', () => {
      render(<ActivityLogFilters {...defaultProps} />);
      expect(screen.queryByTestId('clear-all-filters')).not.toBeInTheDocument();
    });

    it('should show "Clear all" when status filter active', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['new']}
        />
      );
      expect(screen.getByTestId('clear-all-filters')).toBeInTheDocument();
    });

    it('should show "Clear all" when date filter active', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          dateRangeValue={{ from: new Date(), to: new Date() }}
        />
      );
      expect(screen.getByTestId('clear-all-filters')).toBeInTheDocument();
    });

    it('should show "Clear all" when changed-by filter active', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          changedByValue="user-1"
        />
      );
      expect(screen.getByTestId('clear-all-filters')).toBeInTheDocument();
    });

    it('should call onClearAll when "Clear all" clicked', () => {
      const onClearAll = vi.fn();
      render(
        <ActivityLogFilters
          {...defaultProps}
          statusValue={['new']}
          onClearAll={onClearAll}
        />
      );

      fireEvent.click(screen.getByTestId('clear-all-filters'));
      expect(onClearAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('[P1] Status filter display', () => {
    it('should display "Status" when no status selected', () => {
      render(<ActivityLogFilters {...defaultProps} />);
      expect(screen.getByTestId('status-filter-trigger')).toHaveTextContent('Status');
    });

    it('should not show status clear button when no selection', () => {
      render(<ActivityLogFilters {...defaultProps} />);
      expect(screen.queryByTestId('status-filter-clear')).not.toBeInTheDocument();
    });

    it('should show status clear button when status selected', () => {
      render(
        <ActivityLogFilters {...defaultProps} statusValue={['new']} />
      );
      expect(screen.getByTestId('status-filter-clear')).toBeInTheDocument();
    });
  });

  describe('[P1] Date range filter display', () => {
    it('should display "Date range" when no date selected', () => {
      render(<ActivityLogFilters {...defaultProps} />);
      expect(screen.getByTestId('date-filter-trigger')).toHaveTextContent('Date range');
    });

    it('should show quick clear when date range active', () => {
      render(
        <ActivityLogFilters
          {...defaultProps}
          dateRangeValue={{ from: new Date('2026-01-01'), to: new Date('2026-01-31') }}
        />
      );
      expect(screen.getByTestId('date-filter-quick-clear')).toBeInTheDocument();
    });
  });

  describe('[P1] Changed-by filter display', () => {
    it('should show clear button when user selected', () => {
      render(
        <ActivityLogFilters {...defaultProps} changedByValue="user-1" />
      );
      expect(screen.getByTestId('changed-by-filter-clear')).toBeInTheDocument();
    });

    it('should not show clear button when no user selected', () => {
      render(<ActivityLogFilters {...defaultProps} />);
      expect(screen.queryByTestId('changed-by-filter-clear')).not.toBeInTheDocument();
    });
  });
});
