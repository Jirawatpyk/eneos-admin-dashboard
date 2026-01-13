/**
 * Lead Trend Chart Component Tests
 * Story 2.2: Lead Trend Chart
 * AC: #1, #2, #3, #4, #5, #6, #7, #8
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeadTrendChart } from '../components/dashboard/lead-trend-chart';
import type { DailyTrend } from '@/types/dashboard';

// Mock Tremor AreaChart to avoid actual chart rendering complexity
vi.mock('@tremor/react', () => ({
  AreaChart: ({ data, categories, colors, className, showLegend }: {
    data: unknown[];
    categories: string[];
    colors: string[];
    className: string;
    showLegend: boolean;
  }) => (
    <div
      data-testid="mock-area-chart"
      data-categories={categories.join(',')}
      data-colors={colors.join(',')}
      data-count={data.length}
      className={className}
      data-show-legend={showLegend}
    >
      Mock Area Chart
    </div>
  ),
}));

const mockTrendData: DailyTrend[] = [
  { date: '2026-01-01', newLeads: 10, closed: 2 },
  { date: '2026-01-02', newLeads: 15, closed: 5 },
  { date: '2026-01-03', newLeads: 8, closed: 3 },
  { date: '2026-01-04', newLeads: 20, closed: 8 },
  { date: '2026-01-05', newLeads: 12, closed: 4 },
];

describe('LeadTrendChart', () => {
  // AC#1: Line chart showing lead trends
  describe('AC#1: Line Chart Display', () => {
    it('should render the chart component', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      expect(screen.getByTestId('lead-trend-chart')).toBeInTheDocument();
    });

    it('should display chart title', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      expect(screen.getByText('Lead Trend (30 Days)')).toBeInTheDocument();
    });

    it('should render TrendingUp icon', () => {
      const { container } = render(<LeadTrendChart data={mockTrendData} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // AC#2: Dual line series (New Leads and Closed)
  describe('AC#2: Dual Line Series', () => {
    it('should configure chart with two categories', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      const chart = screen.getByTestId('mock-area-chart');
      expect(chart).toHaveAttribute('data-categories', 'New Leads,Closed');
    });

    it('should use correct colors (blue for New Leads, green for Closed)', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      const chart = screen.getByTestId('mock-area-chart');
      expect(chart).toHaveAttribute('data-colors', 'blue,emerald');
    });

    it('should pass correct data count to chart', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      const chart = screen.getByTestId('mock-area-chart');
      expect(chart).toHaveAttribute('data-count', '5');
    });
  });

  // AC#5: Legend display
  describe('AC#5: Legend', () => {
    it('should enable legend display', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      const chart = screen.getByTestId('mock-area-chart');
      expect(chart).toHaveAttribute('data-show-legend', 'true');
    });
  });

  // AC#6: Loading state
  describe('AC#6: Loading State', () => {
    it('should show skeleton when isLoading is true', () => {
      render(<LeadTrendChart isLoading={true} />);

      expect(screen.getByTestId('lead-trend-chart-skeleton')).toBeInTheDocument();
    });

    it('should not show chart when loading', () => {
      render(<LeadTrendChart isLoading={true} />);

      expect(screen.queryByTestId('lead-trend-chart')).not.toBeInTheDocument();
    });
  });

  // AC#7: Empty state
  describe('AC#7: Empty State', () => {
    it('should show empty state when data is undefined', () => {
      render(<LeadTrendChart data={undefined} />);

      expect(screen.getByTestId('lead-trend-chart-empty')).toBeInTheDocument();
    });

    it('should show empty state when data is empty array', () => {
      render(<LeadTrendChart data={[]} />);

      expect(screen.getByTestId('lead-trend-chart-empty')).toBeInTheDocument();
    });

    it('should not show chart when data is empty', () => {
      render(<LeadTrendChart data={[]} />);

      expect(screen.queryByTestId('lead-trend-chart')).not.toBeInTheDocument();
    });
  });

  // AC#8: Responsive sizing
  describe('AC#8: Responsive Sizing', () => {
    it('should have h-72 height class on chart', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      const chart = screen.getByTestId('mock-area-chart');
      expect(chart).toHaveClass('h-72');
    });
  });
});
