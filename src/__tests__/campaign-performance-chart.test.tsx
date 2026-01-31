/**
 * Campaign Performance Chart Tests
 * Story 5.6: Campaign Performance Chart
 * AC: #1-#9
 *
 * Tests for CampaignPerformanceChart component and ChartTooltip
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  CampaignPerformanceChart,
  ChartTooltip,
} from '@/components/campaigns/campaign-performance-chart';
import type { ChartDataItem } from '@/types/campaigns';

// ===========================================
// Mock Recharts (SVG rendering not supported in JSDOM)
// ===========================================

const mockRechartsBarChart = vi.hoisted(() => ({
  ResponsiveContainer: ({
    children,
    height,
  }: {
    children: React.ReactNode;
    height: number;
  }) => (
    <div data-testid="responsive-container" data-height={height}>
      {children}
    </div>
  ),
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown[];
  }) => (
    <div data-testid="recharts-bar-chart" data-count={data.length}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill, name }: { dataKey: string; fill: string; name: string }) => (
    <div data-testid={`bar-${dataKey}`} data-fill={fill} data-name={name} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: ({ dataKey }: { dataKey?: string }) => (
    <div data-testid="y-axis" data-datakey={dataKey} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ content }: { content: React.ReactNode }) => (
    <div data-testid="tooltip">{content}</div>
  ),
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: ({
    x,
    stroke,
    strokeDasharray,
  }: {
    x: number;
    stroke: string;
    strokeDasharray: string;
  }) => (
    <div
      data-testid={`reference-line-${x}`}
      data-x={x}
      data-stroke={stroke}
      data-dasharray={strokeDasharray}
    />
  ),
}));

vi.mock('recharts', () => mockRechartsBarChart);

// ===========================================
// Mock useCampaignChart hook
// ===========================================

const mockUseCampaignChart = vi.fn();
vi.mock('@/hooks/use-campaign-chart', () => ({
  useCampaignChart: (options: unknown) => mockUseCampaignChart(options),
}));

// ===========================================
// Test Setup
// ===========================================

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
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

// ===========================================
// Mock Data
// ===========================================

const mockChartData: ChartDataItem[] = [
  {
    campaignName: 'Spring Campaign',
    campaignId: 1,
    openRate: 35.0,
    clickRate: 7.0,
    delivered: 8000,
  },
  {
    campaignName: 'Q1 Newsletter',
    campaignId: 2,
    openRate: 25.0,
    clickRate: 3.3,
    delivered: 3000,
  },
  {
    campaignName: 'Winter Promo 2026',
    campaignId: 3,
    openRate: 24.0,
    clickRate: 4.0,
    delivered: 5000,
  },
];

// ===========================================
// ChartTooltip Tests (AC#3)
// ===========================================

describe('ChartTooltip', () => {
  it('should render nothing when not active', () => {
    const { container } = render(
      <ChartTooltip active={false} payload={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when payload is empty', () => {
    const { container } = render(
      <ChartTooltip active={true} payload={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should display campaign name', () => {
    const payload = [
      {
        dataKey: 'openRate',
        value: 35.0,
        payload: mockChartData[0],
        color: '#3B82F6',
      },
    ];

    render(<ChartTooltip active={true} payload={payload} />);
    expect(screen.getByText('Spring Campaign')).toBeInTheDocument();
  });

  it('should display metric type and percentage', () => {
    const payload = [
      {
        dataKey: 'openRate',
        value: 35.0,
        payload: mockChartData[0],
        color: '#3B82F6',
      },
      {
        dataKey: 'clickRate',
        value: 7.0,
        payload: mockChartData[0],
        color: '#10B981',
      },
    ];

    render(<ChartTooltip active={true} payload={payload} />);
    expect(screen.getByText('Open Rate:')).toBeInTheDocument();
    expect(screen.getByText('Click Rate:')).toBeInTheDocument();
    expect(screen.getByText('35.0%')).toBeInTheDocument();
    expect(screen.getByText('7.0%')).toBeInTheDocument();
  });

  it('should display delivered count', () => {
    const payload = [
      {
        dataKey: 'openRate',
        value: 35.0,
        payload: mockChartData[0],
        color: '#3B82F6',
      },
    ];

    render(<ChartTooltip active={true} payload={payload} />);
    expect(screen.getByText('Delivered: 8,000')).toBeInTheDocument();
  });

  it('should have data-testid for tooltip container', () => {
    const payload = [
      {
        dataKey: 'openRate',
        value: 25.0,
        payload: mockChartData[1],
        color: '#3B82F6',
      },
    ];

    render(<ChartTooltip active={true} payload={payload} />);
    expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();
  });
});

// ===========================================
// CampaignPerformanceChart Tests
// ===========================================

describe('CampaignPerformanceChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#5: Loading state
  describe('AC#5: Loading State', () => {
    it('should show skeleton while loading', () => {
      mockUseCampaignChart.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-chart-skeleton')).toBeInTheDocument();
    });
  });

  // AC#7: Error state
  describe('AC#7: Error State', () => {
    it('should show error component when API fails', () => {
      mockUseCampaignChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Network error' },
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaigns-error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should call refetch on retry click', async () => {
      const mockRefetch = vi.fn();
      mockUseCampaignChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Failed' },
        refetch: mockRefetch,
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      screen.getByTestId('btn-campaigns-retry').click();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  // AC#6: Empty state
  describe('AC#6: Empty State', () => {
    it('should show empty state when no campaigns', () => {
      mockUseCampaignChart.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-chart-empty')).toBeInTheDocument();
      expect(screen.getByText('No campaign data yet')).toBeInTheDocument();
    });

    it('should show empty state when data is undefined', () => {
      mockUseCampaignChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-chart-empty')).toBeInTheDocument();
    });
  });

  // AC#1: Bar chart display
  describe('AC#1: Bar Chart Display', () => {
    it('should render chart with campaign data', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-performance-chart')).toBeInTheDocument();
      expect(screen.getByTestId('recharts-bar-chart')).toBeInTheDocument();
    });

    it('should render two bars (Open Rate and Click Rate)', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      expect(screen.getByTestId('bar-openRate')).toBeInTheDocument();
      expect(screen.getByTestId('bar-clickRate')).toBeInTheDocument();
    });

    it('should pass correct data count to chart', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      const chart = screen.getByTestId('recharts-bar-chart');
      expect(chart).toHaveAttribute('data-count', '3');
    });

    it('should display "Campaign Performance" title', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      expect(screen.getByText('Campaign Performance')).toBeInTheDocument();
    });
  });

  // AC#2: Data from backend API, Y-axis with campaign names
  describe('AC#2: Chart Axes', () => {
    it('should render X-axis and Y-axis', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });

    it('should use campaignName as Y-axis data key', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      const yAxis = screen.getByTestId('y-axis');
      expect(yAxis).toHaveAttribute('data-datakey', 'campaignName');
    });
  });

  // AC#4: Campaign count selector
  describe('AC#4: Campaign Count Selector', () => {
    it('should render the limit selector', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      expect(screen.getByTestId('chart-limit-selector')).toBeInTheDocument();
    });

    it('should call hook with default limit of 10', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      expect(mockUseCampaignChart).toHaveBeenCalledWith({
        limit: 10,
        truncateLength: 25,
      });
    });
  });

  // AC#8: Responsive layout
  describe('AC#8: Responsive Layout', () => {
    it('should calculate dynamic height based on data length', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData, // 3 items → max(300, 3*50) = 300
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '300');
    });

    it('should have minimum height of 300', () => {
      const smallData: ChartDataItem[] = [mockChartData[0]]; // 1 item → max(300, 1*50) = 300
      mockUseCampaignChart.mockReturnValue({
        data: smallData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '300');
    });

    it('should scale height for many campaigns', () => {
      const manyData: ChartDataItem[] = Array.from({ length: 10 }, (_, i) => ({
        campaignName: `Campaign ${i + 1}`,
        campaignId: i + 1,
        openRate: 30 - i * 2,
        clickRate: 5 - i * 0.3,
        delivered: 1000 * (i + 1),
      }));

      mockUseCampaignChart.mockReturnValue({
        data: manyData, // 10 items → max(300, 10*50) = 500
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '500');
    });

    it('should have aria-label for accessibility', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      const chartRegion = screen.getByRole('img');
      expect(chartRegion).toHaveAttribute(
        'aria-label',
        'Campaign performance bar chart comparing Open Rate and Click Rate across campaigns'
      );
    });
  });

  // AC#9: Benchmark reference lines
  describe('AC#9: Benchmark Reference Lines', () => {
    it('should render Good threshold reference line at 15%', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      const goodLine = screen.getByTestId('reference-line-15');
      expect(goodLine).toBeInTheDocument();
      expect(goodLine).toHaveAttribute('data-x', '15');
      expect(goodLine).toHaveAttribute('data-dasharray', '3 3');
    });

    it('should render Excellent threshold reference line at 25%', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      const excellentLine = screen.getByTestId('reference-line-25');
      expect(excellentLine).toBeInTheDocument();
      expect(excellentLine).toHaveAttribute('data-x', '25');
      expect(excellentLine).toHaveAttribute('data-dasharray', '3 3');
    });

    it('should NOT render Click Rate reference lines', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      // Click Rate benchmarks are 2% and 5% - should NOT be rendered
      expect(screen.queryByTestId('reference-line-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('reference-line-5')).not.toBeInTheDocument();
    });
  });

  // Chart color consistency
  describe('Chart Colors', () => {
    it('should use correct fill colors for bars', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      const openRateBar = screen.getByTestId('bar-openRate');
      const clickRateBar = screen.getByTestId('bar-clickRate');

      // Open Rate uses CHART_COLORS.info (Blue)
      expect(openRateBar).toHaveAttribute('data-fill', '#3B82F6');
      // Click Rate uses CHART_COLORS.secondary (Emerald)
      expect(clickRateBar).toHaveAttribute('data-fill', '#10B981');
    });

    it('should use correct names for legend', () => {
      mockUseCampaignChart.mockReturnValue({
        data: mockChartData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignPerformanceChart />
        </TestWrapper>
      );

      const openRateBar = screen.getByTestId('bar-openRate');
      const clickRateBar = screen.getByTestId('bar-clickRate');

      expect(openRateBar).toHaveAttribute('data-name', 'Open Rate');
      expect(clickRateBar).toHaveAttribute('data-name', 'Click Rate');
    });
  });
});
