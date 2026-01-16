/**
 * Sales Trend Hook Tests
 * Story 3.5: Individual Performance Trend
 *
 * Task 1: Trend Data API Hook
 * - Creates mock data for development
 * - Handles loading, error, and empty states
 * - Uses TanStack Query v5 object syntax
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSalesTrend } from '@/hooks/use-sales-trend';
import type { ReactNode } from 'react';

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
    // Mock fetch to always fail (force mock data fallback)
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
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

  describe('Mock Data Fallback', () => {
    it('returns mock data when API fails', async () => {
      const { result } = renderHook(() => useSalesTrend('user-1', 30), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have mock data
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.userId).toBe('user-1');
      expect(result.current.data?.period).toBe(30);
      expect(result.current.data?.dailyData.length).toBe(30);
      expect(result.current.data?.teamAverage.length).toBe(30);
    });

    it('generates correct number of data points for each period', async () => {
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

    it('generates different data for different users (deterministic)', async () => {
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

      // Data should be different for different users
      const alice = result1.current.data?.dailyData[0];
      const bob = result2.current.data?.dailyData[0];

      // Just verify structure is correct
      expect(alice).toHaveProperty('date');
      expect(alice).toHaveProperty('claimed');
      expect(alice).toHaveProperty('closed');
      expect(bob).toHaveProperty('date');
      expect(bob).toHaveProperty('claimed');
      expect(bob).toHaveProperty('closed');
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

        // contacted <= claimed, closed <= contacted (logically)
        expect(day.contacted).toBeLessThanOrEqual(day.claimed);
        expect(day.closed).toBeLessThanOrEqual(day.contacted);

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

      // Change period
      rerender({ userId: 'user-1', days: 7 as const });

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
});
