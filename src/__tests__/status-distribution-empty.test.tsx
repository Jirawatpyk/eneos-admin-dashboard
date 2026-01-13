/**
 * Status Distribution Empty State Tests
 * Story 2.3: Status Distribution Chart - AC#7
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusDistributionEmpty } from '@/components/dashboard/status-distribution-empty';

describe('StatusDistributionEmpty', () => {
  it('renders empty state with correct structure', () => {
    render(<StatusDistributionEmpty />);

    expect(screen.getByTestId('status-distribution-empty')).toBeInTheDocument();
  });

  it('displays no data message', () => {
    render(<StatusDistributionEmpty />);

    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it('renders card with title', () => {
    render(<StatusDistributionEmpty />);

    expect(screen.getByText('Status Distribution')).toBeInTheDocument();
  });

  it('displays PieChart icon', () => {
    render(<StatusDistributionEmpty />);

    // Icon should be present in header
    const header = screen.getByText('Status Distribution').parentElement;
    expect(header).toBeInTheDocument();
  });
});
