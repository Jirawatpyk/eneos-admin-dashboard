/**
 * Sales Trend Hook Extra Tests
 * Story 3.5: Individual Performance Trend
 * Tests for internal functions and hook behavior in use-sales-trend
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSalesTrend } from '../hooks/use-sales-trend';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const originalNodeEnv = process.env.NODE_ENV;

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

describe('useSalesTrend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('[P1] Successful API response', () => {
    it('should fetch trend data from API', async () => {
      const mockTrendData = {
        userId: 'user-1',
        name: 'Sales Rep',
        period: 30,
        dailyData: [
          { date: '2026-01-01', claimed: 5, contacted: 3, closed: 2, conversionRate: 40 },
        ],
        teamAverage: [
          { date: '2026-01-01', claimed: 4, contacted: 3, closed: 1, conversionRate: 25 },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockTrendData }),
      });

      const { result } = renderHook(
        () => useSalesTrend('user-1', 30),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.userId).toBe('user-1');
      expect(result.current.data?.dailyData).toHaveLength(1);
    });

    it('should call correct API URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { userId: 'user-1', dailyData: [], teamAverage: [] },
        }),
      });

      renderHook(
        () => useSalesTrend('user-1', 7),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/sales-performance/trend?userId=user-1&days=7')
      );
    });
  });

  describe('[P1] Dev mode fallback', () => {
    it('should return mock data when API returns 404 in dev mode', async () => {
      process.env.NODE_ENV = 'development';

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(
        () => useSalesTrend('user-1', 30),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(result.current.data?.userId).toBe('user-1');
      expect(result.current.data?.period).toBe(30);
      expect(result.current.data?.dailyData.length).toBe(30);
      expect(result.current.data?.teamAverage.length).toBe(30);
    });

    it('should return mock data on network error in dev mode', async () => {
      process.env.NODE_ENV = 'development';

      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(
        () => useSalesTrend('user-2', 7),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(result.current.data?.userId).toBe('user-2');
      expect(result.current.data?.period).toBe(7);
      expect(result.current.data?.dailyData.length).toBe(7);
    });
  });

  describe('[P1] Error recovery in dev mode', () => {
    it('should fallback to mock data on 500 error in dev', async () => {
      process.env.NODE_ENV = 'development';

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(
        () => useSalesTrend('user-1', 30),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.data).toBeDefined());
      expect(result.current.data?.userId).toBe('user-1');
    });

    it('should fallback to mock data on network error in dev', async () => {
      process.env.NODE_ENV = 'development';

      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const { result } = renderHook(
        () => useSalesTrend('user-1', 30),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.data).toBeDefined());
      expect(result.current.data?.userId).toBe('user-1');
    });
  });

  describe('[P1] Hook options', () => {
    it('should not fetch when enabled=false', () => {
      const { result } = renderHook(
        () => useSalesTrend('user-1', 30, { enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not fetch when userId is empty', () => {
      const { result } = renderHook(
        () => useSalesTrend('', 30),
        { wrapper: createWrapper() }
      );

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return refetch function', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { userId: 'user-1', dailyData: [], teamAverage: [] },
        }),
      });

      const { result } = renderHook(
        () => useSalesTrend('user-1', 30),
        { wrapper: createWrapper() }
      );

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('[P1] Invalid API response', () => {
    it('should fallback to mock data on invalid response in dev', async () => {
      process.env.NODE_ENV = 'development';

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: { message: 'Invalid period' },
        }),
      });

      const { result } = renderHook(
        () => useSalesTrend('user-1', 30),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.data).toBeDefined());
      expect(result.current.data?.userId).toBe('user-1');
      expect(result.current.data?.dailyData.length).toBe(30);
    });
  });
});
