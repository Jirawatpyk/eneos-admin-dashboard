/**
 * useSystemHealth Hook Tests
 * Story 7.5: System Health
 *
 * Tests for:
 * - AC#1: Fetch health data
 * - AC#4: Refresh functionality
 * - AC#6: Error state handling
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSystemHealth, formatUptime } from '@/hooks/use-system-health';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock health response
const mockHealthResponse = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  services: {
    googleSheets: { status: 'up', latency: 45 },
    geminiAI: { status: 'up', latency: 120 },
    lineAPI: { status: 'up', latency: 30 },
  },
};

// Mock live response
const mockLiveResponse = {
  alive: true,
  uptime: 3600, // 1 hour
};

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useSystemHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('fetching health data', () => {
    it('fetches health data on mount', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLiveResponse),
        });

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/health');
      expect(mockFetch).toHaveBeenCalledWith('/api/live');
      expect(result.current.data?.status).toBe('healthy');
      expect(result.current.data?.uptime).toBe(3600);
    });

    it('sets isLoading to true initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('combines health and live data', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLiveResponse),
        });

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(result.current.data?.status).toBe('healthy');
      expect(result.current.data?.uptime).toBe(3600);
      expect(result.current.data?.version).toBe('1.0.0');
    });

    it('handles /live endpoint failure gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse),
        })
        .mockRejectedValueOnce(new Error('Live endpoint failed'));

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Should still have health data, just no uptime
      expect(result.current.data?.status).toBe('healthy');
      expect(result.current.data?.uptime).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('sets isError to true when health endpoint fails', async () => {
      // Mock both health and live endpoints - health fails, live succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: () => Promise.resolve({ error: 'Backend unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLiveResponse),
        });

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );

      expect(result.current.error).toBeDefined();
    });

    it('handles network error', async () => {
      // Both endpoints fail with network error
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('refresh functionality', () => {
    it('provides refetch function', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLiveResponse),
        });

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('refetch calls /api/health/refresh endpoint', async () => {
      // Initial fetch
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLiveResponse),
        });

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Setup mock for refresh
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({ ...mockHealthResponse, refreshed: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLiveResponse),
        });

      // Call refetch
      await result.current.refetch();

      expect(mockFetch).toHaveBeenCalledWith('/api/health/refresh');
    });
  });
});

describe('formatUptime', () => {
  it('formats seconds to minutes only', () => {
    expect(formatUptime(120)).toBe('2m');
    expect(formatUptime(59)).toBe('0m'); // 0 minutes when < 60 seconds
    expect(formatUptime(60)).toBe('1m');
  });

  it('formats seconds to hours and minutes', () => {
    // Note: 0 minutes is omitted when there are hours
    expect(formatUptime(3600)).toBe('1h'); // 1 hour, 0 minutes = "1h" (0m omitted)
    expect(formatUptime(3660)).toBe('1h 1m');
    expect(formatUptime(7200)).toBe('2h'); // 2 hours, 0 minutes = "2h" (0m omitted)
    expect(formatUptime(5400)).toBe('1h 30m');
  });

  it('formats seconds to days, hours, and minutes', () => {
    // Note: 0 minutes and 0 hours are omitted when there are days
    expect(formatUptime(86400)).toBe('1d'); // 1 day, 0 hours, 0 minutes = "1d"
    expect(formatUptime(90000)).toBe('1d 1h'); // 1 day, 1 hour, 0 minutes = "1d 1h"
    expect(formatUptime(90060)).toBe('1d 1h 1m');
    expect(formatUptime(172800)).toBe('2d'); // 2 days, 0 hours, 0 minutes = "2d"
  });

  it('handles zero seconds', () => {
    expect(formatUptime(0)).toBe('0m');
  });

  it('handles large values', () => {
    // 7 days, 12 hours, 30 minutes
    const sevenDays = 7 * 86400 + 12 * 3600 + 30 * 60;
    expect(formatUptime(sevenDays)).toBe('7d 12h 30m');
  });
});
