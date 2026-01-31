/**
 * Activity Log Empty Component Tests
 * Story 7-7 AC#8: Empty state when no entries match filters
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityLogEmpty } from '@/components/settings/activity-log-empty';

describe('ActivityLogEmpty', () => {
  describe('[P1] Without filters (initial empty state)', () => {
    it('should render empty state with no-activity message', () => {
      render(<ActivityLogEmpty hasFilters={false} />);

      expect(screen.getByTestId('activity-log-empty')).toBeInTheDocument();
      expect(screen.getByText('No activity yet')).toBeInTheDocument();
      expect(screen.getByText(/Activity log entries will appear/)).toBeInTheDocument();
    });

    it('should not show clear filters button', () => {
      render(<ActivityLogEmpty hasFilters={false} />);

      expect(screen.queryByTestId('clear-filters-btn')).not.toBeInTheDocument();
    });
  });

  describe('[P1] With filters (no matching results)', () => {
    it('should render no-matching message', () => {
      render(<ActivityLogEmpty hasFilters={true} />);

      expect(screen.getByText('No matching activities')).toBeInTheDocument();
      expect(screen.getByText(/No activity log entries match/)).toBeInTheDocument();
    });

    it('should show clear filters button when onClearFilters provided', () => {
      const onClear = vi.fn();
      render(<ActivityLogEmpty hasFilters={true} onClearFilters={onClear} />);

      const btn = screen.getByTestId('clear-filters-btn');
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Clear all filters');
    });

    it('should call onClearFilters when clear button clicked', () => {
      const onClear = vi.fn();
      render(<ActivityLogEmpty hasFilters={true} onClearFilters={onClear} />);

      fireEvent.click(screen.getByTestId('clear-filters-btn'));
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('should not show clear button when onClearFilters is not provided', () => {
      render(<ActivityLogEmpty hasFilters={true} />);

      expect(screen.queryByTestId('clear-filters-btn')).not.toBeInTheDocument();
    });
  });
});
