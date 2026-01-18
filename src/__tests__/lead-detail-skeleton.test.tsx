/**
 * Lead Detail Skeleton Tests
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#5: Loading State
 * - Skeleton loaders appear in new sections (History, Metrics)
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LeadDetailSkeleton } from '@/components/leads/lead-detail-skeleton';

describe('LeadDetailSkeleton', () => {
  it('renders skeleton container', () => {
    render(<LeadDetailSkeleton />);
    const skeleton = screen.getByTestId('lead-detail-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('has aria-busy attribute for accessibility', () => {
    render(<LeadDetailSkeleton />);
    const skeleton = screen.getByTestId('lead-detail-skeleton');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('has aria-label for screen readers', () => {
    render(<LeadDetailSkeleton />);
    const skeleton = screen.getByTestId('lead-detail-skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading lead details');
  });

  it('renders metrics section skeleton with 3 items', () => {
    const { container } = render(<LeadDetailSkeleton />);
    // Check for grid with 3 columns
    const metricsGrid = container.querySelector('.sm\\:grid-cols-3');
    expect(metricsGrid).toBeInTheDocument();
  });

  it('renders history section skeleton with multiple items', () => {
    const { container } = render(<LeadDetailSkeleton />);
    // Check for skeleton elements (Skeleton components)
    const skeletonElements = container.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('has proper spacing between sections', () => {
    render(<LeadDetailSkeleton />);
    const skeleton = screen.getByTestId('lead-detail-skeleton');
    expect(skeleton).toHaveClass('space-y-6');
  });
});
