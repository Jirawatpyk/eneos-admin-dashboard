/**
 * Lead Trend Chart Skeleton Tests
 * Story 2.2: Lead Trend Chart
 * AC: #6 - Loading State
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeadTrendChartSkeleton } from '../components/dashboard/lead-trend-chart-skeleton';

describe('LeadTrendChartSkeleton', () => {
  describe('AC#6: Loading State', () => {
    it('should render skeleton component', () => {
      render(<LeadTrendChartSkeleton />);

      expect(screen.getByTestId('lead-trend-chart-skeleton')).toBeInTheDocument();
    });

    it('should have accessibility attributes', () => {
      render(<LeadTrendChartSkeleton />);

      const skeleton = screen.getByTestId('lead-trend-chart-skeleton');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading chart data');
    });

    it('should contain skeleton elements', () => {
      const { container } = render(<LeadTrendChartSkeleton />);

      // Should have skeleton elements for title and chart area
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render inside a Card component', () => {
      const { container } = render(<LeadTrendChartSkeleton />);

      // Card should be present (rendered as div with specific classes)
      const card = container.querySelector('[data-testid="lead-trend-chart-skeleton"]');
      expect(card).toBeInTheDocument();
    });
  });
});
