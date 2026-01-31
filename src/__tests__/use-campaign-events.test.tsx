/**
 * Campaign Events Hook Tests
 * Story 5.7: Campaign Detail Sheet
 * Tests for useCampaignEvents hook (Task 2)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCampaignEvents } from '../hooks/use-campaign-events';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
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

const mockEventsResponse = {
  success: true,
  data: {
    data: [
      {
        eventId: 1,
        email: 'test@example.com',
        event: 'click',
        eventAt: '2026-01-30T10:00:00Z',
        url: 'https://example.com',
      },
      {
        eventId: 2,
        email: 'test2@example.com',
        event: 'opened',
        eventAt: '2026-01-30T09:00:00Z',
        url: null,
      },
    ],
    pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
  },
};

describe('useCampaignEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch events successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEventsResponse),
    });

    const { result } = renderHook(
      () => useCampaignEvents({ campaignId: 42 }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.data.data).toHaveLength(2);
    expect(result.current.isError).toBe(false);
  });

  it('should not fetch when campaignId is 0', async () => {
    const { result } = renderHook(
      () => useCampaignEvents({ campaignId: 0 }),
      { wrapper: createWrapper() }
    );

    // Should not be loading since query is disabled
    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should pass pagination params to API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEventsResponse),
    });

    renderHook(
      () => useCampaignEvents({ campaignId: 42, page: 3, limit: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=3');
    expect(url).toContain('limit=10');
  });

  it('should pass event filter to API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEventsResponse),
    });

    renderHook(
      () => useCampaignEvents({ campaignId: 42, event: 'delivered' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('event=delivered');
  });

  it('should handle error state', async () => {
    // Hook has retry: 2, so need 3 total failures (initial + 2 retries)
    const errorResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    };
    mockFetch
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(errorResponse);

    const { result } = renderHook(
      () => useCampaignEvents({ campaignId: 42 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 10000 });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBeTruthy();
  });

  it('should provide refetch function', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEventsResponse),
    });

    const { result } = renderHook(
      () => useCampaignEvents({ campaignId: 42 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should pass date range params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEventsResponse),
    });

    renderHook(
      () => useCampaignEvents({
        campaignId: 42,
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('dateFrom=2026-01-01');
    expect(url).toContain('dateTo=2026-01-31');
  });

  it('should return isFetching state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEventsResponse),
    });

    const { result } = renderHook(
      () => useCampaignEvents({ campaignId: 42 }),
      { wrapper: createWrapper() }
    );

    // Initially loading
    expect(result.current.isFetching).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });
  });
});
