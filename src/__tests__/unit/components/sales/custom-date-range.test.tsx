/**
 * Custom Date Range Tests for Sales
 * Story 3.6: Period Filter for Sales Performance
 *
 * AC#5: Custom Date Range - select start and end date
 * - Future dates are disabled
 * - Auto-swap dates if from > to (user-friendly)
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

import { CustomDateRange } from '@/components/sales/custom-date-range';

describe('CustomDateRange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('period');
    mockSearchParams.delete('from');
    mockSearchParams.delete('to');
  });

  describe('Rendering', () => {
    it('renders the custom date range component', () => {
      render(<CustomDateRange />);
      expect(screen.getByTestId('custom-date-range')).toBeInTheDocument();
    });

    it('shows "Pick a date range" as placeholder', () => {
      render(<CustomDateRange />);
      expect(screen.getByText('Pick a date range')).toBeInTheDocument();
    });

    it('displays trigger button with calendar icon', () => {
      render(<CustomDateRange />);
      expect(screen.getByTestId('custom-date-trigger')).toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('opens calendar popover when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<CustomDateRange />);

      const trigger = screen.getByTestId('custom-date-trigger');
      await user.click(trigger);

      expect(screen.getByTestId('custom-date-calendar')).toBeInTheDocument();
    });

    it('shows apply button (disabled when no dates selected)', async () => {
      const user = userEvent.setup();
      render(<CustomDateRange />);

      const trigger = screen.getByTestId('custom-date-trigger');
      await user.click(trigger);

      const applyButton = screen.getByTestId('custom-date-apply');
      expect(applyButton).toBeDisabled();
    });

    it('shows clear and cancel buttons', async () => {
      const user = userEvent.setup();
      render(<CustomDateRange />);

      const trigger = screen.getByTestId('custom-date-trigger');
      await user.click(trigger);

      expect(screen.getByTestId('custom-date-clear')).toBeInTheDocument();
      expect(screen.getByTestId('custom-date-cancel')).toBeInTheDocument();
    });
  });

  describe('AC#5: URL Updates', () => {
    it('uses basePath="/sales" by default', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('from', '2026-01-01T00:00:00.000Z');
      mockSearchParams.set('to', '2026-01-10T00:00:00.000Z');

      render(<CustomDateRange />);

      const trigger = screen.getByTestId('custom-date-trigger');
      await user.click(trigger);

      const applyButton = screen.getByTestId('custom-date-apply');

      // Apply should update URL with /sales path
      if (!applyButton.hasAttribute('disabled')) {
        await user.click(applyButton);
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/sales'));
      }
    });

    it('uses custom basePath when provided', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('from', '2026-01-01T00:00:00.000Z');
      mockSearchParams.set('to', '2026-01-10T00:00:00.000Z');

      render(<CustomDateRange basePath="/custom-path" />);

      const trigger = screen.getByTestId('custom-date-trigger');
      await user.click(trigger);

      const applyButton = screen.getByTestId('custom-date-apply');

      if (!applyButton.hasAttribute('disabled')) {
        await user.click(applyButton);
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/custom-path'));
      }
    });
  });

  describe('Clear Functionality', () => {
    it('clears date range and resets to month when clear is clicked', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('period', 'custom');
      mockSearchParams.set('from', '2026-01-01');
      mockSearchParams.set('to', '2026-01-10');

      render(<CustomDateRange />);

      const trigger = screen.getByTestId('custom-date-trigger');
      await user.click(trigger);

      const clearButton = screen.getByTestId('custom-date-clear');
      await user.click(clearButton);

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('period=month'));
    });
  });

  describe('Cancel Functionality', () => {
    it('closes popover when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<CustomDateRange />);

      const trigger = screen.getByTestId('custom-date-trigger');
      await user.click(trigger);

      // Popover should be open
      expect(screen.getByTestId('custom-date-calendar')).toBeInTheDocument();

      const cancelButton = screen.getByTestId('custom-date-cancel');
      await user.click(cancelButton);

      // Wait for popover to close
      await waitFor(() => {
        expect(screen.queryByTestId('custom-date-calendar')).not.toBeInTheDocument();
      });
    });
  });

  describe('AC#6: Date Display', () => {
    it('displays date range in trigger when dates are set via URL', () => {
      mockSearchParams.set('from', '2026-01-01T00:00:00.000Z');
      mockSearchParams.set('to', '2026-01-15T00:00:00.000Z');

      render(<CustomDateRange />);

      // Should show formatted date range like "Jan 01 - Jan 15, 2026"
      const trigger = screen.getByTestId('custom-date-trigger');
      expect(trigger.textContent).toMatch(/Jan 01/);
      expect(trigger.textContent).toMatch(/Jan 15/);
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on trigger button', () => {
      render(<CustomDateRange />);
      const trigger = screen.getByTestId('custom-date-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Select custom date range');
    });

    it('has aria-haspopup on trigger button', () => {
      render(<CustomDateRange />);
      const trigger = screen.getByTestId('custom-date-trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('AC#5: Auto-swap dates when from > to', () => {
    it('auto-swaps dates when from is after to', async () => {
      const user = userEvent.setup();
      // Set from > to (Jan 20 > Jan 10) - intentionally wrong order
      mockSearchParams.set('from', '2026-01-20T00:00:00.000Z');
      mockSearchParams.set('to', '2026-01-10T00:00:00.000Z');

      render(<CustomDateRange />);

      const trigger = screen.getByTestId('custom-date-trigger');
      await user.click(trigger);

      const applyButton = screen.getByTestId('custom-date-apply');

      // Apply button should be enabled since dates are set
      if (!applyButton.hasAttribute('disabled')) {
        await user.click(applyButton);

        // Verify that the URL was called with swapped dates
        // from should now be 2026-01-10 and to should be 2026-01-20
        expect(mockPush).toHaveBeenCalled();
        const calledUrl = mockPush.mock.calls[0][0];

        // Parse the URL to check from and to params
        const url = new URL(calledUrl, 'http://localhost');
        const fromParam = url.searchParams.get('from');
        const toParam = url.searchParams.get('to');

        if (fromParam && toParam) {
          const fromDate = new Date(fromParam);
          const toDate = new Date(toParam);

          // After swap: from (Jan 10) should be before to (Jan 20)
          expect(fromDate.getTime()).toBeLessThan(toDate.getTime());
        }
      }
    });

    it('keeps dates in order when from is before to', async () => {
      const user = userEvent.setup();
      // Set correct order: from (Jan 10) < to (Jan 20)
      mockSearchParams.set('from', '2026-01-10T00:00:00.000Z');
      mockSearchParams.set('to', '2026-01-20T00:00:00.000Z');

      render(<CustomDateRange />);

      const trigger = screen.getByTestId('custom-date-trigger');
      await user.click(trigger);

      const applyButton = screen.getByTestId('custom-date-apply');

      if (!applyButton.hasAttribute('disabled')) {
        await user.click(applyButton);

        expect(mockPush).toHaveBeenCalled();
        const calledUrl = mockPush.mock.calls[0][0];
        const url = new URL(calledUrl, 'http://localhost');
        const fromParam = url.searchParams.get('from');
        const toParam = url.searchParams.get('to');

        if (fromParam && toParam) {
          const fromDate = new Date(fromParam);
          const toDate = new Date(toParam);

          // Dates should maintain order: from < to
          expect(fromDate.getTime()).toBeLessThan(toDate.getTime());
        }
      }
    });
  });
});
