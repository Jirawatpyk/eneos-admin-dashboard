/**
 * useCampaignsTable Hook Tests
 * Story 5.4: Campaign Table
 * AC: #2, #3, #4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCampaignsTable } from '../hooks/use-campaigns-table';
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
    pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
  },
};

describe('useCampaignsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful fetch (AC#2)', () => {
    it('should fetch campaign table data with default params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      const { result } = renderHook(() => useCampaignsTable(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.data.data).toHaveLength(2);
      expect(result.current.data?.data.pagination.total).toBe(2);
      expect(result.current.isError).toBe(false);
    });

    it('should use default params: page=1, limit=20, sortBy=Last_Updated, sortOrder=desc', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      renderHook(() => useCampaignsTable(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const fetchUrl = mockFetch.mock.calls[0][0];
      expect(fetchUrl).toContain('page=1');
      expect(fetchUrl).toContain('limit=20');
      expect(fetchUrl).toContain('sortBy=Last_Updated');
      expect(fetchUrl).toContain('sortOrder=desc');
    });
  });

  describe('Pagination params (AC#3)', () => {
    it('should support custom page number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockCampaignsResponse,
          data: { ...mockCampaignsResponse.data, pagination: { page: 2, limit: 20, total: 50, totalPages: 3 } },
        }),
      });

      renderHook(() => useCampaignsTable({ page: 2 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockFetch.mock.calls[0][0]).toContain('page=2');
    });

    it('should support custom limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      renderHook(() => useCampaignsTable({ limit: 50 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockFetch.mock.calls[0][0]).toContain('limit=50');
    });
  });

  describe('Sorting params (AC#4)', () => {
    it('should support sortBy parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      renderHook(() => useCampaignsTable({ sortBy: 'Delivered' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockFetch.mock.calls[0][0]).toContain('sortBy=Delivered');
    });

    it('should support sortOrder ascending', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      renderHook(() => useCampaignsTable({ sortOrder: 'asc' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockFetch.mock.calls[0][0]).toContain('sortOrder=asc');
    });

    it('should support multiple sort params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      renderHook(() => useCampaignsTable({ sortBy: 'Open_Rate', sortOrder: 'desc' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const fetchUrl = mockFetch.mock.calls[0][0];
      expect(fetchUrl).toContain('sortBy=Open_Rate');
      expect(fetchUrl).toContain('sortOrder=desc');
    });
  });

  describe('Loading state', () => {
    it('should return isLoading true initially', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      const { result } = renderHook(() => useCampaignsTable(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should return isFetching when background fetching', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      const { result } = renderHook(() => useCampaignsTable(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // isFetching should be available
      expect(typeof result.current.isFetching).toBe('boolean');
    });
  });

  describe('Error state', () => {
    it('should return error on fetch failure', async () => {
      // Mock all retries to fail
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { result } = renderHook(() => useCampaignsTable(), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 5000 }
      );

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('Failed to fetch');
    });

    it('should handle 503 circuit breaker error', async () => {
      // Mock all retries to fail
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
      });

      const { result } = renderHook(() => useCampaignsTable(), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 5000 }
      );

      expect(result.current.error?.statusCode).toBe(503);
    });
  });

  describe('Options', () => {
    it('should not fetch when enabled is false', async () => {
      renderHook(() => useCampaignsTable({ enabled: false }), {
        wrapper: createWrapper(),
      });

      // Give it some time
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should provide refetch function', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      const { result } = renderHook(() => useCampaignsTable(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('Query key uniqueness', () => {
    it('should create unique query key for different params', async () => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      // First render with page=1
      const wrapper1 = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result: result1 } = renderHook(
        () => useCampaignsTable({ page: 1, sortBy: 'Last_Updated' }),
        { wrapper: wrapper1 }
      );

      await waitFor(() => expect(result1.current.isLoading).toBe(false));

      // Second render with page=2 should trigger new fetch
      const { result: result2 } = renderHook(
        () => useCampaignsTable({ page: 2, sortBy: 'Last_Updated' }),
        { wrapper: wrapper1 }
      );

      await waitFor(() => expect(result2.current.isLoading).toBe(false));

      // Should have made 2 calls (different query keys)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
