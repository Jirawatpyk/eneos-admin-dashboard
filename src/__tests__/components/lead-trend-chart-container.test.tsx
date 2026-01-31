/**
 * Lead Trend Chart Container Tests
 * Story 2.2: Lead Trend Chart container component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock the hooks and child component
vi.mock('@/hooks/use-dashboard-data', () => ({
  useDashboardData: vi.fn(),
}));

vi.mock('@/components/dashboard/lead-trend-chart', () => ({
  LeadTrendChart: vi.fn(({ data, isLoading }: { data: unknown; isLoading: boolean }) => (
    <div data-testid="lead-trend-chart" data-loading={isLoading} data-has-data={!!data}>
      MockChart
    </div>
  )),
}));

import { LeadTrendChartContainer } from '@/components/dashboard/lead-trend-chart-container';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { LeadTrendChart } from '@/components/dashboard/lead-trend-chart';

const mockUseDashboardData = useDashboardData as ReturnType<typeof vi.fn>;
const mockLeadTrendChart = LeadTrendChart as ReturnType<typeof vi.fn>;

describe('LeadTrendChartContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[P1] should pass loading state to chart', () => {
    mockUseDashboardData.mockReturnValue({ data: undefined, isLoading: true });

    render(<LeadTrendChartContainer />);

    const callProps = mockLeadTrendChart.mock.calls[0][0];
    expect(callProps.isLoading).toBe(true);
    expect(callProps.data).toBeUndefined();
  });

  it('[P1] should pass trends.daily data to chart', () => {
    const dailyData = [{ date: '2026-01-01', new: 5, contacted: 3, closed: 2 }];
    mockUseDashboardData.mockReturnValue({
      data: { trends: { daily: dailyData } },
      isLoading: false,
    });

    render(<LeadTrendChartContainer />);

    const callProps = mockLeadTrendChart.mock.calls[0][0];
    expect(callProps.data).toEqual(dailyData);
    expect(callProps.isLoading).toBe(false);
  });

  it('[P1] should call useDashboardData hook', () => {
    mockUseDashboardData.mockReturnValue({ data: undefined, isLoading: false });

    render(<LeadTrendChartContainer />);

    expect(mockUseDashboardData).toHaveBeenCalled();
  });

  it('[P1] should handle undefined trends gracefully', () => {
    mockUseDashboardData.mockReturnValue({ data: {}, isLoading: false });

    render(<LeadTrendChartContainer />);

    const callProps = mockLeadTrendChart.mock.calls[0][0];
    expect(callProps.data).toBeUndefined();
    expect(callProps.isLoading).toBe(false);
  });
});
