/**
 * Status Distribution Skeleton Tests
 * Story 2.3: Status Distribution Chart - AC#7
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusDistributionSkeleton } from '@/components/dashboard/status-distribution-skeleton';

describe('StatusDistributionSkeleton', () => {
  it('renders skeleton with correct structure', () => {
    render(<StatusDistributionSkeleton />);

    expect(screen.getByTestId('status-distribution-skeleton')).toBeInTheDocument();
  });

  it('renders card with header skeleton', () => {
    render(<StatusDistributionSkeleton />);

    // Card structure should be present
    const skeleton = screen.getByTestId('status-distribution-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders circular skeleton for chart', () => {
    render(<StatusDistributionSkeleton />);

    // Should have a circular skeleton representing the donut chart
    const skeleton = screen.getByTestId('status-distribution-skeleton');
    expect(skeleton.querySelector('.rounded-full')).toBeInTheDocument();
  });
});
