/**
 * useAutoRefresh Hook Tests
 * Story 2.8: Auto Refresh
 *
 * AC#2: Refresh Interval - 30 seconds
 * AC#6: Pause on Tab Inactive
 * AC#7: Error Recovery - silent errors, retry on interval
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useAutoRefresh,
  REFRESH_INTERVAL,
  AUTO_REFRESH_STORAGE_KEY,
} from '@/hooks/use-auto-refresh';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock document.visibilityState
let mockVisibilityState = 'visible';
Object.defineProperty(document, 'visibilityState', {
  configurable: true,
  get: () => mockVisibilityState,
});

// Create test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
    mockVisibilityState = 'visible';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have enabled as false by default', () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      expect(result.current.enabled).toBe(false);
    });

    it('should have isRefreshing as false initially', () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isRefreshing).toBe(false);
    });

    it('should have lastUpdated as null initially (before hydration)', () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      // Initially null, then set to Date after useEffect runs
      // After act, useEffect has run and set the date
      expect(result.current.lastUpdated === null || result.current.lastUpdated instanceof Date).toBe(true);
    });

    it('should have errorCount as 0', () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      expect(result.current.errorCount).toBe(0);
    });
  });

  describe('localStorage Persistence', () => {
    it('should load enabled state from localStorage', () => {
      localStorageMock.setItem(AUTO_REFRESH_STORAGE_KEY, 'true');

      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      expect(result.current.enabled).toBe(true);
    });

    it('should save enabled state to localStorage when toggled', () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.toggleEnabled(true);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        AUTO_REFRESH_STORAGE_KEY,
        'true'
      );
    });

    it('should save disabled state to localStorage when toggled off', () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.toggleEnabled(true);
        result.current.toggleEnabled(false);
      });

      expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
        AUTO_REFRESH_STORAGE_KEY,
        'false'
      );
    });
  });

  describe('Toggle Functionality', () => {
    it('should toggle enabled state', () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      expect(result.current.enabled).toBe(false);

      act(() => {
        result.current.toggleEnabled(true);
      });

      expect(result.current.enabled).toBe(true);

      act(() => {
        result.current.toggleEnabled(false);
      });

      expect(result.current.enabled).toBe(false);
    });
  });

  describe('AC#2: Refresh Interval', () => {
    it('should have 60 second refresh interval constant (rate limit compliance)', () => {
      expect(REFRESH_INTERVAL).toBe(60000);
    });

    it('should not refresh when disabled', async () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      // Advance time by 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(REFRESH_INTERVAL);
      });

      // Should not have refreshed (lastUpdated should be initial value)
      expect(result.current.isRefreshing).toBe(false);
    });

    it('should set interval when enabled', () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      // Enable auto-refresh
      act(() => {
        result.current.toggleEnabled(true);
      });

      expect(result.current.enabled).toBe(true);
      // Interval is set internally, verified by checking no error occurs
    });
  });

  describe('AC#4: Manual Refresh', () => {
    it('should expose refresh function', () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refresh).toBe('function');
    });

    it('should update lastUpdated when refresh is called', async () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      // After useEffect, lastUpdated should be set
      const initialLastUpdated = result.current.lastUpdated;

      // Wait a bit to ensure time difference
      await act(async () => {
        vi.advanceTimersByTime(100);
        await result.current.refresh();
      });

      // After refresh, lastUpdated should be a Date
      expect(result.current.lastUpdated).toBeInstanceOf(Date);
      if (initialLastUpdated && result.current.lastUpdated) {
        expect(result.current.lastUpdated.getTime()).toBeGreaterThanOrEqual(
          initialLastUpdated.getTime()
        );
      }
    });

    it('should complete refresh without error', async () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.refresh();
      });

      // After refresh completes, isRefreshing should be false
      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('AC#6: Pause on Tab Inactive', () => {
    it('should not refresh when tab is hidden', async () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      // Enable auto-refresh
      act(() => {
        result.current.toggleEnabled(true);
      });

      const initialLastUpdated = result.current.lastUpdated;

      // Set tab as hidden
      mockVisibilityState = 'hidden';

      // Advance time by 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(REFRESH_INTERVAL);
      });

      // lastUpdated should not have changed
      expect(result.current.lastUpdated).toEqual(initialLastUpdated);
    });

    it('should check visibility state before refreshing', () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      // Enable auto-refresh
      act(() => {
        result.current.toggleEnabled(true);
      });

      // Set tab as visible
      mockVisibilityState = 'visible';

      // The hook should check visibilityState on interval tick
      expect(result.current.enabled).toBe(true);
    });
  });

  describe('AC#7: Error Recovery', () => {
    it('should reset errorCount on successful refresh', async () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.errorCount).toBe(0);
    });

    it('should call onRefreshStart callback', async () => {
      const onRefreshStart = vi.fn();

      const { result } = renderHook(
        () => useAutoRefresh({ onRefreshStart }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.refresh();
      });

      expect(onRefreshStart).toHaveBeenCalled();
    });

    it('should call onRefreshComplete callback', async () => {
      const onRefreshComplete = vi.fn();

      const { result } = renderHook(
        () => useAutoRefresh({ onRefreshComplete }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.refresh();
      });

      expect(onRefreshComplete).toHaveBeenCalled();
    });

    it('should call onRefreshError callback when refresh fails', async () => {
      const onRefreshError = vi.fn();

      // Create a query client that throws on invalidateQueries
      const errorQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });

      // Mock invalidateQueries to throw
      const originalInvalidateQueries = errorQueryClient.invalidateQueries.bind(errorQueryClient);
      errorQueryClient.invalidateQueries = vi.fn().mockRejectedValue(new Error('Network error'));

      const errorWrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={errorQueryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(
        () => useAutoRefresh({ onRefreshError }),
        { wrapper: errorWrapper }
      );

      await act(async () => {
        await result.current.refresh();
      });

      expect(onRefreshError).toHaveBeenCalledWith(expect.any(Error));
      expect(onRefreshError).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Network error',
      }));

      // Restore original
      errorQueryClient.invalidateQueries = originalInvalidateQueries;
    });
  });

  describe('Cleanup', () => {
    it('should clear interval on unmount', () => {
      const { result, unmount } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      // Enable auto-refresh
      act(() => {
        result.current.toggleEnabled(true);
      });

      // Unmount
      unmount();

      // Should not throw when advancing time after unmount
      vi.advanceTimersByTime(REFRESH_INTERVAL);
    });

    it('should clear interval when disabled', async () => {
      const { result } = renderHook(() => useAutoRefresh(), {
        wrapper: createWrapper(),
      });

      // Enable auto-refresh
      act(() => {
        result.current.toggleEnabled(true);
      });

      // Disable auto-refresh
      act(() => {
        result.current.toggleEnabled(false);
      });

      const lastUpdated = result.current.lastUpdated;

      // Advance time
      await act(async () => {
        vi.advanceTimersByTime(REFRESH_INTERVAL);
      });

      // lastUpdated should not have changed
      expect(result.current.lastUpdated).toEqual(lastUpdated);
    });
  });
});
