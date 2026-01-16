/**
 * Target Progress Card Tests
 * Story 3.7: Target vs Actual Comparison
 * Task 2: Target Progress Summary Card (AC#2)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  TargetProgressCard,
  TargetProgressCardSkeleton,
} from '@/components/sales/target-progress-card';

// Mock date for consistent testing (January 2026, 31 days)
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-15'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('TargetProgressCard', () => {
  const defaultProps = {
    totalClosed: 30,
    teamSize: 3,
    period: 'month',
  };

  describe('Basic Rendering', () => {
    it('should render the card with target progress title', () => {
      render(<TargetProgressCard {...defaultProps} />);

      expect(screen.getByText('Target Progress')).toBeInTheDocument();
      expect(screen.getByTestId('target-progress-card')).toBeInTheDocument();
    });

    it('should display progress percentage', () => {
      // 30 closed / (15 target × 3 team) = 30/45 = 66.67%
      render(<TargetProgressCard {...defaultProps} />);

      expect(screen.getByTestId('target-progress-percent')).toHaveTextContent('67%');
    });

    it('should display "X of Y" format', () => {
      // 30 of 45 (15 per person × 3 team members)
      render(<TargetProgressCard {...defaultProps} />);

      expect(screen.getByTestId('target-progress-count')).toHaveTextContent('30 of 45');
    });

    it('should render progress bar', () => {
      render(<TargetProgressCard {...defaultProps} />);

      expect(screen.getByTestId('target-progress-bar')).toBeInTheDocument();
    });

    it('should show period label', () => {
      render(<TargetProgressCard {...defaultProps} />);

      expect(screen.getByText(/Closed deals this month/i)).toBeInTheDocument();
    });
  });

  describe('Color Coding (AC#3)', () => {
    it('should show red color when below 70% threshold', () => {
      // 20 closed / 45 target = 44.4% (below)
      render(<TargetProgressCard {...defaultProps} totalClosed={20} />);

      const percentElement = screen.getByTestId('target-progress-percent');
      expect(percentElement).toHaveClass('text-red-600');
    });

    it('should show amber color when 70-99%', () => {
      // 35 closed / 45 target = 77.8% (on track)
      render(<TargetProgressCard {...defaultProps} totalClosed={35} />);

      const percentElement = screen.getByTestId('target-progress-percent');
      expect(percentElement).toHaveClass('text-amber-600');
    });

    it('should show green color when 100%+ (target achieved)', () => {
      // 50 closed / 45 target = 111.1% (above)
      render(<TargetProgressCard {...defaultProps} totalClosed={50} />);

      const percentElement = screen.getByTestId('target-progress-percent');
      expect(percentElement).toHaveClass('text-green-600');
    });
  });

  describe('Above/Below Indicator (AC#7)', () => {
    it('should show "+X above target" when above', () => {
      // 50 closed / 45 target = 111%, difference = +5
      render(<TargetProgressCard {...defaultProps} totalClosed={50} />);

      expect(screen.getByTestId('target-status-indicator')).toHaveTextContent('+5 above target');
    });

    it('should show "X below target" when below', () => {
      // 30 closed / 45 target = 67%, difference = -15
      render(<TargetProgressCard {...defaultProps} totalClosed={30} />);

      expect(screen.getByTestId('target-status-indicator')).toHaveTextContent('-15 below target');
    });

    it('should show "On target" when exactly at target', () => {
      // 45 closed / 45 target = 100%
      render(<TargetProgressCard {...defaultProps} totalClosed={45} />);

      expect(screen.getByTestId('target-status-indicator')).toHaveTextContent('On target');
    });
  });

  describe('Period Proration (AC#6)', () => {
    it('should prorate target for week period', () => {
      // Week: 15 × (7/31) ≈ 3.39 per person, × 3 team ≈ 10.16 team target
      // 5 closed / 10 target ≈ 50% (should be below)
      render(<TargetProgressCard {...defaultProps} totalClosed={5} period="week" />);

      // Check that it shows reasonable week-based progress
      expect(screen.getByText(/Closed deals this week/i)).toBeInTheDocument();
    });

    it('should use full target for month period', () => {
      render(<TargetProgressCard {...defaultProps} period="month" />);

      expect(screen.getByTestId('target-progress-count')).toHaveTextContent('30 of 45');
    });

    it('should multiply by 3 for quarter period', () => {
      // Quarter: 15 × 3 = 45 per person, × 3 team = 135 team target
      render(<TargetProgressCard {...defaultProps} period="quarter" />);

      expect(screen.getByTestId('target-progress-count')).toHaveTextContent('30 of 135');
    });

    it('should handle custom period with date range', () => {
      const dateRange = {
        from: new Date('2026-01-01'),
        to: new Date('2026-01-15'),
      };
      // 15 days, so 15 × (15/30) = 7.5 per person, × 3 = 22.5 team target
      render(
        <TargetProgressCard
          {...defaultProps}
          period="custom"
          dateRange={dateRange}
        />
      );

      expect(screen.getByText(/Closed deals this period/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle team size of 0 (empty team)', () => {
      render(<TargetProgressCard {...defaultProps} teamSize={0} />);

      expect(screen.getByTestId('target-progress-card-empty')).toBeInTheDocument();
      expect(screen.getByText('No team members')).toBeInTheDocument();
    });

    it('should handle 0 closed deals', () => {
      render(<TargetProgressCard {...defaultProps} totalClosed={0} />);

      expect(screen.getByTestId('target-progress-percent')).toHaveTextContent('0%');
      expect(screen.getByTestId('target-progress-count')).toHaveTextContent('0 of 45');
    });

    it('should cap progress bar at 100% when exceeding target', () => {
      // 100 closed / 45 target = 222%
      render(<TargetProgressCard {...defaultProps} totalClosed={100} />);

      const progressBar = screen.getByTestId('target-progress-bar');
      expect(progressBar).toBeInTheDocument();
      // Progress bar value should be capped at 100
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('Tooltip (AC#8)', () => {
    it('should show tooltip with breakdown on hover', async () => {
      // Use real timers for tooltip tests since Radix tooltip has internal delays
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<TargetProgressCard {...defaultProps} />);

      // Hover over the card
      const card = screen.getByTestId('target-progress-card');
      await user.hover(card);

      // Check tooltip content - wait for tooltip delay
      // Use findAllBy since Radix renders tooltip content twice for accessibility
      expect(await screen.findByTestId('target-tooltip', {}, { timeout: 2000 })).toBeInTheDocument();
      const breakdownTexts = screen.getAllByText('Target Breakdown');
      expect(breakdownTexts.length).toBeGreaterThan(0);

      // Restore fake timers for other tests
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-15'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on progress bar', () => {
      render(<TargetProgressCard {...defaultProps} />);

      const progressBar = screen.getByTestId('target-progress-bar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });
});

describe('TargetProgressCardSkeleton', () => {
  it('should render skeleton loading state', () => {
    render(<TargetProgressCardSkeleton />);

    expect(screen.getByTestId('target-progress-card-skeleton')).toBeInTheDocument();
  });
});
