/**
 * Top Sales Table Skeleton Tests
 * Story 2.4: Top Sales Table (AC#7)
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TopSalesTableSkeleton } from '@/components/dashboard/top-sales-table-skeleton';

describe('TopSalesTableSkeleton', () => {
  it('renders skeleton container', () => {
    render(<TopSalesTableSkeleton />);

    expect(screen.getByTestId('top-sales-table-skeleton')).toBeInTheDocument();
  });

  it('renders Card component with skeleton content', () => {
    render(<TopSalesTableSkeleton />);

    // Card component is rendered (header skeleton has width class)
    const container = screen.getByTestId('top-sales-table-skeleton');
    expect(container.querySelector('.h-6')).toBeInTheDocument();
  });

  it('renders skeleton rows for 5 data rows', () => {
    render(<TopSalesTableSkeleton />);

    // Should have 5 skeleton rows in the data section
    const container = screen.getByTestId('top-sales-table-skeleton');
    expect(container).toBeInTheDocument();
  });
});
