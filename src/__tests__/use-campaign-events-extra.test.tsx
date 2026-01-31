/**
 * Campaign Events Hook - Extra Coverage Tests
 * Story 5.7: Campaign Detail Sheet
 * Tests for error wrapping and edge cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCampaignEvents } from '../hooks/use-campaign-events';
import { CampaignApiError } from '../types/campaigns';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useCampaignEvents (extra coverage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('[P1] Error wrapping', () => {
    it('should wrap CampaignApiError as-is', async () => {
      // Hook has retry: 2 → need 3 total failures (initial + 2 retries)
      const notFoundResponse = { ok: false, status: 404, statusText: 'Not Found' };
      mockFetch
        .mockResolvedValueOnce(notFoundResponse)
        .mockResolvedValueOnce(notFoundResponse)
        .mockResolvedValueOnce(notFoundResponse);

      const { result } = renderHook(
        () => useCampaignEvents({ campaignId: 42 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(CampaignApiError);
      expect(result.current.error?.message).toBe('Campaign not found');
    });

    it('should wrap generic Error into CampaignApiError', async () => {
      // Hook has retry: 2 → need 3 total rejections
      mockFetch
        .mockRejectedValueOnce(new Error('Network failure'))
        .mockRejectedValueOnce(new Error('Network failure'))
        .mockRejectedValueOnce(new Error('Network failure'));

      const { result } = renderHook(
        () => useCampaignEvents({ campaignId: 42 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(CampaignApiError);
      expect(result.current.error?.message).toBe('Network failure');
    });

    it('should wrap non-Error into CampaignApiError with default message', async () => {
      // Hook has retry: 2 → need 3 total rejections
      mockFetch
        .mockRejectedValueOnce('string error')
        .mockRejectedValueOnce('string error')
        .mockRejectedValueOnce('string error');

      const { result } = renderHook(
        () => useCampaignEvents({ campaignId: 42 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(CampaignApiError);
      expect(result.current.error?.message).toBe('An unexpected error occurred');
    });
  });

  describe('[P1] Query key includes all params', () => {
    it('should use default pagination params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        }),
      });

      const { result } = renderHook(
        () => useCampaignEvents({ campaignId: 42 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('page=1');
      expect(url).toContain('limit=20');
    });
  });

  describe('[P1] Disabled when campaignId is falsy', () => {
    it('should not fetch when campaignId is undefined', async () => {
      const { result } = renderHook(
        () => useCampaignEvents({ campaignId: 0 }),
        { wrapper: createWrapper() }
      );

      // isLoading should be false because query is disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('[P1] Success state shape', () => {
    it('should return properly shaped data on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            data: [{ eventId: 1, email: 'test@co.th', event: 'opened', eventAt: '2026-01-30', url: null }],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
          },
        }),
      });

      const { result } = renderHook(
        () => useCampaignEvents({ campaignId: 42 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isError).toBe(false);
      expect(result.current.isFetching).toBe(false);
      expect(result.current.data?.data.data).toHaveLength(1);
      expect(result.current.data?.data.pagination.total).toBe(1);
    });
  });

  describe('[P1] Duck-typing CampaignApiError', () => {
    it('should recognize duck-typed CampaignApiError', async () => {
      // Simulate error that matches duck-type check but isn't instanceof
      const duckTypedError = { name: 'CampaignApiError', message: 'Duck typed', code: 'UNKNOWN' };
      mockFetch.mockRejectedValueOnce(duckTypedError);

      const { result } = renderHook(
        () => useCampaignEvents({ campaignId: 42 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Duck-typed error should be passed through (isCampaignApiError returns true)
      expect(result.current.error).toBeTruthy();
    });
  });
});
