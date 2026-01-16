/**
 * Sales Trend Hook Tests
 * Story 3.5: Individual Performance Trend
 *
 * Task 1: Trend Data API Hook
 * - Fetches data from API
 * - Handles loading, error, and empty states
 * - Uses TanStack Query v5 object syntax
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSalesTrend } from '@/hooks/use-sales-trend';
import type { ReactNode } from 'react';

// ===========================================
// Mock Data Generator
// ===========================================

/**
 * Creates mock API response matching backend contract:
 * GET /api/admin/sales-performance/trend?userId={userId}&days={days}
 *
 * Response structure from: eneos-sales-automation/src/controllers/admin.controller.ts
 * - getSalesPerformanceTrend endpoint
 *
 * @see SalesTrendData type in @/types/sales for TypeScript interface
 */
function createMockApiResponse(userId: string, days: number) {
  const dailyData = [];
  const teamAverage = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];

    dailyData.push({
      date: dateKey,
      claimed: 3 + (i % 3),
      contacted: 2 + (i % 2),
      closed: 1 + (i % 2),
      conversionRate: 33,
    });

    teamAverage.push({
      date: dateKey,
      claimed: 4,
      contacted: 3,
      closed: 1,
      conversionRate: 25,
    });
  }

  return {
    success: true,
    data: {
      userId,
      name: 'Test User',
      period: days,
      dailyData,
      teamAverage,
    },
  };
}

// ===========================================
// Test Setup
// ===========================================

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Don't cache between tests
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useSalesTrend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: Mock fetch to return successful API response
    global.fetch = vi.fn().mockImplementation((url: string) => {
      const urlParams = new URL(url, 'http://localhost');
      const userId = urlParams.searchParams.get('userId') || 'user-1';
      const days = parseInt(urlParams.searchParams.get('days') || '30', 10);

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(createMockApiResponse(userId, days)),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('starts with loading state', () => {
      const { result } = renderHook(() => useSalesTrend('user-1', 30), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('is disabled when userId is empty', () => {
      const { result } = renderHook(() => useSalesTrend('', 30), {
        wrapper: createWrapper(),
      });

      // Should not be loading because query is disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('respects enabled option', () => {
      const { result } = renderHook(
        () => useSalesTrend('user-1', 30, { enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('API Response', () => {
    it('returns data from API response', async () => {
      const { result } = renderHook(() => useSalesTrend('user-1', 30), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have API data
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.userId).toBe('user-1');
      expect(result.current.data?.period).toBe(30);
      expect(result.current.data?.dailyData.length).toBe(30);
      expect(result.current.data?.teamAverage.length).toBe(30);
    });

    it('returns correct number of data points for each period', async () => {
      const periods = [7, 30, 90] as const;

      for (const period of periods) {
        const { result } = renderHook(() => useSalesTrend('user-1', period), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.dailyData.length).toBe(period);
      }
    });

    it('fetches data for different users', async () => {
      const { result: result1 } = renderHook(
        () => useSalesTrend('user-alice', 30),
        { wrapper: createWrapper() }
      );

      const { result: result2 } = renderHook(
        () => useSalesTrend('user-bob', 30),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
        expect(result2.current.isLoading).toBe(false);
      });

      // Data should be present for different users
      expect(result1.current.data?.userId).toBe('user-alice');
      expect(result2.current.data?.userId).toBe('user-bob');
    });
  });

  describe('Data Structure', () => {
    it('returns data with correct structure', async () => {
      const { result } = renderHook(() => useSalesTrend('user-1', 7), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const data = result.current.data;
      expect(data).toBeDefined();

      // Check top-level structure
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('period');
      expect(data).toHaveProperty('dailyData');
      expect(data).toHaveProperty('teamAverage');

      // Check daily data structure
      const dailyMetric = data?.dailyData[0];
      expect(dailyMetric).toHaveProperty('date');
      expect(dailyMetric).toHaveProperty('claimed');
      expect(dailyMetric).toHaveProperty('contacted');
      expect(dailyMetric).toHaveProperty('closed');
      expect(dailyMetric).toHaveProperty('conversionRate');

      // Verify date format (ISO)
      expect(dailyMetric?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('generates realistic metric values', async () => {
      const { result } = renderHook(() => useSalesTrend('user-1', 7), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const dailyData = result.current.data?.dailyData || [];

      for (const day of dailyData) {
        // Values should be non-negative
        expect(day.claimed).toBeGreaterThanOrEqual(0);
        expect(day.contacted).toBeGreaterThanOrEqual(0);
        expect(day.closed).toBeGreaterThanOrEqual(0);

        // conversionRate should be percentage
        expect(day.conversionRate).toBeGreaterThanOrEqual(0);
        expect(day.conversionRate).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Query Key', () => {
    it('refetches when period changes', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      const { result, rerender } = renderHook(
        ({ userId, days }: { userId: string; days: 7 | 30 | 90 }) => useSalesTrend(userId, days),
        {
          wrapper: createWrapper(),
          initialProps: { userId: 'user-1', days: 30 as 7 | 30 | 90 },
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const callCount1 = fetchSpy.mock.calls.length;

      // Change period
      rerender({ userId: 'user-1', days: 7 });

      await waitFor(() => {
        expect(fetchSpy.mock.calls.length).toBeGreaterThan(callCount1);
      });
    });

    it('refetches when userId changes', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      const { result, rerender } = renderHook(
        ({ userId, days }) => useSalesTrend(userId, days),
        {
          wrapper: createWrapper(),
          initialProps: { userId: 'user-1', days: 30 as const },
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const callCount1 = fetchSpy.mock.calls.length;

      // Change userId
      rerender({ userId: 'user-2', days: 30 as const });

      await waitFor(() => {
        expect(fetchSpy.mock.calls.length).toBeGreaterThan(callCount1);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors', async () => {
      // Mock fetch to return error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          success: false,
          error: { code: 'SERVER_ERROR', message: 'Internal Server Error' },
        }),
      });

      const { result } = renderHook(() => useSalesTrend('user-1', 30), {
        wrapper: createWrapper(),
      });

      // Wait for error state (hook has retry: 1, so wait longer)
      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 5000 }
      );

      expect(result.current.error).toBeDefined();
    });
  });
});
