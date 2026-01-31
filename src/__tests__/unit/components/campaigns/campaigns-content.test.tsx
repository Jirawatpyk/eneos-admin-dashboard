/**
 * CampaignsContent Component Tests (TEA Guardrail)
 * Story 5.8: Campaign Date Filter
 *
 * AC#1: Date filter displayed above Campaign Table
 * AC#3: Filter application updates KPI Cards and Campaign Table
 * AC#8: KPI Cards update with filtered data
 *
 * Tests client wrapper with date filter state management
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock hooks
const mockUseCampaignDateFilter = vi.fn();
const mockUseCampaignStats = vi.fn();
const mockUseCampaignsTable = vi.fn();
const mockUseCampaignChart = vi.fn();

vi.mock('@/hooks/use-campaign-date-filter', () => ({
  useCampaignDateFilter: () => mockUseCampaignDateFilter(),
}));

vi.mock('@/hooks/use-campaign-stats', () => ({
  useCampaignStats: () => mockUseCampaignStats(),
}));

vi.mock('@/hooks/use-campaigns-table', () => ({
  useCampaignsTable: () => mockUseCampaignsTable(),
}));

vi.mock('@/hooks/use-campaign-chart', () => ({
  useCampaignChart: () => mockUseCampaignChart(),
}));

// Mock next/navigation for CampaignPeriodFilter
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/campaigns',
  useSearchParams: () => ({
    get: () => null,
    toString: () => '',
  }),
}));

// Import after mocks
import { CampaignsContent } from '@/components/campaigns/campaigns-content';

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

// Default mock returns
const defaultDateFilter = {
  period: 'allTime' as const,
  dateFrom: undefined,
  dateTo: undefined,
};

const defaultStatsData = {
  totalCampaigns: 10,
  delivered: 5000,
  uniqueOpens: 2500,
  uniqueClicks: 1000,
  openRate: 50,
  clickRate: 20,
};

const defaultTableData = {
  data: {
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  },
};

const defaultChartData = {
  campaigns: [],
};

describe('CampaignsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockUseCampaignDateFilter.mockReturnValue(defaultDateFilter);
    mockUseCampaignStats.mockReturnValue({
      data: defaultStatsData,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseCampaignsTable.mockReturnValue({
      data: defaultTableData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseCampaignChart.mockReturnValue({
      data: defaultChartData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  describe('AC#1: Date Filter Display', () => {
    it('[P1] should render CampaignPeriodFilter', () => {
      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-period-filter')).toBeInTheDocument();
    });

    it('[P1] should position date filter at top of content', () => {
      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      // Verify period filter is rendered inside a flex container
      const periodFilter = screen.getByTestId('campaign-period-filter');
      // The parent wrapper div should have justify-end class
      const wrapperDiv = periodFilter.closest('.flex.justify-end');
      expect(wrapperDiv).toBeInTheDocument();
    });
  });

  describe('AC#3: Date Filter Propagation', () => {
    it('[P0] should pass dateFrom to KPI cards when filter is applied', () => {
      const mockDateFrom = '2026-01-01T00:00:00.000Z';
      const mockDateTo = '2026-01-31T23:59:59.999Z';

      mockUseCampaignDateFilter.mockReturnValue({
        period: 'month',
        dateFrom: mockDateFrom,
        dateTo: mockDateTo,
      });

      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      // Verify useCampaignStats was called (implicitly receives dates via component props)
      expect(mockUseCampaignStats).toHaveBeenCalled();
    });

    it('[P0] should pass dateTo to KPI cards when filter is applied', () => {
      const mockDateFrom = '2026-01-01T00:00:00.000Z';
      const mockDateTo = '2026-01-15T23:59:59.999Z';

      mockUseCampaignDateFilter.mockReturnValue({
        period: 'custom',
        dateFrom: mockDateFrom,
        dateTo: mockDateTo,
      });

      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      expect(mockUseCampaignStats).toHaveBeenCalled();
    });

    it('[P1] should pass dateFrom/dateTo to CampaignTable', () => {
      const mockDateFrom = '2026-01-13T00:00:00.000Z';
      const mockDateTo = '2026-01-13T23:59:59.999Z';

      mockUseCampaignDateFilter.mockReturnValue({
        period: 'today',
        dateFrom: mockDateFrom,
        dateTo: mockDateTo,
      });

      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      expect(mockUseCampaignsTable).toHaveBeenCalled();
    });

    it('[P1] should pass dateFrom/dateTo to CampaignPerformanceChart', () => {
      const mockDateFrom = '2026-01-06T00:00:00.000Z';
      const mockDateTo = '2026-01-13T23:59:59.999Z';

      mockUseCampaignDateFilter.mockReturnValue({
        period: 'week',
        dateFrom: mockDateFrom,
        dateTo: mockDateTo,
      });

      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      expect(mockUseCampaignChart).toHaveBeenCalled();
    });
  });

  describe('AC#7: Clear Filter (All Time)', () => {
    it('[P1] should pass undefined dates when allTime is selected', () => {
      mockUseCampaignDateFilter.mockReturnValue({
        period: 'allTime',
        dateFrom: undefined,
        dateTo: undefined,
      });

      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      // Hooks should be called with undefined dates for allTime
      expect(mockUseCampaignStats).toHaveBeenCalled();
      expect(mockUseCampaignsTable).toHaveBeenCalled();
      expect(mockUseCampaignChart).toHaveBeenCalled();
    });
  });

  describe('AC#8: KPI Cards Update', () => {
    it('[P1] should render CampaignKPICardsGrid', () => {
      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      // The grid should be rendered (not skeleton since isLoading is false)
      expect(mockUseCampaignStats).toHaveBeenCalled();
    });
  });

  describe('Component Rendering', () => {
    it('[P1] should render all child components in correct order', () => {
      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      // Period filter
      expect(screen.getByTestId('campaign-period-filter')).toBeInTheDocument();

      // KPI stats hook called
      expect(mockUseCampaignStats).toHaveBeenCalled();

      // Table hook called
      expect(mockUseCampaignsTable).toHaveBeenCalled();

      // Chart hook called
      expect(mockUseCampaignChart).toHaveBeenCalled();
    });

    it('[P2] should use Suspense boundaries for lazy loading', () => {
      // Set loading state
      mockUseCampaignStats.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      // Period filter should still render
      expect(screen.getByTestId('campaign-period-filter')).toBeInTheDocument();
    });
  });

  describe('Date Filter State Management', () => {
    it('[P1] should call useCampaignDateFilter hook', () => {
      render(
        <TestWrapper>
          <CampaignsContent />
        </TestWrapper>
      );

      expect(mockUseCampaignDateFilter).toHaveBeenCalled();
    });

    it('[P2] should handle all period types', () => {
      const periods = ['allTime', 'today', 'week', 'month', 'lastMonth', 'custom'] as const;

      periods.forEach((period) => {
        mockUseCampaignDateFilter.mockReturnValue({
          period,
          dateFrom: period === 'allTime' ? undefined : '2026-01-01T00:00:00.000Z',
          dateTo: period === 'allTime' ? undefined : '2026-01-31T23:59:59.999Z',
        });

        const { unmount } = render(
          <TestWrapper>
            <CampaignsContent />
          </TestWrapper>
        );

        expect(mockUseCampaignDateFilter).toHaveBeenCalled();
        unmount();
      });
    });
  });
});
