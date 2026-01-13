/**
 * Lead Trend Chart Component Tests
 * Story 2.2: Lead Trend Chart
 * AC: #1, #2, #3, #4, #5, #6, #7, #8
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeadTrendChart } from '../components/dashboard/lead-trend-chart';
import type { DailyTrend } from '@/types/dashboard';

// Mock Recharts components to avoid rendering complexity
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="recharts-area-chart" data-count={data.length}>
      {children}
    </div>
  ),
  Area: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
    <div data-testid={`area-${dataKey}`} data-stroke={stroke} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: ({ content }: { content: React.ReactNode }) => (
    <div data-testid="legend">{content}</div>
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
    it('should render both area series', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      expect(screen.getByTestId('area-newLeads')).toBeInTheDocument();
      expect(screen.getByTestId('area-closed')).toBeInTheDocument();
    });

    it('should use correct colors for areas', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      const newLeadsArea = screen.getByTestId('area-newLeads');
      const closedArea = screen.getByTestId('area-closed');

      // LEAD_TREND_COLORS.newLeads = '#6366F1' (Indigo-500)
      // LEAD_TREND_COLORS.closed = '#10B981' (Emerald-500)
      expect(newLeadsArea).toHaveAttribute('data-stroke', '#6366F1');
      expect(closedArea).toHaveAttribute('data-stroke', '#10B981');
    });

    it('should pass correct data count to chart', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      const chart = screen.getByTestId('recharts-area-chart');
      expect(chart).toHaveAttribute('data-count', '5');
    });
  });

  // AC#5: Legend display
  describe('AC#5: Legend', () => {
    it('should render legend component', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
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
    it('should use ResponsiveContainer', () => {
      render(<LeadTrendChart data={mockTrendData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });
});
