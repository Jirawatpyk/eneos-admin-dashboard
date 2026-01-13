/**
 * Date Filter Tests
 * Story 2.7: Date Filter
 *
 * AC#1: Filter Dropdown Display - dropdown in header, default "This Month"
 * AC#2: Filter Options - Today, This Week, This Month, Last Month, Custom Range
 * AC#4: URL Sync - updates URL with query param
 * AC#6: Visual Feedback - shows selected option
 *
 * Note: Radix Select has jsdom pointer event issues.
 * Tests focus on render state and URL sync, not dropdown interaction.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParamsValue = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'period') return mockSearchParamsValue || null;
      return null;
    },
    toString: () => mockSearchParamsValue ? `period=${mockSearchParamsValue}` : '',
  }),
}));

// Import after mocking
import { DateFilter, type Period, PERIOD_OPTIONS, isValidPeriod } from '@/components/dashboard/date-filter';

describe('DateFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsValue = '';
  });

  describe('AC#1: Filter Dropdown Display', () => {
    it('renders date filter dropdown', () => {
      render(<DateFilter />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('has correct data-testid', () => {
      render(<DateFilter />);
      expect(screen.getByTestId('date-filter')).toBeInTheDocument();
    });

    it('defaults to "This Month" selection', () => {
      render(<DateFilter />);
      expect(screen.getByText(/this month/i)).toBeInTheDocument();
    });

    it('shows calendar icon', () => {
      render(<DateFilter />);
      expect(screen.getByTestId('date-filter-icon')).toBeInTheDocument();
    });
  });

  describe('AC#2: Filter Options', () => {
    it('exports PERIOD_OPTIONS with correct values', () => {
      expect(PERIOD_OPTIONS).toHaveLength(5);
      expect(PERIOD_OPTIONS.map(o => o.value)).toEqual([
        'today', 'week', 'month', 'lastMonth', 'custom'
      ]);
    });

    it('has properly labeled options', () => {
      const labels = PERIOD_OPTIONS.map(o => o.label);
      expect(labels).toContain('Today');
      expect(labels).toContain('This Week');
      expect(labels).toContain('This Month');
      expect(labels).toContain('Last Month');
      expect(labels).toContain('Custom Range');
    });
  });

  describe('AC#4: URL Sync', () => {
    it('reads period "week" from URL search params', () => {
      mockSearchParamsValue = 'week';
      render(<DateFilter />);
      expect(screen.getByText(/this week/i)).toBeInTheDocument();
    });

    it('reads period "today" from URL search params', () => {
      mockSearchParamsValue = 'today';
      render(<DateFilter />);
      expect(screen.getByText(/today/i)).toBeInTheDocument();
    });

    it('reads period "lastMonth" from URL search params', () => {
      mockSearchParamsValue = 'lastMonth';
      render(<DateFilter />);
      expect(screen.getByText(/last month/i)).toBeInTheDocument();
    });

    it('falls back to "month" for invalid period', () => {
      mockSearchParamsValue = 'invalid';
      render(<DateFilter />);
      expect(screen.getByText(/this month/i)).toBeInTheDocument();
    });
  });

  describe('AC#6: Visual Feedback', () => {
    it('shows indicator for non-default filter (week)', () => {
      mockSearchParamsValue = 'week';
      render(<DateFilter />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-filter-active', 'true');
    });

    it('shows indicator for non-default filter (today)', () => {
      mockSearchParamsValue = 'today';
      render(<DateFilter />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-filter-active', 'true');
    });

    it('does not show indicator for default filter (month)', () => {
      mockSearchParamsValue = 'month';
      render(<DateFilter />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toHaveAttribute('data-filter-active', 'true');
    });

    it('does not show indicator when no filter set', () => {
      render(<DateFilter />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toHaveAttribute('data-filter-active', 'true');
    });
  });

  describe('Component Props', () => {
    it('accepts className prop', () => {
      render(<DateFilter className="custom-class" />);
      const container = screen.getByTestId('date-filter');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('isValidPeriod utility', () => {
    it('returns true for valid periods', () => {
      expect(isValidPeriod('today')).toBe(true);
      expect(isValidPeriod('week')).toBe(true);
      expect(isValidPeriod('month')).toBe(true);
      expect(isValidPeriod('lastMonth')).toBe(true);
      expect(isValidPeriod('custom')).toBe(true);
    });

    it('returns false for invalid periods', () => {
      expect(isValidPeriod('invalid')).toBe(false);
      expect(isValidPeriod('')).toBe(false);
      expect(isValidPeriod(null)).toBe(false);
    });
  });

  describe('Custom Date Range Integration', () => {
    it('shows CustomDateRange when period is custom', () => {
      mockSearchParamsValue = 'custom';
      render(<DateFilter />);
      expect(screen.getByTestId('custom-date-range')).toBeInTheDocument();
    });

    it('hides CustomDateRange for non-custom periods', () => {
      mockSearchParamsValue = 'month';
      render(<DateFilter />);
      expect(screen.queryByTestId('custom-date-range')).not.toBeInTheDocument();
    });
  });
});
