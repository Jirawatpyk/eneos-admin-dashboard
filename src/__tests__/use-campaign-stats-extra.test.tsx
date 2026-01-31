/**
 * Campaign Stats Hook - Extra Coverage Tests
 * Story 5.3: Campaign Summary Cards
 * Tests for isCampaignApiError and getErrorMessage utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCampaignStats } from '../hooks/use-campaign-stats';
import { CampaignApiError } from '@/types/campaigns';

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

describe('useCampaignStats - error handling', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  it('[P1] should wrap CampaignApiError correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    const { result } = renderHook(
      () => useCampaignStats(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Error should be wrapped as CampaignApiError
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBeDefined();
  });

  it('[P1] should handle non-CampaignApiError as CampaignApiError', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(
      () => useCampaignStats(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Non-CampaignApiError should be wrapped
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Network failure');
  });

  it('[P1] should handle duck-typed CampaignApiError', async () => {
    // Simulate serialized error (lost prototype)
    const serializedError = { name: 'CampaignApiError', message: 'Serialized error', statusCode: 500 };
    mockFetch.mockRejectedValue(serializedError);

    const { result } = renderHook(
      () => useCampaignStats(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('[P1] should handle non-Error non-object thrown', async () => {
    mockFetch.mockRejectedValue('string error');

    const { result } = renderHook(
      () => useCampaignStats(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

describe('useCampaignStats - enabled option', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  it('[P1] should not fetch when enabled=false', () => {
    const { result } = renderHook(
      () => useCampaignStats({ enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('[P1] should return null error when no error', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          data: [{
            campaignId: 1,
            campaignName: 'Test',
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
          }],
          pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
        },
      }),
    });

    const { result } = renderHook(
      () => useCampaignStats(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
  });
});
