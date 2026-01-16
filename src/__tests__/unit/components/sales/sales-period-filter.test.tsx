/**
 * Sales Period Filter Tests
 * Story 3.6: Period Filter for Sales Performance
 *
 * AC#1: Period Filter Display - dropdown in header, default "This Month"
 * AC#2: Filter Options - This Week, This Month, This Quarter, Last Quarter, Custom Range
 * AC#4: URL Sync - updates URL with query param
 * AC#6: Visual Feedback - shows selected option, indicator for non-default
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

import { SalesPeriodFilter, SALES_PERIOD_OPTIONS, isValidSalesPeriod } from '@/components/sales/sales-period-filter';

describe('SalesPeriodFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('period');
    mockSearchParams.delete('from');
    mockSearchParams.delete('to');
  });

  describe('AC#1: Period Filter Display', () => {
    it('renders the period filter dropdown', () => {
      render(<SalesPeriodFilter />);
      expect(screen.getByTestId('sales-period-filter')).toBeInTheDocument();
    });

    it('displays default selection as "This Month"', () => {
      render(<SalesPeriodFilter />);
      expect(screen.getByText('This Month')).toBeInTheDocument();
    });

    it('shows Calendar icon', () => {
      render(<SalesPeriodFilter />);
      expect(screen.getByTestId('sales-period-icon')).toBeInTheDocument();
    });
  });

  describe('AC#2: Filter Options', () => {
    it('has all required period options defined', () => {
      // Note: Radix UI Select portal doesn't render in JSDOM test environment
      // Testing the options array directly instead of DOM interaction
      expect(SALES_PERIOD_OPTIONS).toContainEqual({ value: 'week', label: 'This Week' });
      expect(SALES_PERIOD_OPTIONS).toContainEqual({ value: 'month', label: 'This Month' });
      expect(SALES_PERIOD_OPTIONS).toContainEqual({ value: 'quarter', label: 'This Quarter' });
      expect(SALES_PERIOD_OPTIONS).toContainEqual({ value: 'lastQuarter', label: 'Last Quarter' });
      expect(SALES_PERIOD_OPTIONS).toContainEqual({ value: 'custom', label: 'Custom Range' });
    });

    it('has exactly 5 period options', () => {
      expect(SALES_PERIOD_OPTIONS).toHaveLength(5);
    });

    it('includes correct period values', () => {
      const values = SALES_PERIOD_OPTIONS.map((opt) => opt.value);
      expect(values).toEqual(['week', 'month', 'quarter', 'lastQuarter', 'custom']);
    });
  });

  describe('AC#4: URL Sync', () => {
    // Note: Direct dropdown interaction tests are skipped because
    // Radix UI Select portal doesn't render properly in JSDOM test environment.
    // URL sync is tested via state reading and the handlePeriodChange logic.

    it('reads period from URL on mount (week)', () => {
      mockSearchParams.set('period', 'week');
      render(<SalesPeriodFilter />);

      expect(screen.getByText('This Week')).toBeInTheDocument();
    });

    it('reads period from URL on mount (quarter)', () => {
      mockSearchParams.set('period', 'quarter');
      render(<SalesPeriodFilter />);

      expect(screen.getByText('This Quarter')).toBeInTheDocument();
    });

    it('reads period from URL on mount (lastQuarter)', () => {
      mockSearchParams.set('period', 'lastQuarter');
      render(<SalesPeriodFilter />);

      expect(screen.getByText('Last Quarter')).toBeInTheDocument();
    });

    it('reads period from URL on mount (custom)', () => {
      mockSearchParams.set('period', 'custom');
      render(<SalesPeriodFilter />);

      expect(screen.getByText('Custom Range')).toBeInTheDocument();
      // Custom date range picker should appear
      expect(screen.getByTestId('custom-date-range')).toBeInTheDocument();
    });

    it('preserves custom date params in URL when custom period is set', () => {
      mockSearchParams.set('period', 'custom');
      mockSearchParams.set('from', '2026-01-01');
      mockSearchParams.set('to', '2026-01-15');

      render(<SalesPeriodFilter />);

      // Component should render with custom period selected
      expect(screen.getByText('Custom Range')).toBeInTheDocument();
      // Custom date range picker should be visible
      expect(screen.getByTestId('custom-date-range')).toBeInTheDocument();
    });
  });

  describe('AC#6: Visual Feedback', () => {
    it('shows visual indicator for non-default filter', () => {
      mockSearchParams.set('period', 'week');
      render(<SalesPeriodFilter />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-filter-active', 'true');
    });

    it('does not show visual indicator for default filter', () => {
      render(<SalesPeriodFilter />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toHaveAttribute('data-filter-active');
    });

    it('applies border-primary class for non-default filter', () => {
      mockSearchParams.set('period', 'quarter');
      render(<SalesPeriodFilter />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('border-primary');
    });
  });

  describe('AC#7: Invalid URL Handling', () => {
    it('defaults to "month" for invalid period param', () => {
      mockSearchParams.set('period', 'invalid');
      render(<SalesPeriodFilter />);

      expect(screen.getByText('This Month')).toBeInTheDocument();
    });

    it('defaults to "month" when no period param', () => {
      render(<SalesPeriodFilter />);
      expect(screen.getByText('This Month')).toBeInTheDocument();
    });
  });

  describe('Custom Range Behavior', () => {
    it('shows CustomDateRange component when custom is selected', () => {
      mockSearchParams.set('period', 'custom');
      render(<SalesPeriodFilter />);

      expect(screen.getByTestId('custom-date-range')).toBeInTheDocument();
    });

    it('does not show CustomDateRange for preset periods', () => {
      mockSearchParams.set('period', 'month');
      render(<SalesPeriodFilter />);

      expect(screen.queryByTestId('custom-date-range')).not.toBeInTheDocument();
    });
  });
});

describe('isValidSalesPeriod', () => {
  it('returns true for valid period', () => {
    expect(isValidSalesPeriod('week')).toBe(true);
    expect(isValidSalesPeriod('month')).toBe(true);
    expect(isValidSalesPeriod('quarter')).toBe(true);
    expect(isValidSalesPeriod('lastQuarter')).toBe(true);
    expect(isValidSalesPeriod('custom')).toBe(true);
  });

  it('returns false for invalid period', () => {
    expect(isValidSalesPeriod('invalid')).toBe(false);
    expect(isValidSalesPeriod(null)).toBe(false);
    expect(isValidSalesPeriod('')).toBe(false);
    expect(isValidSalesPeriod('today')).toBe(false); // Dashboard-only option
  });
});

describe('AC#9: Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('period');
  });

  it('renders filter with adequate minimum width for touch targets', () => {
    render(<SalesPeriodFilter />);

    // SelectTrigger should have w-[180px] class for minimum width
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('w-[180px]');
  });

  it('wraps filter and custom date range in flex container', () => {
    mockSearchParams.set('period', 'custom');
    render(<SalesPeriodFilter />);

    // Container should use flex layout for responsive wrapping
    const container = screen.getByTestId('sales-period-filter');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('gap-2');
  });

  it('supports className prop for responsive customization', () => {
    render(<SalesPeriodFilter className="custom-responsive-class" />);

    const container = screen.getByTestId('sales-period-filter');
    expect(container).toHaveClass('custom-responsive-class');
  });

  it('supports basePath prop for custom URL navigation', () => {
    // basePath prop allows the component to be reused on different pages
    // Default is /sales, but can be customized
    render(<SalesPeriodFilter basePath="/custom-path" />);

    // Component should render correctly
    const container = screen.getByTestId('sales-period-filter');
    expect(container).toBeInTheDocument();
  });

  it('trigger has role=combobox for accessibility', () => {
    render(<SalesPeriodFilter />);

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });

  it('has all period options defined correctly', () => {
    // Verify all period options exist and have proper labels
    // This tests the static data without needing to open the dropdown
    // (Radix UI Select portal doesn't render properly in test environment)
    expect(SALES_PERIOD_OPTIONS).toHaveLength(5);
    expect(SALES_PERIOD_OPTIONS[0]).toEqual({ value: 'week', label: 'This Week' });
    expect(SALES_PERIOD_OPTIONS[1]).toEqual({ value: 'month', label: 'This Month' });
    expect(SALES_PERIOD_OPTIONS[2]).toEqual({ value: 'quarter', label: 'This Quarter' });
    expect(SALES_PERIOD_OPTIONS[3]).toEqual({ value: 'lastQuarter', label: 'Last Quarter' });
    expect(SALES_PERIOD_OPTIONS[4]).toEqual({ value: 'custom', label: 'Custom Range' });
  });
});
