/**
 * Campaign Chart Hook Tests
 * Story 5.6: Campaign Performance Chart
 * AC: #2, #4
 *
 * Tests for useCampaignChart hook and truncateName helper
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCampaignChart, truncateName } from '@/hooks/use-campaign-chart';
import type { CampaignStatsResponse } from '@/types/campaigns';

// Mock the campaigns API
const mockFetchCampaignStats = vi.fn();
vi.mock('@/lib/api/campaigns', () => ({
  fetchCampaignStats: (...args: unknown[]) => mockFetchCampaignStats(...args),
}));

// Re-export CampaignApiError for error tests
vi.mock('@/types/campaigns', async () => {
  const actual = await vi.importActual<typeof import('@/types/campaigns')>('@/types/campaigns');
  return actual;
});

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// ===========================================
// Mock Data
// ===========================================

const mockCampaignsResponse: CampaignStatsResponse = {
  success: true,
  data: {
    data: [
      {
        campaignId: 1,
        campaignName: 'Winter Promo 2026',
        delivered: 5000,
        opened: 1500,
        clicked: 250,
        uniqueOpens: 1200,
        uniqueClicks: 200,
        openRate: 24.0,
        clickRate: 4.0,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-01T00:00:00Z',
        lastUpdated: '2026-01-15T00:00:00Z',
      },
      {
        campaignId: 2,
        campaignName: 'Q1 Newsletter',
        delivered: 3000,
        opened: 900,
        clicked: 120,
        uniqueOpens: 750,
        uniqueClicks: 100,
        openRate: 25.0,
        clickRate: 3.3,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-05T00:00:00Z',
        lastUpdated: '2026-01-20T00:00:00Z',
      },
      {
        campaignId: 3,
        campaignName: 'Spring Campaign for ENEOS Thailand Partners',
        delivered: 8000,
        opened: 3200,
        clicked: 640,
        uniqueOpens: 2800,
        uniqueClicks: 560,
        openRate: 35.0,
        clickRate: 7.0,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-02-01T00:00:00Z',
        lastUpdated: '2026-02-15T00:00:00Z',
      },
    ],
    pagination: { page: 1, limit: 100, total: 3, totalPages: 1 },
  },
};

describe('useCampaignChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#2: Data from backend API
  it('should fetch and transform campaign data', async () => {
    mockFetchCampaignStats.mockResolvedValue(mockCampaignsResponse);

    const { result } = renderHook(() => useCampaignChart(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data![0]).toEqual({
      campaignName: 'Winter Promo 2026',
      campaignId: 1,
      openRate: 24.0,
      clickRate: 4.0,
      delivered: 5000,
    });
  });

  it('should fetch with Open_Rate desc sort', async () => {
    mockFetchCampaignStats.mockResolvedValue(mockCampaignsResponse);

    renderHook(() => useCampaignChart(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockFetchCampaignStats).toHaveBeenCalledWith({
        limit: 100,
        sortBy: 'Open_Rate',
        sortOrder: 'desc',
      });
    });
  });

  // AC#4: Limit parameter
  it('should slice data to provided limit', async () => {
    mockFetchCampaignStats.mockResolvedValue(mockCampaignsResponse);

    const { result } = renderHook(
      () => useCampaignChart({ limit: 2 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
  });

  it('should use default limit of 10', async () => {
    mockFetchCampaignStats.mockResolvedValue(mockCampaignsResponse);

    const { result } = renderHook(() => useCampaignChart(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 3 campaigns < 10, so all are returned
    expect(result.current.data).toHaveLength(3);
  });

  it('should share cache across different limits (single API call)', async () => {
    mockFetchCampaignStats.mockResolvedValue(mockCampaignsResponse);

    const wrapper = createWrapper();

    const { result: result5 } = renderHook(
      () => useCampaignChart({ limit: 5 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result5.current.isLoading).toBe(false);
    });

    const { result: result20 } = renderHook(
      () => useCampaignChart({ limit: 20 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result20.current.isLoading).toBe(false);
    });

    // Same cache key → only 1 API call regardless of limit changes
    expect(mockFetchCampaignStats).toHaveBeenCalledTimes(1);
  });

  // Loading state
  it('should return isLoading true initially', () => {
    mockFetchCampaignStats.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useCampaignChart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  // Error state
  it('should handle API errors', async () => {
    mockFetchCampaignStats.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCampaignChart(), {
      wrapper: createWrapper(),
    });

    // Hook has retry: 2, so wait for all retries to exhaust
    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 10000 }
    );

    expect(result.current.error).toBeTruthy();
    expect(result.current.error!.message).toBe('Network error');
  });

  // Empty state
  it('should handle empty campaigns', async () => {
    mockFetchCampaignStats.mockResolvedValue({
      success: true,
      data: { data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } },
    });

    const { result } = renderHook(() => useCampaignChart(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });

  // Enabled flag
  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useCampaignChart({ enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(mockFetchCampaignStats).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  // Truncate long campaign names
  it('should truncate long campaign names to 25 characters by default', async () => {
    mockFetchCampaignStats.mockResolvedValue(mockCampaignsResponse);

    const { result } = renderHook(() => useCampaignChart(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 3rd campaign "Spring Campaign for ENEOS Thailand Partners" is > 25 chars
    const longCampaign = result.current.data!.find((d) => d.campaignId === 3);
    expect(longCampaign!.campaignName).toBe('Spring Campaign for ENEOS...');
  });

  // AC#8: Mobile truncation at 20 characters
  it('should truncate to custom truncateLength for mobile (AC#8)', async () => {
    mockFetchCampaignStats.mockResolvedValue(mockCampaignsResponse);

    const { result } = renderHook(
      () => useCampaignChart({ truncateLength: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const longCampaign = result.current.data!.find((d) => d.campaignId === 3);
    expect(longCampaign!.campaignName).toBe('Spring Campaign for ...');
  });
});

describe('truncateName', () => {
  it('should return name as-is if shorter than maxLength', () => {
    expect(truncateName('Short', 25)).toBe('Short');
  });

  it('should return name as-is if equal to maxLength', () => {
    expect(truncateName('12345', 5)).toBe('12345');
  });

  it('should truncate and add ellipsis if longer than maxLength', () => {
    expect(truncateName('This is a very long campaign name that exceeds', 25)).toBe(
      'This is a very long campa...'
    );
  });

  it('should handle empty string', () => {
    expect(truncateName('', 25)).toBe('');
  });

  it('should handle maxLength of 0', () => {
    expect(truncateName('abc', 0)).toBe('...');
  });
});
