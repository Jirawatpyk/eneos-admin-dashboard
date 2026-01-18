/**
 * KPI Cards Grid Component Tests
 * Story 2.1: KPI Cards
 * AC: #1, #2, #3, #5, #6, #7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KPICardsGrid } from '../components/dashboard/kpi-cards-grid';

// Mock the useDashboardData hook
const mockUseDashboardData = vi.fn();
vi.mock('@/hooks/use-dashboard-data', () => ({
  useDashboardData: () => mockUseDashboardData(),
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

describe('KPICardsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#5: Loading state
  describe('AC#5: Loading State', () => {
    it('should show skeleton grid while loading', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('kpi-cards-skeleton-grid')).toBeInTheDocument();
    });
  });

  // AC#6: Error state
  describe('AC#6: Error State', () => {
    it('should show error state when API fails', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Network error' },
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', async () => {
      const mockRefetch = vi.fn();
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Failed' },
        refetch: mockRefetch,
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      screen.getByTestId('btn-retry').click();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  // AC#1: Four KPI cards display
  describe('AC#1: Four KPI Cards Display', () => {
    it('should render 4 KPI cards with data', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 10,
            lost: 5,
            unreachable: 5,
            conversionRate: 10,
            previousPeriodLeads: 80,
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('kpi-cards-grid')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-leads')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-claimed')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-contacted')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-closed')).toBeInTheDocument();
    });

    it('should display correct card titles', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 10,
            lost: 5,
            unreachable: 5,
            conversionRate: 10,
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByText('Total Leads')).toBeInTheDocument();
      expect(screen.getByText('Claimed')).toBeInTheDocument();
      expect(screen.getByText('Contacted')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
    });
  });

  // AC#2: Accurate data
  describe('AC#2: Accurate Data', () => {
    it('should display correct numeric values', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 1234,
            claimed: 567,
            contacted: 345,
            closed: 123,
            lost: 50,
            unreachable: 50,
            conversionRate: 10,
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('kpi-value-leads')).toHaveTextContent('1,234');
      expect(screen.getByTestId('kpi-value-claimed')).toHaveTextContent('567');
      expect(screen.getByTestId('kpi-value-contacted')).toHaveTextContent('345');
      expect(screen.getByTestId('kpi-value-closed')).toHaveTextContent('123');
    });
  });

  // AC#3: Percentage calculations
  describe('AC#3: Percentage/Rate Display', () => {
    it('should calculate and display claim rate', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 10,
            lost: 5,
            unreachable: 5,
            conversionRate: 10,
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      // 50/100 * 100 = 50%
      expect(screen.getByTestId('kpi-change-claimed')).toHaveTextContent('50.0%');
      expect(screen.getByTestId('kpi-change-claimed')).toHaveTextContent('claim rate');
    });

    it('should calculate and display contact rate', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 10,
            lost: 5,
            unreachable: 5,
            conversionRate: 10,
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      // 30/100 * 100 = 30%
      expect(screen.getByTestId('kpi-change-contacted')).toHaveTextContent('30.0%');
      expect(screen.getByTestId('kpi-change-contacted')).toHaveTextContent('contact rate');
    });

    it('should calculate and display close rate', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 10,
            lost: 5,
            unreachable: 5,
            conversionRate: 10,
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      // 10/100 * 100 = 10%
      expect(screen.getByTestId('kpi-change-closed')).toHaveTextContent('10.0%');
      expect(screen.getByTestId('kpi-change-closed')).toHaveTextContent('close rate');
    });

    it('should calculate % change vs previous period for Total Leads', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 10,
            lost: 5,
            unreachable: 5,
            conversionRate: 10,
            previousPeriodLeads: 80,
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      // (100-80)/80 * 100 = 25%
      expect(screen.getByTestId('kpi-change-leads')).toHaveTextContent('25.0%');
      expect(screen.getByTestId('kpi-change-leads')).toHaveTextContent('vs last period');
    });

    it('should handle division by zero gracefully', () => {
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
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      // Should not throw error
      expect(() => {
        render(
          <TestWrapper>
            <KPICardsGrid />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should show 0% change when both current and previous leads are 0', () => {
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
            previousPeriodLeads: 0,
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      // Should show 0% change, not -100% or NaN
      expect(screen.getByTestId('kpi-change-leads')).toHaveTextContent('0.0%');
    });

    // Story 0-13: Use changes object from API
    it('should use changes.totalLeads from API when available', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 10,
            lost: 5,
            unreachable: 5,
            conversionRate: 10,
            previousPeriodLeads: 80, // Old way (25% calculated)
            changes: {
              totalLeads: 50, // New way from API - should use this
              claimed: 20,
              closed: 15,
            },
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      // Should use changes.totalLeads (50%) not calculated from previousPeriodLeads (25%)
      expect(screen.getByTestId('kpi-change-leads')).toHaveTextContent('50.0%');
    });

    it('should show negative change from API correctly', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 50,
            claimed: 25,
            contacted: 15,
            closed: 5,
            lost: 3,
            unreachable: 2,
            conversionRate: 10,
            changes: {
              totalLeads: -25, // Negative change
              claimed: -10,
              closed: -5,
            },
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      // Should show negative change
      expect(screen.getByTestId('kpi-change-leads')).toHaveTextContent('-25.0%');
    });
  });

  // AC#7: Responsive layout
  describe('AC#7: Responsive Layout', () => {
    it('should have responsive grid classes', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 10,
            lost: 5,
            unreachable: 5,
            conversionRate: 10,
          },
          trends: { daily: [] },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <KPICardsGrid />
        </TestWrapper>
      );

      const grid = screen.getByTestId('kpi-cards-grid');
      // lg:grid-cols-4 = 4 columns on desktop
      expect(grid).toHaveClass('lg:grid-cols-4');
      // md:grid-cols-2 = 2 columns on tablet
      expect(grid).toHaveClass('md:grid-cols-2');
      // grid = stack vertically on mobile (default)
      expect(grid).toHaveClass('grid');
    });
  });

  it('should return null when no data', () => {
    mockUseDashboardData.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(
      <TestWrapper>
        <KPICardsGrid />
      </TestWrapper>
    );

    expect(container.firstChild).toBeNull();
  });
});
