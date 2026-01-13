/**
 * Top Sales Table Empty State Tests
 * Story 2.4: Top Sales Table (AC#7)
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TopSalesTableEmpty } from '@/components/dashboard/top-sales-table-empty';

describe('TopSalesTableEmpty', () => {
  it('renders empty state container', () => {
    render(<TopSalesTableEmpty />);

    expect(screen.getByTestId('top-sales-table-empty')).toBeInTheDocument();
  });

  it('displays empty message', () => {
    render(<TopSalesTableEmpty />);

    expect(screen.getByText('No sales data available')).toBeInTheDocument();
  });

  it('displays "Top Sales This Month" header', () => {
    render(<TopSalesTableEmpty />);

    expect(screen.getByText('Top Sales This Month')).toBeInTheDocument();
  });

  it('renders Trophy icon in header', () => {
    render(<TopSalesTableEmpty />);

    const header = screen.getByText('Top Sales This Month');
    expect(header.parentElement).toBeInTheDocument();
  });
});
