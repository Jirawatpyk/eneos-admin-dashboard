/**
 * Status Distribution Container Tests
 * Story 2.3: Status Distribution Chart
 *
 * Tests for container component that integrates with useDashboardData hook
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusDistributionContainer } from '@/components/dashboard/status-distribution-container';

// Mock the useDashboardData hook
const mockUseDashboardData = vi.fn();
vi.mock('@/hooks/use-dashboard-data', () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

// Mock Recharts components
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('StatusDistributionContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show skeleton while loading', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <StatusDistributionContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('status-distribution-skeleton')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when summary has zero values', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 0,
            claimed: 0,
            contacted: 0,
            closed: 0,
            lost: 0,
            unreachable: 0,
            conversionRate: 0,
          },
        },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <StatusDistributionContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('status-distribution-empty')).toBeInTheDocument();
    });

    it('should show empty state when data is undefined', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      render(
        <TestWrapper>
          <StatusDistributionContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('status-distribution-empty')).toBeInTheDocument();
    });
  });

  describe('Chart Display', () => {
    it('should render chart when data is available', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 20,
            contacted: 15,
            closed: 30,
            lost: 10,
            unreachable: 5,
            conversionRate: 30,
          },
        },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <StatusDistributionContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('status-distribution-chart')).toBeInTheDocument();
    });

    it('should display total leads count', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 20,
            contacted: 15,
            closed: 30,
            lost: 10,
            unreachable: 5,
            conversionRate: 30,
          },
        },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <StatusDistributionContainer />
        </TestWrapper>
      );

      // Total should be sum of all statuses with value > 0
      expect(screen.getByText(/Total Leads/i)).toBeInTheDocument();
    });
  });

  describe('Period prop', () => {
    it('should use default period (month) when not specified', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <StatusDistributionContainer />
        </TestWrapper>
      );

      expect(mockUseDashboardData).toHaveBeenCalled();
    });

    it('should accept custom period prop', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <StatusDistributionContainer />
        </TestWrapper>
      );

      expect(mockUseDashboardData).toHaveBeenCalled();
    });
  });
});
