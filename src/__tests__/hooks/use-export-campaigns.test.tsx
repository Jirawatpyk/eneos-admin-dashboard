/**
 * Export Campaigns Hook Tests
 * Story 5.9: Campaign Export
 *
 * AC#3: Export with Current Filters
 * AC#6: Loading State
 * AC#7: Success Feedback
 * AC#8: Empty Data Handling
 * AC#9: Error Handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useExportCampaigns } from '@/hooks/use-export-campaigns';
import type { CampaignStatsItem, CampaignStatsResponse } from '@/types/campaigns';

// Mock fetchCampaignStats
const mockFetchCampaignStats = vi.fn();
vi.mock('@/lib/api/campaigns', () => ({
  fetchCampaignStats: (...args: unknown[]) => mockFetchCampaignStats(...args),
}));

// Mock export functions
const mockExportToExcel = vi.fn();
const mockExportToCSV = vi.fn();
vi.mock('@/lib/export-campaigns', () => ({
  exportCampaignsToExcel: (...args: unknown[]) => mockExportToExcel(...args),
  exportCampaignsToCSV: (...args: unknown[]) => mockExportToCSV(...args),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Sample campaign data
const createMockCampaign = (overrides: Partial<CampaignStatsItem> = {}): CampaignStatsItem => ({
  campaignId: 1,
  campaignName: 'Test Campaign',
  delivered: 1000,
  opened: 500,
  clicked: 100,
  uniqueOpens: 450,
  uniqueClicks: 90,
  openRate: 45.0,
  clickRate: 9.0,
  hardBounce: 5,
  softBounce: 10,
  unsubscribe: 2,
  spam: 1,
  firstEvent: '2026-01-15T10:00:00Z',
  lastUpdated: '2026-01-20T15:30:00Z',
  ...overrides,
});

const createMockResponse = (campaigns: CampaignStatsItem[]): CampaignStatsResponse => ({
  success: true,
  data: {
    data: campaigns,
    pagination: {
      page: 1,
      limit: 1000,
      total: campaigns.length,
      totalPages: 1,
    },
  },
});

describe('useExportCampaigns', () => {
  const mockCampaigns = [
    createMockCampaign({ campaignId: 1 }),
    createMockCampaign({ campaignId: 2 }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCampaignStats.mockResolvedValue(createMockResponse(mockCampaigns));
  });

  it('returns initial state with isExporting false', () => {
    const { result } = renderHook(() => useExportCampaigns());

    expect(result.current.isExporting).toBe(false);
    expect(typeof result.current.exportCampaigns).toBe('function');
  });

  // AC#6: Loading State
  it('sets isExporting true during export', async () => {
    const { result } = renderHook(() => useExportCampaigns());

    expect(result.current.isExporting).toBe(false);

    // Start export - don't wait
    act(() => {
      void result.current.exportCampaigns('excel');
    });

    // Should be exporting
    expect(result.current.isExporting).toBe(true);

    // Wait for completion
    await waitFor(() => {
      expect(result.current.isExporting).toBe(false);
    });
  });

  // AC#3: Export with Current Filters
  it('passes date filters to fetchCampaignStats', async () => {
    const { result } = renderHook(() =>
      useExportCampaigns({
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      })
    );

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(mockFetchCampaignStats).toHaveBeenCalledWith({
      limit: 1000,
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
    });
  });

  it('passes date filters to export function', async () => {
    const { result } = renderHook(() =>
      useExportCampaigns({
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      })
    );

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(mockExportToExcel).toHaveBeenCalledWith(
      mockCampaigns,
      '2026-01-01',
      '2026-01-31'
    );
  });

  // AC#7: Success Feedback
  it('shows success toast after Excel export', async () => {
    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export complete',
      description: 'Exported 2 campaigns to Excel.',
    });
  });

  it('shows success toast after CSV export', async () => {
    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('csv');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export complete',
      description: 'Exported 2 campaigns to CSV.',
    });
  });

  it('uses singular form for single campaign', async () => {
    mockFetchCampaignStats.mockResolvedValueOnce(
      createMockResponse([createMockCampaign()])
    );

    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export complete',
      description: 'Exported 1 campaign to Excel.',
    });
  });

  // AC#8: Empty Data Handling
  it('shows info toast when no campaigns to export', async () => {
    mockFetchCampaignStats.mockResolvedValueOnce(createMockResponse([]));

    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'No campaigns to export',
      description: 'There are no campaigns matching your current filters.',
    });
    expect(mockExportToExcel).not.toHaveBeenCalled();
  });

  // AC#9: Error Handling
  it('shows error toast on fetch failure', async () => {
    mockFetchCampaignStats.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export failed',
      description: 'Please try again. If the problem persists, contact support.',
      variant: 'destructive',
    });
  });

  it('shows error toast on export function failure', async () => {
    mockExportToExcel.mockImplementationOnce(() => {
      throw new Error('Export failed');
    });

    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export failed',
      description: 'Please try again. If the problem persists, contact support.',
      variant: 'destructive',
    });
  });

  it('resets isExporting to false after error', async () => {
    mockFetchCampaignStats.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(result.current.isExporting).toBe(false);
  });

  it('calls exportCampaignsToExcel for excel format', async () => {
    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(mockExportToExcel).toHaveBeenCalled();
    expect(mockExportToCSV).not.toHaveBeenCalled();
  });

  it('calls exportCampaignsToCSV for csv format', async () => {
    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('csv');
    });

    expect(mockExportToCSV).toHaveBeenCalled();
    expect(mockExportToExcel).not.toHaveBeenCalled();
  });

  it('fetches with high limit to get all campaigns', async () => {
    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(mockFetchCampaignStats).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 1000 })
    );
  });

  it('does not fetch without date filter', async () => {
    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(mockFetchCampaignStats).toHaveBeenCalledWith({
      limit: 1000,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  // Type safety
  it('accepts valid format types', async () => {
    const { result } = renderHook(() => useExportCampaigns());

    // Test excel format
    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    // Test csv format
    await act(async () => {
      await result.current.exportCampaigns('csv');
    });

    // Each format called once
    expect(mockExportToExcel).toHaveBeenCalledTimes(1);
    expect(mockExportToCSV).toHaveBeenCalledTimes(1);
  });

  it('resets isExporting after successful export', async () => {
    const { result } = renderHook(() => useExportCampaigns());

    await act(async () => {
      await result.current.exportCampaigns('excel');
    });

    expect(result.current.isExporting).toBe(false);
  });
});
