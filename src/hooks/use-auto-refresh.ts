/**
 * Auto Refresh Hook
 * Story 2.8: Auto Refresh
 *
 * AC#2: Refresh Interval - 60 seconds (per project-context.md rate limit)
 * AC#6: Pause on Tab Inactive
 * AC#7: Error Recovery - silent errors, retry on interval
 */
'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/** Refresh interval in milliseconds (60 seconds - per project rate limit) */
export const REFRESH_INTERVAL = 60 * 1000;

/** Minimum spinner display time for visual feedback */
const MIN_SPINNER_MS = 500;

/** Local storage key for auto-refresh preference */
export const AUTO_REFRESH_STORAGE_KEY = 'dashboard-auto-refresh';

/** Query keys to invalidate on refresh */
export const DASHBOARD_QUERY_KEYS = ['dashboard', 'dashboardData'] as const;

export interface UseAutoRefreshOptions {
  /** Query keys to invalidate on refresh */
  queryKeys?: string[];
  /** Refresh interval in milliseconds (default: 30000) */
  interval?: number;
  /** Called when refresh starts */
  onRefreshStart?: () => void;
  /** Called when refresh completes */
  onRefreshComplete?: () => void;
  /** Called when refresh fails */
  onRefreshError?: (error: Error) => void;
}

export interface UseAutoRefreshReturn {
  /** Whether auto-refresh is enabled */
  enabled: boolean;
  /** Toggle auto-refresh on/off */
  toggleEnabled: (value: boolean) => void;
  /** Trigger immediate manual refresh */
  refresh: () => Promise<void>;
  /** Whether data is currently refreshing */
  isRefreshing: boolean;
  /** Timestamp of last successful refresh (null until hydrated) */
  lastUpdated: Date | null;
  /** Number of consecutive errors */
  errorCount: number;
}

/**
 * Auto Refresh Hook
 * Manages auto-refresh state, interval, and tab visibility
 */
export function useAutoRefresh(
  options: UseAutoRefreshOptions = {}
): UseAutoRefreshReturn {
  const {
    queryKeys = [...DASHBOARD_QUERY_KEYS],
    interval = REFRESH_INTERVAL,
    onRefreshStart,
    onRefreshComplete,
    onRefreshError,
  } = options;

  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load preference from localStorage and set initial timestamp (client-side only)
  // This prevents hydration mismatch by setting Date only after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set initial timestamp on client only (prevents hydration mismatch)
      setLastUpdated(new Date());

      const stored = localStorage.getItem(AUTO_REFRESH_STORAGE_KEY);
      if (stored === 'true') {
        setEnabled(true);
      }
    }
  }, []);

  // Save preference to localStorage
  const toggleEnabled = useCallback((value: boolean) => {
    setEnabled(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTO_REFRESH_STORAGE_KEY, value.toString());
    }
  }, []);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    onRefreshStart?.();

    try {
      // Force refetch all dashboard-related queries
      // MIN_SPINNER_MS ensures spinner is visible even when refetch is instant
      await Promise.all([
        ...queryKeys.map((key) =>
          queryClient.refetchQueries({ queryKey: [key] })
        ),
        new Promise((r) => setTimeout(r, MIN_SPINNER_MS)),
      ]);

      setLastUpdated(new Date());
      setErrorCount(0);
      onRefreshComplete?.();
    } catch (error) {
      // AC#7: Log error silently, don't show to user unless persistent
      console.error('[Auto Refresh] Refresh failed:', error);

      setErrorCount((prev) => prev + 1);
      onRefreshError?.(error instanceof Error ? error : new Error('Refresh failed'));
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, queryKeys, onRefreshStart, onRefreshComplete, onRefreshError]);

  // Auto refresh interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      // AC#6: Check if tab is visible before refreshing
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refresh();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, refresh]);

  // AC#6: Pause/resume on visibility change
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        // Refresh immediately when returning to tab
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, refresh]);

  return {
    enabled,
    toggleEnabled,
    refresh,
    isRefreshing,
    lastUpdated,
    errorCount,
  };
}
