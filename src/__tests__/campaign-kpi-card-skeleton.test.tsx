/**
 * Campaign KPI Card Skeleton Component Tests
 * Story 5.3: Campaign Summary Cards
 * AC#4: Loading state with skeleton loaders
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CampaignKPICardSkeleton, CampaignKPICardsSkeleton } from '../components/campaigns/campaign-kpi-card-skeleton';

describe('CampaignKPICardSkeleton', () => {
  it('should render skeleton card with data-testid', () => {
    render(<CampaignKPICardSkeleton />);

    expect(screen.getByTestId('campaign-kpi-card-skeleton')).toBeInTheDocument();
  });

  it('should have aria-busy attribute for accessibility', () => {
    render(<CampaignKPICardSkeleton />);

    const skeleton = screen.getByTestId('campaign-kpi-card-skeleton');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('should have aria-label for accessibility', () => {
    render(<CampaignKPICardSkeleton />);

    const skeleton = screen.getByTestId('campaign-kpi-card-skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading campaign KPI data');
  });
});

describe('CampaignKPICardsSkeleton', () => {
  it('should render skeleton grid with data-testid', () => {
    render(<CampaignKPICardsSkeleton />);

    expect(screen.getByTestId('campaign-kpi-cards-skeleton')).toBeInTheDocument();
  });

  it('should render exactly 4 skeleton cards', () => {
    render(<CampaignKPICardsSkeleton />);

    const grid = screen.getByTestId('campaign-kpi-cards-skeleton');
    const skeletons = within(grid).getAllByTestId('campaign-kpi-card-skeleton');
    expect(skeletons).toHaveLength(4);
  });

  it('should have responsive grid classes', () => {
    render(<CampaignKPICardsSkeleton />);

    const grid = screen.getByTestId('campaign-kpi-cards-skeleton');
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-4');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });
});
