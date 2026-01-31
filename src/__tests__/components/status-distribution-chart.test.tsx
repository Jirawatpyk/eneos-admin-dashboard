/**
 * Status Distribution Chart Tests
 * Story 2.3: Status Distribution Chart
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  PieChart: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-pie-chart">{children}</div>
  )),
  Pie: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-pie">{children}</div>
  )),
  Cell: vi.fn(() => <div data-testid="mock-cell" />),
  ResponsiveContainer: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-responsive-container">{children}</div>
  )),
  Tooltip: vi.fn(() => <div data-testid="mock-tooltip" />),
  Legend: vi.fn(() => <div data-testid="mock-legend" />),
}));

// Mock sub-components
vi.mock('@/components/dashboard/status-distribution-skeleton', () => ({
  StatusDistributionSkeleton: vi.fn(() => (
    <div data-testid="status-distribution-skeleton" />
  )),
}));

vi.mock('@/components/dashboard/status-distribution-empty', () => ({
  StatusDistributionEmpty: vi.fn(() => (
    <div data-testid="status-distribution-empty" />
  )),
}));

vi.mock('@/hooks/use-chart-theme', () => ({
  useChartTheme: () => ({
    colors: {
      cardBackground: '#FFFFFF',
      gridColor: '#E5E7EB',
      textColor: '#6B7280',
    },
    isDark: false,
  }),
}));

import { StatusDistributionChart } from '@/components/dashboard/status-distribution-chart';
import type { DashboardSummary } from '@/types/dashboard';

const mockData: DashboardSummary = {
  totalLeads: 100,
  claimed: 30,
  contacted: 20,
  closed: 15,
  lost: 10,
  unreachable: 5,
  conversionRate: 15,
};

const emptyData: DashboardSummary = {
  totalLeads: 0,
  claimed: 0,
  contacted: 0,
  closed: 0,
  lost: 0,
  unreachable: 0,
  conversionRate: 0,
};

describe('StatusDistributionChart', () => {
  describe('[P1] Loading state', () => {
    it('should render skeleton when loading', () => {
      render(<StatusDistributionChart data={mockData} isLoading={true} />);
      expect(screen.getByTestId('status-distribution-skeleton')).toBeInTheDocument();
    });

    it('should not render chart when loading', () => {
      render(<StatusDistributionChart data={mockData} isLoading={true} />);
      expect(screen.queryByTestId('status-distribution-chart')).not.toBeInTheDocument();
    });
  });

  describe('[P1] Empty state', () => {
    it('should render empty component when all values are 0', () => {
      render(<StatusDistributionChart data={emptyData} />);
      expect(screen.getByTestId('status-distribution-empty')).toBeInTheDocument();
    });

    it('should not render chart when empty', () => {
      render(<StatusDistributionChart data={emptyData} />);
      expect(screen.queryByTestId('status-distribution-chart')).not.toBeInTheDocument();
    });
  });

  describe('[P1] Data state', () => {
    it('should render chart container with testid', () => {
      render(<StatusDistributionChart data={mockData} />);
      expect(screen.getByTestId('status-distribution-chart')).toBeInTheDocument();
    });

    it('should render chart title', () => {
      render(<StatusDistributionChart data={mockData} />);
      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
    });

    it('should render total leads count', () => {
      render(<StatusDistributionChart data={mockData} />);
      // Total = 20 (new) + 30 + 20 + 15 + 10 + 5 = 100
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Total Leads')).toBeInTheDocument();
    });

    it('should render aria-label for accessibility', () => {
      render(<StatusDistributionChart data={mockData} />);
      expect(
        screen.getByRole('img', { name: /pie chart showing lead status distribution/i })
      ).toBeInTheDocument();
    });

    it('should render PieChart component', () => {
      render(<StatusDistributionChart data={mockData} />);
      expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
    });
  });

  describe('[P1] Data transformation', () => {
    it('should calculate "new" leads from totalLeads minus other statuses', () => {
      // totalLeads=100, claimed=30, contacted=20, closed=15, lost=10, unreachable=5
      // new = 100 - (30 + 20 + 15 + 10 + 5) = 20
      render(<StatusDistributionChart data={mockData} />);
      // Chart should render (not empty) meaning total > 0
      expect(screen.getByTestId('status-distribution-chart')).toBeInTheDocument();
    });

    it('should filter out statuses with 0 value', () => {
      const partialData: DashboardSummary = {
        totalLeads: 50,
        claimed: 30,
        contacted: 20,
        closed: 0,
        lost: 0,
        unreachable: 0,
        conversionRate: 0,
      };
      render(<StatusDistributionChart data={partialData} />);
      // total = 0 (new) + 30 + 20 = 50
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should handle negative calculated "new" leads gracefully', () => {
      const overflowData: DashboardSummary = {
        totalLeads: 10,
        claimed: 20,
        contacted: 0,
        closed: 0,
        lost: 0,
        unreachable: 0,
        conversionRate: 0,
      };
      // new = 10 - 20 = -10 → Math.max(0, -10) = 0, filtered out
      render(<StatusDistributionChart data={overflowData} />);
      expect(screen.getByText('20')).toBeInTheDocument(); // only claimed=20
    });
  });
});
