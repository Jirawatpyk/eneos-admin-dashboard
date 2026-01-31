/**
 * Campaign Period Filter Tests
 * Story 5.8: Campaign Date Filter
 *
 * AC#1: Filter Dropdown Display - dropdown above Campaign Table, default "All Time"
 * AC#2: Filter Options - All Time, Today, This Week, This Month, Last Month, Custom Range
 * AC#4: URL Sync - updates URL with query param
 * AC#6: Visual Feedback - shows selected option, indicator for non-default
 * AC#7: Clear Filter - selecting "All Time" clears filter
 *
 * Note: Radix Select has jsdom pointer event issues.
 * Tests focus on render state and URL sync, not dropdown interaction.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParamsValue = '';
let mockSearchParamsFrom = '';
let mockSearchParamsTo = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/campaigns',
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'period') return mockSearchParamsValue || null;
      if (key === 'from') return mockSearchParamsFrom || null;
      if (key === 'to') return mockSearchParamsTo || null;
      return null;
    },
    toString: () => {
      const parts: string[] = [];
      if (mockSearchParamsValue) parts.push(`period=${mockSearchParamsValue}`);
      if (mockSearchParamsFrom) parts.push(`from=${mockSearchParamsFrom}`);
      if (mockSearchParamsTo) parts.push(`to=${mockSearchParamsTo}`);
      return parts.join('&');
    },
  }),
}));

// Import after mocking
import {
  CampaignPeriodFilter,
  CAMPAIGN_PERIOD_OPTIONS,
  isValidCampaignPeriod,
} from '@/components/campaigns/campaign-period-filter';

describe('CampaignPeriodFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsValue = '';
    mockSearchParamsFrom = '';
    mockSearchParamsTo = '';
  });

  describe('AC#1: Filter Dropdown Display', () => {
    it('renders period filter dropdown', () => {
      render(<CampaignPeriodFilter />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('has correct data-testid', () => {
      render(<CampaignPeriodFilter />);
      expect(screen.getByTestId('campaign-period-filter')).toBeInTheDocument();
    });

    it('defaults to "All Time" selection', () => {
      render(<CampaignPeriodFilter />);
      expect(screen.getByText(/all time/i)).toBeInTheDocument();
    });

    it('shows calendar icon', () => {
      render(<CampaignPeriodFilter />);
      expect(screen.getByTestId('campaign-period-filter-icon')).toBeInTheDocument();
    });
  });

  describe('AC#2: Filter Options', () => {
    it('exports CAMPAIGN_PERIOD_OPTIONS with correct values', () => {
      expect(CAMPAIGN_PERIOD_OPTIONS).toHaveLength(6);
      expect(CAMPAIGN_PERIOD_OPTIONS.map((o) => o.value)).toEqual([
        'allTime',
        'today',
        'week',
        'month',
        'lastMonth',
        'custom',
      ]);
    });

    it('has properly labeled options', () => {
      const labels = CAMPAIGN_PERIOD_OPTIONS.map((o) => o.label);
      expect(labels).toContain('All Time');
      expect(labels).toContain('Today');
      expect(labels).toContain('This Week');
      expect(labels).toContain('This Month');
      expect(labels).toContain('Last Month');
      expect(labels).toContain('Custom Range');
    });
  });

  describe('AC#4: URL Sync', () => {
    it('reads period "today" from URL search params', () => {
      mockSearchParamsValue = 'today';
      render(<CampaignPeriodFilter />);
      expect(screen.getByText(/today/i)).toBeInTheDocument();
    });

    it('reads period "week" from URL search params', () => {
      mockSearchParamsValue = 'week';
      render(<CampaignPeriodFilter />);
      expect(screen.getByText(/this week/i)).toBeInTheDocument();
    });

    it('reads period "month" from URL search params', () => {
      mockSearchParamsValue = 'month';
      render(<CampaignPeriodFilter />);
      expect(screen.getByText(/this month/i)).toBeInTheDocument();
    });

    it('reads period "lastMonth" from URL search params', () => {
      mockSearchParamsValue = 'lastMonth';
      render(<CampaignPeriodFilter />);
      expect(screen.getByText(/last month/i)).toBeInTheDocument();
    });

    it('falls back to "allTime" for invalid period', () => {
      mockSearchParamsValue = 'invalid';
      render(<CampaignPeriodFilter />);
      expect(screen.getByText(/all time/i)).toBeInTheDocument();
    });
  });

  describe('AC#6: Visual Feedback', () => {
    it('shows indicator for non-default filter (today)', () => {
      mockSearchParamsValue = 'today';
      render(<CampaignPeriodFilter />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-filter-active', 'true');
    });

    it('shows indicator for non-default filter (month)', () => {
      mockSearchParamsValue = 'month';
      render(<CampaignPeriodFilter />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-filter-active', 'true');
    });

    it('does not show indicator for default filter (allTime)', () => {
      render(<CampaignPeriodFilter />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toHaveAttribute('data-filter-active', 'true');
    });
  });

  describe('AC#5: Custom Date Range Integration', () => {
    it('shows CampaignCustomDateRange when period is custom', () => {
      mockSearchParamsValue = 'custom';
      render(<CampaignPeriodFilter />);
      expect(screen.getByTestId('campaign-custom-date-range')).toBeInTheDocument();
    });

    it('hides CampaignCustomDateRange for non-custom periods', () => {
      mockSearchParamsValue = 'month';
      render(<CampaignPeriodFilter />);
      expect(screen.queryByTestId('campaign-custom-date-range')).not.toBeInTheDocument();
    });
  });

  describe('isValidCampaignPeriod utility', () => {
    it('returns true for valid periods', () => {
      expect(isValidCampaignPeriod('allTime')).toBe(true);
      expect(isValidCampaignPeriod('today')).toBe(true);
      expect(isValidCampaignPeriod('week')).toBe(true);
      expect(isValidCampaignPeriod('month')).toBe(true);
      expect(isValidCampaignPeriod('lastMonth')).toBe(true);
      expect(isValidCampaignPeriod('custom')).toBe(true);
    });

    it('returns false for invalid periods', () => {
      expect(isValidCampaignPeriod('invalid')).toBe(false);
      expect(isValidCampaignPeriod('')).toBe(false);
      expect(isValidCampaignPeriod(null as unknown as string)).toBe(false);
    });
  });

  describe('Component Props', () => {
    it('accepts className prop', () => {
      render(<CampaignPeriodFilter className="custom-class" />);
      const container = screen.getByTestId('campaign-period-filter');
      expect(container).toHaveClass('custom-class');
    });
  });
});
