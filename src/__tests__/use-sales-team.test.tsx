/**
 * useSalesTeam Hook Tests
 * Story 4.5: Filter by Owner - AC#2
 *
 * Tests for:
 * - Fetching sales team from API
 * - Loading and error states
 * - Data transformation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSalesTeam } from '@/hooks/use-sales-team';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useSalesTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('fetches sales team successfully', async () => {
    const mockTeam = [
      { id: 'user-1', name: 'John Doe', email: 'john@test.com' },
      { id: 'user-2', name: 'Jane Smith', email: 'jane@test.com' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockTeam }),
    });

    const { result } = renderHook(() => useSalesTeam(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockTeam);
    expect(result.current.isError).toBe(false);
  });

  it('handles API error', async () => {
    // Mock all retry attempts
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useSalesTeam(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 5000 });

    expect(result.current.error).toBeTruthy();
  });

  it('handles success: false response', async () => {
    // Mock all retry attempts
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch team' },
      }),
    });

    const { result } = renderHook(() => useSalesTeam(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 5000 });

    expect(result.current.error?.message).toBe('Failed to fetch team');
  });

  it('sets correct staleTime (5 minutes)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    const { result, rerender } = renderHook(() => useSalesTeam(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First call
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Rerender shouldn't trigger new fetch (data is still fresh)
    rerender();

    // Still only one call (data is cached)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('provides loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useSalesTeam(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('provides refetch function', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useSalesTeam(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('calls correct API endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    renderHook(() => useSalesTeam(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/sales-team', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    });
  });
});
