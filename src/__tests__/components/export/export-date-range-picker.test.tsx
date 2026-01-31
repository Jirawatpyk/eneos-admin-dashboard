/**
 * ExportDateRangePicker Component Tests
 * Story 6.4: Custom Date Range - AC#2, AC#3, AC#4, AC#6
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportDateRangePicker } from '@/components/export/export-date-range-picker';
import type { DateRange } from 'react-day-picker';

describe('ExportDateRangePicker', () => {
  const mockOnChange = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#6: Display Selected Range Text', () => {
    it('shows "All dates (no filter)" when no range selected', () => {
      render(
        <ExportDateRangePicker
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      expect(screen.getByText('All dates (no filter)')).toBeInTheDocument();
    });

    it('shows formatted date range when value is set', () => {
      const range: DateRange = {
        from: new Date(2026, 0, 1),
        to: new Date(2026, 0, 31),
      };
      render(
        <ExportDateRangePicker
          value={range}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      expect(screen.getByText(/Jan 01, 2026 - Jan 31, 2026/)).toBeInTheDocument();
    });

    it('shows only from date when to is undefined', () => {
      const range: DateRange = {
        from: new Date(2026, 0, 15),
      };
      render(
        <ExportDateRangePicker
          value={range}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      expect(screen.getByText(/Jan 15, 2026/)).toBeInTheDocument();
    });

    it('shows preset badge when presetLabel is provided', () => {
      const range: DateRange = {
        from: new Date(2026, 0, 1),
        to: new Date(2026, 0, 31),
      };
      render(
        <ExportDateRangePicker
          value={range}
          onChange={mockOnChange}
          onClear={mockOnClear}
          presetLabel="This Month"
        />
      );
      expect(screen.getByTestId('preset-badge')).toHaveTextContent('This Month');
    });

    it('does not show preset badge when no presetLabel', () => {
      render(
        <ExportDateRangePicker
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      expect(screen.queryByTestId('preset-badge')).not.toBeInTheDocument();
    });
  });

  describe('AC#2: Popover with Apply/Clear/Cancel', () => {
    it('renders trigger button with data-testid', () => {
      render(
        <ExportDateRangePicker
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      expect(screen.getByTestId('date-range-trigger')).toBeInTheDocument();
    });

    it('renders trigger with aria-label', () => {
      render(
        <ExportDateRangePicker
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      expect(screen.getByLabelText('Select custom date range')).toBeInTheDocument();
    });

    it('opens popover and shows Apply/Clear/Cancel when trigger clicked', () => {
      render(
        <ExportDateRangePicker
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      fireEvent.click(screen.getByTestId('date-range-trigger'));
      expect(screen.getByTestId('date-range-apply')).toBeInTheDocument();
      expect(screen.getByTestId('date-range-clear')).toBeInTheDocument();
      expect(screen.getByTestId('date-range-cancel')).toBeInTheDocument();
    });

    it('Apply button is disabled when no range selected', () => {
      render(
        <ExportDateRangePicker
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      fireEvent.click(screen.getByTestId('date-range-trigger'));
      expect(screen.getByTestId('date-range-apply')).toBeDisabled();
    });

    it('calls onClear when Clear button clicked', () => {
      const range: DateRange = {
        from: new Date(2026, 0, 1),
        to: new Date(2026, 0, 31),
      };
      render(
        <ExportDateRangePicker
          value={range}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      fireEvent.click(screen.getByTestId('date-range-trigger'));
      fireEvent.click(screen.getByTestId('date-range-clear'));
      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  describe('AC#10: Keyboard Accessibility', () => {
    it('trigger button is accessible via keyboard', () => {
      render(
        <ExportDateRangePicker
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      const trigger = screen.getByTestId('date-range-trigger');
      expect(trigger.tagName).toBe('BUTTON');
    });
  });
});
