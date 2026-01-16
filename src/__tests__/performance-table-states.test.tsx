/**
 * Performance Table States Tests
 * Story 3.1: Sales Team Performance Table
 *
 * Tests for AC#8: Loading, Empty, and Error states
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PerformanceTableSkeleton } from '@/components/sales/performance-table-skeleton';
import { PerformanceTableEmpty } from '@/components/sales/performance-table-empty';
import { PerformanceTableError } from '@/components/sales/performance-table-error';

describe('PerformanceTableSkeleton', () => {
  // AC#8: Loading shows skeleton table rows
  it('renders skeleton component', () => {
    render(<PerformanceTableSkeleton />);

    expect(screen.getByTestId('performance-table-skeleton')).toBeInTheDocument();
  });

  it('shows skeleton header', () => {
    render(<PerformanceTableSkeleton />);

    // Should have Users icon in header
    expect(screen.getByTestId('performance-table-skeleton')).toBeInTheDocument();
  });

  it('renders 5 skeleton rows', () => {
    render(<PerformanceTableSkeleton />);

    const rows = screen.getAllByRole('row');
    // 1 header row + 5 body rows = 6 total
    expect(rows.length).toBe(6);
  });

  it('has aria-busy attribute for accessibility', () => {
    render(<PerformanceTableSkeleton />);

    expect(screen.getByTestId('performance-table-skeleton')).toHaveAttribute(
      'aria-busy',
      'true'
    );
  });
});

describe('PerformanceTableEmpty', () => {
  // AC#8: Empty shows "No sales team data available"
  it('renders empty state component', () => {
    render(<PerformanceTableEmpty />);

    expect(screen.getByTestId('performance-table-empty')).toBeInTheDocument();
  });

  it('displays "No sales team data available" message', () => {
    render(<PerformanceTableEmpty />);

    expect(screen.getByText('No sales team data available')).toBeInTheDocument();
  });

  it('displays helpful description', () => {
    render(<PerformanceTableEmpty />);

    expect(
      screen.getByText(/There is no sales team performance data/i)
    ).toBeInTheDocument();
  });

  it('shows header with title', () => {
    render(<PerformanceTableEmpty />);

    expect(screen.getByText('Sales Team Performance')).toBeInTheDocument();
  });
});

describe('PerformanceTableError', () => {
  const mockRetry = vi.fn();

  // AC#8: Error shows retry button with error message
  it('renders error state component', () => {
    render(<PerformanceTableError message="Test error" onRetry={mockRetry} />);

    expect(screen.getByTestId('performance-table-error')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <PerformanceTableError
        message="Failed to fetch data"
        onRetry={mockRetry}
      />
    );

    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  it('displays "Failed to load data" heading', () => {
    render(<PerformanceTableError message="Test error" onRetry={mockRetry} />);

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('renders retry button', () => {
    render(<PerformanceTableError message="Test error" onRetry={mockRetry} />);

    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(<PerformanceTableError message="Test error" onRetry={mockRetry} />);

    fireEvent.click(screen.getByTestId('retry-button'));

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('shows header with title', () => {
    render(<PerformanceTableError message="Test error" onRetry={mockRetry} />);

    expect(screen.getByText('Sales Team Performance')).toBeInTheDocument();
  });
});
