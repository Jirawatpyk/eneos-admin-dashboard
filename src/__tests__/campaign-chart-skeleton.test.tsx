/**
 * Campaign Chart Skeleton Tests
 * Story 5.6: Campaign Performance Chart
 * AC: #5
 *
 * Tests for CampaignChartSkeleton loading state
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignChartSkeleton } from '@/components/campaigns/campaign-chart-skeleton';

describe('CampaignChartSkeleton', () => {
  it('should render skeleton container', () => {
    render(<CampaignChartSkeleton />);
    expect(screen.getByTestId('campaign-chart-skeleton')).toBeInTheDocument();
  });

  it('should have aria-busy attribute for accessibility', () => {
    render(<CampaignChartSkeleton />);
    const skeleton = screen.getByTestId('campaign-chart-skeleton');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('should have aria-label for screen readers', () => {
    render(<CampaignChartSkeleton />);
    const skeleton = screen.getByTestId('campaign-chart-skeleton');
    expect(skeleton).toHaveAttribute(
      'aria-label',
      'Loading campaign performance chart'
    );
  });

  it('should display Campaign Performance title', () => {
    render(<CampaignChartSkeleton />);
    expect(screen.getByText('Campaign Performance')).toBeInTheDocument();
  });

  it('should render 5 skeleton rows', () => {
    const { container } = render(<CampaignChartSkeleton />);
    // Each row is a flex container with label skeleton + bar skeleton
    const rows = container.querySelectorAll('.flex.items-center.gap-4');
    expect(rows).toHaveLength(5);
  });
});
