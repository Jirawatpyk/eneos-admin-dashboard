/**
 * KPI Card Skeleton Tests
 * Story 2.1: KPI Cards
 * AC: #5 - Loading State
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KPICardSkeleton, KPICardsSkeletonGrid } from '../components/dashboard/kpi-card-skeleton';

describe('KPICardSkeleton', () => {
  // AC#5: Loading state with skeleton loaders
  describe('AC#5: Loading State', () => {
    it('should render skeleton card', () => {
      render(<KPICardSkeleton />);

      expect(screen.getByTestId('kpi-card-skeleton')).toBeInTheDocument();
    });

    it('should contain skeleton elements for title, icon, value, and change', () => {
      const { container } = render(<KPICardSkeleton />);

      // Should have multiple skeleton elements
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have accessibility attributes for screen readers', () => {
      render(<KPICardSkeleton />);

      const skeleton = screen.getByTestId('kpi-card-skeleton');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading KPI data');
    });
  });
});

describe('KPICardsSkeletonGrid', () => {
  it('should render 4 skeleton cards', () => {
    render(<KPICardsSkeletonGrid />);

    const skeletons = screen.getAllByTestId('kpi-card-skeleton');
    expect(skeletons).toHaveLength(4);
  });

  it('should render with grid layout', () => {
    render(<KPICardsSkeletonGrid />);

    const grid = screen.getByTestId('kpi-cards-skeleton-grid');
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('lg:grid-cols-4');
    expect(grid).toHaveClass('md:grid-cols-2');
  });
});
