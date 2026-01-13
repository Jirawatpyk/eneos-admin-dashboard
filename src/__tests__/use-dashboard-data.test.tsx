/**
 * useDashboardData Hook Tests
 * Story 2.1: KPI Cards
 * AC: #2, #5, #6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboardData } from '../hooks/use-dashboard-data';
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

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful fetch', () => {
    it('should fetch dashboard data with default period', async () => {
      const mockData = {
        success: true,
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 10,
            lost: 5,
            unreachable: 5,
            conversionRate: 10,
          },
          trends: { daily: [] },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData.data);
      expect(result.current.isError).toBe(false);
    });

    it('should use month as default period', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=month'),
        expect.any(Object)
      );
    });

    it('should use custom period when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      renderHook(() => useDashboardData({ period: 'week' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=week'),
        expect.any(Object)
      );
    });
  });

  // Note: Error handling is tested in dashboard-api.test.ts for the fetch function
  // and in kpi-cards-grid.test.tsx for the UI component's error state;

  describe('Options', () => {
    it('should not fetch when enabled is false', async () => {
      renderHook(() => useDashboardData({ enabled: false }), {
        wrapper: createWrapper(),
      });

      // Give it some time
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should provide refetch function', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
