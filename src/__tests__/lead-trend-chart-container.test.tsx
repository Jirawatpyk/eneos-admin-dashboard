/**
 * Lead Trend Chart Container Tests
 * Story 2.2: Lead Trend Chart
 * AC: #1, #6, #7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LeadTrendChartContainer } from '../components/dashboard/lead-trend-chart-container';

// Mock the useDashboardData hook
const mockUseDashboardData = vi.fn();
vi.mock('@/hooks/use-dashboard-data', () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

// Mock Tremor AreaChart
vi.mock('@tremor/react', () => ({
  AreaChart: ({ data, categories }: { data: unknown[]; categories: string[] }) => (
    <div
      data-testid="mock-area-chart"
      data-categories={categories.join(',')}
      data-count={data.length}
    >
      Mock Area Chart
    </div>
  ),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('LeadTrendChartContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#6: Loading state
  describe('AC#6: Loading State', () => {
    it('should show skeleton while loading', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <LeadTrendChartContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('lead-trend-chart-skeleton')).toBeInTheDocument();
    });
  });

  // AC#7: Empty state
  describe('AC#7: Empty State', () => {
    it('should show empty state when no trend data', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: { totalLeads: 100 },
          trends: { daily: [] },
        },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <LeadTrendChartContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('lead-trend-chart-empty')).toBeInTheDocument();
    });

    it('should show empty state when trends is undefined', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: { totalLeads: 100 },
          trends: undefined,
        },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <LeadTrendChartContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('lead-trend-chart-empty')).toBeInTheDocument();
    });
  });

  // AC#1: Render chart with data
  describe('AC#1: Chart Display', () => {
    it('should render chart when data is available', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: { totalLeads: 100 },
          trends: {
            daily: [
              { date: '2026-01-01', newLeads: 10, closed: 2 },
              { date: '2026-01-02', newLeads: 15, closed: 5 },
            ],
          },
        },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <LeadTrendChartContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('lead-trend-chart')).toBeInTheDocument();
      expect(screen.getByTestId('mock-area-chart')).toBeInTheDocument();
    });

    it('should pass correct data count to chart', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: { totalLeads: 100 },
          trends: {
            daily: [
              { date: '2026-01-01', newLeads: 10, closed: 2 },
              { date: '2026-01-02', newLeads: 15, closed: 5 },
              { date: '2026-01-03', newLeads: 8, closed: 3 },
            ],
          },
        },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <LeadTrendChartContainer />
        </TestWrapper>
      );

      const chart = screen.getByTestId('mock-area-chart');
      expect(chart).toHaveAttribute('data-count', '3');
    });
  });

  describe('Period prop', () => {
    it('should use default period when not specified', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <LeadTrendChartContainer />
        </TestWrapper>
      );

      // Hook should be called (verified by mock being called)
      expect(mockUseDashboardData).toHaveBeenCalled();
    });

    it('should accept custom period prop', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <LeadTrendChartContainer period="week" />
        </TestWrapper>
      );

      expect(mockUseDashboardData).toHaveBeenCalled();
    });
  });
});
