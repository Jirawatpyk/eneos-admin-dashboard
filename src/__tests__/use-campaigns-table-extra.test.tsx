/**
 * Campaigns Table Hook - Extra Coverage Tests
 * Story 5.4: Campaign Table
 * Tests for error handling and pagination in use-campaigns-table
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCampaignsTable } from '../hooks/use-campaigns-table';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
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

const mockCampaignData = {
  success: true,
  data: {
    data: [
      {
        campaignId: 1,
        campaignName: 'Campaign 1',
        delivered: 100,
        opened: 50,
        clicked: 20,
        uniqueOpens: 45,
        uniqueClicks: 15,
        openRate: 45,
        clickRate: 15,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-01',
        lastUpdated: '2026-01-31',
      },
    ],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  },
};

describe('useCampaignsTable', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  describe('[P1] Successful requests', () => {
    it('should fetch campaigns with default options', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignData),
      });

      const { result } = renderHook(
        () => useCampaignsTable(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(result.current.data?.data.data).toHaveLength(1);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should pass pagination params to fetch', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignData),
      });

      renderHook(
        () => useCampaignsTable({ page: 2, limit: 10 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=10');
    });

    it('should pass sorting params to fetch', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignData),
      });

      renderHook(
        () => useCampaignsTable({ sortBy: 'Campaign_Name' as never, sortOrder: 'asc' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('sortBy=Campaign_Name');
      expect(calledUrl).toContain('sortOrder=asc');
    });
  });

  describe('[P1] Error handling', () => {
    it('should wrap errors as CampaignApiError', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'));

      const { result } = renderHook(
        () => useCampaignsTable(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Fetch failed');
    });

    it('should handle duck-typed CampaignApiError', async () => {
      const serializedError = { name: 'CampaignApiError', message: 'Serialized', statusCode: 500 };
      mockFetch.mockRejectedValue(serializedError);

      const { result } = renderHook(
        () => useCampaignsTable(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });

    it('should handle non-Error non-object thrown', async () => {
      mockFetch.mockRejectedValue('string error');

      const { result } = renderHook(
        () => useCampaignsTable(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBeDefined();
    });
  });

  describe('[P1] Hook options', () => {
    it('should not fetch when enabled=false', () => {
      const { result } = renderHook(
        () => useCampaignsTable({ enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should expose isFetching for pagination transitions', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignData),
      });

      const { result } = renderHook(
        () => useCampaignsTable(),
        { wrapper: createWrapper() }
      );

      // isFetching should be available
      expect(typeof result.current.isFetching).toBe('boolean');
    });

    it('should expose refetch function', () => {
      const { result } = renderHook(
        () => useCampaignsTable({ enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
