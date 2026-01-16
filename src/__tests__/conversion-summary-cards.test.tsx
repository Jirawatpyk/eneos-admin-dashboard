/**
 * Conversion Summary Cards Tests
 * Story 3.2: Conversion Rate Analytics
 *
 * AC#1: Summary cards display above performance table
 * AC#8: Responsive design (3 cols → 2 cols → 1 col)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversionSummaryCards } from '@/components/sales/conversion-summary-cards';
import type { SalesPerformanceData } from '@/types/sales';

// Mock data
const mockData: SalesPerformanceData = {
  teamPerformance: [
    {
      userId: 'user1',
      name: 'Alice',
      email: 'alice@eneos.co.th',
      claimed: 100,
      contacted: 80,
      closed: 35,
      lost: 10,
      unreachable: 5,
      conversionRate: 35,
      avgResponseTime: 120,
    },
    {
      userId: 'user2',
      name: 'Bob',
      email: 'bob@eneos.co.th',
      claimed: 50,
      contacted: 40,
      closed: 5,
      lost: 20,
      unreachable: 10,
      conversionRate: 10,
      avgResponseTime: 180,
    },
    {
      userId: 'user3',
      name: 'Charlie',
      email: 'charlie@eneos.co.th',
      claimed: 30,
      contacted: 20,
      closed: 2,
      lost: 15,
      unreachable: 8,
      conversionRate: 6.7,
      avgResponseTime: 240,
    },
  ],
  summary: {
    totalClaimed: 180,
    totalContacted: 140,
    totalClosed: 42,
    avgConversionRate: 23.3,
    avgResponseTime: 180,
  },
};

describe('ConversionSummaryCards', () => {
  const onFilterNeedsImprovement = vi.fn();
  const onHighlightBestPerformer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#1: Summary cards display
  describe('AC#1: Summary Cards Display', () => {
    it('renders all three summary cards', () => {
      render(
        <ConversionSummaryCards
          data={mockData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      expect(screen.getByText('Team Average')).toBeInTheDocument();
      expect(screen.getByText('Best Performer')).toBeInTheDocument();
      expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
    });

    it('renders cards container with data-testid', () => {
      render(
        <ConversionSummaryCards
          data={mockData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      expect(screen.getByTestId('conversion-summary-cards')).toBeInTheDocument();
    });
  });

  // AC#8: Responsive design (3 cols → 2 cols → 1 col based on screen size)
  // Story 3.7 updated layout: 2 rows (row1: 3 cards, row2: 2 cards)
  describe('AC#8: Responsive Grid Layout', () => {
    it('applies responsive grid classes (1 col mobile, 2 cols tablet, 3 cols desktop)', () => {
      render(
        <ConversionSummaryCards
          data={mockData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      const container = screen.getByTestId('conversion-summary-cards');
      // Container is now a wrapper with space-y-4, containing inner grid rows
      expect(container).toHaveClass('space-y-4');

      // First row grid should have responsive classes for 3 cards
      const firstRowGrid = container.querySelector('.grid.lg\\:grid-cols-3');
      expect(firstRowGrid).toBeInTheDocument();
    });
  });

  // AC#7: Loading states
  describe('AC#7: Loading State', () => {
    it('shows skeleton when loading', () => {
      render(
        <ConversionSummaryCards
          data={undefined}
          isLoading={true}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      expect(screen.getByTestId('conversion-summary-skeleton')).toBeInTheDocument();
    });
  });

  // AC#2: Team Average display
  describe('AC#2: Team Average Card', () => {
    it('displays team average conversion rate', () => {
      render(
        <ConversionSummaryCards
          data={mockData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      expect(screen.getByText('23.3%')).toBeInTheDocument();
    });

    it('displays 0.0% when average conversion rate is zero', () => {
      const zeroRateData: SalesPerformanceData = {
        teamPerformance: [
          {
            userId: 'user1',
            name: 'Alice',
            email: 'alice@eneos.co.th',
            claimed: 0,
            contacted: 0,
            closed: 0,
            lost: 0,
            unreachable: 0,
            conversionRate: 0,
            avgResponseTime: 0,
          },
        ],
        summary: {
          totalClaimed: 0,
          totalContacted: 0,
          totalClosed: 0,
          avgConversionRate: 0,
          avgResponseTime: 0,
        },
      };

      render(
        <ConversionSummaryCards
          data={zeroRateData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });

  // AC#3: Best Performer display
  describe('AC#3: Best Performer Card', () => {
    it('displays best performer name and rate', () => {
      render(
        <ConversionSummaryCards
          data={mockData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      // Alice has highest conversion rate (35%)
      // Use getByTestId to find best performer card specifically, since Alice may appear
      // in multiple places (e.g., Target Progress breakdown)
      const bestPerformerCard = screen.getByTestId('best-performer-card');
      expect(bestPerformerCard).toHaveTextContent('Alice');
      expect(bestPerformerCard).toHaveTextContent('35.0%');
    });

    it('resolves ties alphabetically by name', () => {
      // Create data where two people have the same conversion rate
      const tieData: SalesPerformanceData = {
        teamPerformance: [
          {
            userId: 'user-zara',
            name: 'Zara', // Alphabetically later
            email: 'zara@eneos.co.th',
            claimed: 100,
            contacted: 80,
            closed: 40,
            lost: 10,
            unreachable: 5,
            conversionRate: 40, // Same rate
            avgResponseTime: 120,
          },
          {
            userId: 'user-alice',
            name: 'Alice', // Alphabetically first - should be selected
            email: 'alice@eneos.co.th',
            claimed: 50,
            contacted: 40,
            closed: 20,
            lost: 5,
            unreachable: 5,
            conversionRate: 40, // Same rate
            avgResponseTime: 100,
          },
        ],
        summary: {
          totalClaimed: 150,
          totalContacted: 120,
          totalClosed: 60,
          avgConversionRate: 40,
          avgResponseTime: 110,
        },
      };

      render(
        <ConversionSummaryCards
          data={tieData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      // Alice should be selected (alphabetically first) despite Zara being first in array
      const bestPerformerCard = screen.getByTestId('best-performer-card');
      expect(bestPerformerCard).toHaveTextContent('Alice');
      expect(bestPerformerCard).not.toHaveTextContent('Zara');
    });

    it('calls onHighlightBestPerformer when clicked', () => {
      render(
        <ConversionSummaryCards
          data={mockData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      const bestPerformerCard = screen.getByTestId('best-performer-card');
      fireEvent.click(bestPerformerCard);

      expect(onHighlightBestPerformer).toHaveBeenCalledWith('user1');
    });
  });

  // AC#4: Needs Improvement display
  describe('AC#4: Needs Improvement Card', () => {
    it('displays count of sales below 10% threshold', () => {
      render(
        <ConversionSummaryCards
          data={mockData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      // Charlie has 6.7% (below 10%)
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Below 10% threshold')).toBeInTheDocument();
    });

    it('calls onFilterNeedsImprovement when clicked', () => {
      render(
        <ConversionSummaryCards
          data={mockData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      const needsImprovementCard = screen.getByTestId('needs-improvement-card');
      fireEvent.click(needsImprovementCard);

      expect(onFilterNeedsImprovement).toHaveBeenCalled();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles empty team data gracefully', () => {
      const emptyData: SalesPerformanceData = {
        teamPerformance: [],
        summary: {
          totalClaimed: 0,
          totalContacted: 0,
          totalClosed: 0,
          avgConversionRate: 0,
          avgResponseTime: 0,
        },
      };

      render(
        <ConversionSummaryCards
          data={emptyData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      expect(screen.getByText('0.0%')).toBeInTheDocument(); // Team average
      expect(screen.getByText('No data')).toBeInTheDocument(); // Best performer
    });

    it('shows positive message when everyone above threshold', () => {
      const allGoodData: SalesPerformanceData = {
        teamPerformance: [
          {
            userId: 'user1',
            name: 'Alice',
            email: 'alice@eneos.co.th',
            claimed: 100,
            contacted: 80,
            closed: 35,
            lost: 10,
            unreachable: 5,
            conversionRate: 35,
            avgResponseTime: 120,
          },
        ],
        summary: {
          totalClaimed: 100,
          totalContacted: 80,
          totalClosed: 35,
          avgConversionRate: 35,
          avgResponseTime: 120,
        },
      };

      render(
        <ConversionSummaryCards
          data={allGoodData}
          isLoading={false}
          onFilterNeedsImprovement={onFilterNeedsImprovement}
          onHighlightBestPerformer={onHighlightBestPerformer}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Everyone on track!')).toBeInTheDocument();
    });
  });
});
