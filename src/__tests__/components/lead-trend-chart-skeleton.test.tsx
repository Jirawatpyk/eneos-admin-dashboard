/**
 * Lead Trend Chart Skeleton Tests
 * Story 2.2 AC#6: Loading state with skeleton placeholder
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeadTrendChartSkeleton } from '@/components/dashboard/lead-trend-chart-skeleton';

describe('LeadTrendChartSkeleton', () => {
  it('[P1] should render skeleton container', () => {
    render(<LeadTrendChartSkeleton />);

    expect(screen.getByTestId('lead-trend-chart-skeleton')).toBeInTheDocument();
  });

  it('[P1] should have aria-busy for accessibility', () => {
    render(<LeadTrendChartSkeleton />);

    const card = screen.getByTestId('lead-trend-chart-skeleton');
    expect(card).toHaveAttribute('aria-busy', 'true');
  });

  it('[P1] should have aria-label for screen readers', () => {
    render(<LeadTrendChartSkeleton />);

    const card = screen.getByTestId('lead-trend-chart-skeleton');
    expect(card).toHaveAttribute('aria-label', 'Loading chart data');
  });
});
