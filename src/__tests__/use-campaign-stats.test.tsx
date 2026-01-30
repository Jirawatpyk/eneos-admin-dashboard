/**
 * useCampaignStats Hook Tests
 * Story 5.3: Campaign Summary Cards
 * AC: #2, #4, #5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCampaignStats } from '../hooks/use-campaign-stats';
import type { ReactNode } from 'react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// Mock response matches actual backend structure: { data: { data: [...], pagination: {...} } }
const mockCampaignsResponse = {
  success: true,
  data: {
    data: [
      {
        campaignId: 1,
        campaignName: 'Test Campaign 1',
        delivered: 100,
        opened: 60,
        clicked: 25,
        uniqueOpens: 50,
        uniqueClicks: 20,
        openRate: 50.0,
        clickRate: 20.0,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-15T10:00:00Z',
        lastUpdated: '2026-01-20T10:00:00Z',
      },
      {
        campaignId: 2,
        campaignName: 'Test Campaign 2',
        delivered: 200,
        opened: 80,
        clicked: 40,
        uniqueOpens: 70,
        uniqueClicks: 30,
        openRate: 35.0,
        clickRate: 15.0,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-18T10:00:00Z',
        lastUpdated: '2026-01-22T10:00:00Z',
      },
    ],
    pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
  },
};

describe('useCampaignStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful fetch', () => {
    it('should fetch and aggregate campaign stats', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      const { result } = renderHook(() => useCampaignStats(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.totalCampaigns).toBe(2);
      expect(result.current.data?.delivered).toBe(300); // 100 + 200
      expect(result.current.data?.uniqueOpens).toBe(120); // 50 + 70
      expect(result.current.data?.uniqueClicks).toBe(50); // 20 + 30
      // Open rate: 120 / 300 * 100 = 40%
      expect(result.current.data?.openRate).toBe(40.0);
      // Click rate: 50 / 300 * 100 = 16.7%
      expect(result.current.data?.clickRate).toBe(16.7);
      expect(result.current.isError).toBe(false);
    });

    it('should use limit=100 to get all campaigns', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              data: [],
              pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
            },
          }),
      });

      renderHook(() => useCampaignStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=100'),
        expect.any(Object)
      );
    });
  });

  describe('Loading state', () => {
    it('should return isLoading true initially', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              data: [],
              pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
            },
          }),
      });

      const { result } = renderHook(() => useCampaignStats(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  // Note: Error handling is tested in campaigns-api.test.ts for the fetch function
  // and in campaign-kpi-cards-grid.test.tsx for the UI component's error state

  describe('Options', () => {
    it('should not fetch when enabled is false', async () => {
      renderHook(() => useCampaignStats({ enabled: false }), {
        wrapper: createWrapper(),
      });

      // Give it some time
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should provide refetch function', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              data: [],
              pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
            },
          }),
      });

      const { result } = renderHook(() => useCampaignStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should return empty aggregate for no campaigns', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              data: [],
              pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
            },
          }),
      });

      const { result } = renderHook(() => useCampaignStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.totalCampaigns).toBe(0);
      expect(result.current.data?.delivered).toBe(0);
      expect(result.current.data?.openRate).toBe(0);
      expect(result.current.data?.clickRate).toBe(0);
    });
  });
});
