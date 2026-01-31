/**
 * useQuickReports Hook Tests
 * Story 6.3: Quick Reports - Task 3
 *
 * Tests for preview data fetching, loading states, and error handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuickReports } from '@/hooks/use-quick-reports';

// Mock useDashboardData
const mockUseDashboardData = vi.fn();
vi.mock('@/hooks/use-dashboard-data', () => ({
  useDashboardData: (...args: unknown[]) => mockUseDashboardData(...args),
}));

// Mock useCampaignStats
const mockUseCampaignStats = vi.fn();
vi.mock('@/hooks/use-campaign-stats', () => ({
  useCampaignStats: (...args: unknown[]) => mockUseCampaignStats(...args),
}));

// Mock date utils to have deterministic dates
vi.mock('@/lib/report-date-utils', async () => {
  const actual = await vi.importActual('@/lib/report-date-utils');
  return {
    ...actual,
    getReportDateRange: (type: string) => {
      if (type === 'monthly') {
        return { from: new Date(2026, 0, 1), to: new Date(2026, 0, 31) };
      }
      return { from: new Date(2026, 0, 31), to: new Date(2026, 0, 31) };
    },
  };
});

const createDashboardData = (overrides = {}) => ({
  summary: {
    totalLeads: 25,
    claimed: 10,
    contacted: 8,
    closed: 5,
    lost: 2,
    unreachable: 0,
    conversionRate: 20,
    ...overrides,
  },
  trends: { daily: [] },
  topSales: [
    { id: '1', name: 'Alice', email: 'a@e.com', claimed: 5, contacted: 3, closed: 2, conversionRate: 40, rank: 1 },
  ],
});

describe('useQuickReports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return daily preview data from useDashboardData', () => {
    mockUseDashboardData.mockImplementation((opts: { period: string }) => {
      if (opts.period === 'today') {
        return { data: createDashboardData({ totalLeads: 5, contacted: 3, closed: 1 }), isLoading: false };
      }
      return { data: undefined, isLoading: true };
    });
    mockUseCampaignStats.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useQuickReports());

    expect(result.current.daily).toEqual({ totalLeads: 5, contacted: 3, closed: 1 });
  });

  it('should return weekly preview data with top performer name', () => {
    mockUseDashboardData.mockImplementation((opts: { period: string }) => {
      if (opts.period === 'week') {
        return { data: createDashboardData({ totalLeads: 50, conversionRate: 35 }), isLoading: false };
      }
      return { data: undefined, isLoading: true };
    });
    mockUseCampaignStats.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useQuickReports());

    expect(result.current.weekly).toEqual({
      totalLeads: 50,
      conversionRate: 35,
      topSalesName: 'Alice',
    });
  });

  it('should return monthly preview data with campaign count', () => {
    mockUseDashboardData.mockImplementation((opts: { period: string }) => {
      if (opts.period === 'month') {
        return { data: createDashboardData({ totalLeads: 200, conversionRate: 18 }), isLoading: false };
      }
      return { data: undefined, isLoading: true };
    });
    mockUseCampaignStats.mockReturnValue({ data: { totalCampaigns: 12 } });

    const { result } = renderHook(() => useQuickReports());

    expect(result.current.monthly).toEqual({
      totalLeads: 200,
      conversionRate: 18,
      totalCampaigns: 12,
    });
  });

  it('should return null for daily when data is not loaded', () => {
    mockUseDashboardData.mockReturnValue({ data: undefined, isLoading: true });
    mockUseCampaignStats.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useQuickReports());

    expect(result.current.daily).toBeNull();
    expect(result.current.weekly).toBeNull();
    expect(result.current.monthly).toBeNull();
  });

  it('should track loading state per report type', () => {
    mockUseDashboardData.mockImplementation((opts: { period: string }) => {
      if (opts.period === 'today') return { data: undefined, isLoading: true };
      if (opts.period === 'week') return { data: createDashboardData(), isLoading: false };
      return { data: undefined, isLoading: true };
    });
    mockUseCampaignStats.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useQuickReports());

    expect(result.current.isLoading.daily).toBe(true);
    expect(result.current.isLoading.weekly).toBe(false);
    expect(result.current.isLoading.monthly).toBe(true);
  });

  it('should return "--" for topSalesName when no top sales data', () => {
    const dataWithoutTopSales = {
      summary: {
        totalLeads: 10,
        claimed: 5,
        contacted: 3,
        closed: 2,
        lost: 0,
        unreachable: 0,
        conversionRate: 20,
      },
      trends: { daily: [] },
      topSales: [],
    };
    mockUseDashboardData.mockImplementation((opts: { period: string }) => {
      if (opts.period === 'week') return { data: dataWithoutTopSales, isLoading: false };
      return { data: undefined, isLoading: true };
    });
    mockUseCampaignStats.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useQuickReports());

    expect(result.current.weekly?.topSalesName).toBe('--');
  });

  it('should default totalCampaigns to 0 when campaign data unavailable', () => {
    mockUseDashboardData.mockImplementation((opts: { period: string }) => {
      if (opts.period === 'month') return { data: createDashboardData(), isLoading: false };
      return { data: undefined, isLoading: true };
    });
    mockUseCampaignStats.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useQuickReports());

    expect(result.current.monthly?.totalCampaigns).toBe(0);
  });

  it('should pass correct date range to useCampaignStats', () => {
    mockUseDashboardData.mockReturnValue({ data: undefined, isLoading: true });
    mockUseCampaignStats.mockReturnValue({ data: undefined });

    renderHook(() => useQuickReports());

    expect(mockUseCampaignStats).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      })
    );
  });

  it('should call useDashboardData with correct period for each report', () => {
    mockUseDashboardData.mockReturnValue({ data: undefined, isLoading: true });
    mockUseCampaignStats.mockReturnValue({ data: undefined });

    renderHook(() => useQuickReports());

    expect(mockUseDashboardData).toHaveBeenCalledWith({ period: 'today' });
    expect(mockUseDashboardData).toHaveBeenCalledWith({ period: 'week' });
    expect(mockUseDashboardData).toHaveBeenCalledWith({ period: 'month' });
  });

  it('should handle topSales being undefined gracefully', () => {
    const dataWithUndefinedTopSales = {
      summary: {
        totalLeads: 10,
        claimed: 5,
        contacted: 3,
        closed: 2,
        lost: 0,
        unreachable: 0,
        conversionRate: 20,
      },
      trends: { daily: [] },
    };
    mockUseDashboardData.mockImplementation((opts: { period: string }) => {
      if (opts.period === 'week') return { data: dataWithUndefinedTopSales, isLoading: false };
      return { data: undefined, isLoading: true };
    });
    mockUseCampaignStats.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useQuickReports());

    expect(result.current.weekly?.topSalesName).toBe('--');
  });
});
