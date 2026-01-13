/**
 * useDateFilter Hook Tests
 * Story 2.7: Date Filter
 *
 * Tests date range calculations for each period option
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfMonth,
  subMonths,
} from 'date-fns';

// Mock date for consistent testing
const MOCK_DATE = new Date('2026-01-15T10:30:00');

// Mock next/navigation
let mockSearchParamsMap = new Map<string, string>();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsMap.get(key) ?? null,
  }),
}));

// Import after mocking
import { useDateFilter } from '@/hooks/use-date-filter';

describe('useDateFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsMap.clear();
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Default Period', () => {
    it('returns "month" as default period', () => {
      const { result } = renderHook(() => useDateFilter());
      expect(result.current.period).toBe('month');
    });

    it('calculates correct date range for default month', () => {
      const { result } = renderHook(() => useDateFilter());

      expect(result.current.dateRange.from).toEqual(startOfMonth(MOCK_DATE));
      expect(result.current.dateRange.to).toEqual(endOfDay(MOCK_DATE));
    });

    it('isCustom is false for default period', () => {
      const { result } = renderHook(() => useDateFilter());
      expect(result.current.isCustom).toBe(false);
    });
  });

  describe('Today Period', () => {
    beforeEach(() => {
      mockSearchParamsMap.set('period', 'today');
    });

    it('returns "today" period from URL', () => {
      const { result } = renderHook(() => useDateFilter());
      expect(result.current.period).toBe('today');
    });

    it('calculates correct date range for today', () => {
      const { result } = renderHook(() => useDateFilter());

      expect(result.current.dateRange.from).toEqual(startOfDay(MOCK_DATE));
      expect(result.current.dateRange.to).toEqual(endOfDay(MOCK_DATE));
    });
  });

  describe('Week Period', () => {
    beforeEach(() => {
      mockSearchParamsMap.set('period', 'week');
    });

    it('returns "week" period from URL', () => {
      const { result } = renderHook(() => useDateFilter());
      expect(result.current.period).toBe('week');
    });

    it('calculates correct date range for this week (Monday start)', () => {
      const { result } = renderHook(() => useDateFilter());

      expect(result.current.dateRange.from).toEqual(
        startOfWeek(MOCK_DATE, { weekStartsOn: 1 })
      );
      expect(result.current.dateRange.to).toEqual(endOfDay(MOCK_DATE));
    });
  });

  describe('Month Period', () => {
    beforeEach(() => {
      mockSearchParamsMap.set('period', 'month');
    });

    it('returns "month" period from URL', () => {
      const { result } = renderHook(() => useDateFilter());
      expect(result.current.period).toBe('month');
    });

    it('calculates correct date range for this month', () => {
      const { result } = renderHook(() => useDateFilter());

      expect(result.current.dateRange.from).toEqual(startOfMonth(MOCK_DATE));
      expect(result.current.dateRange.to).toEqual(endOfDay(MOCK_DATE));
    });
  });

  describe('Last Month Period', () => {
    beforeEach(() => {
      mockSearchParamsMap.set('period', 'lastMonth');
    });

    it('returns "lastMonth" period from URL', () => {
      const { result } = renderHook(() => useDateFilter());
      expect(result.current.period).toBe('lastMonth');
    });

    it('calculates correct date range for last month', () => {
      const { result } = renderHook(() => useDateFilter());
      const lastMonth = subMonths(MOCK_DATE, 1);

      expect(result.current.dateRange.from).toEqual(startOfMonth(lastMonth));
      expect(result.current.dateRange.to).toEqual(endOfMonth(lastMonth));
    });
  });

  describe('Custom Period', () => {
    it('returns "custom" period from URL', () => {
      mockSearchParamsMap.set('period', 'custom');
      const { result } = renderHook(() => useDateFilter());
      expect(result.current.period).toBe('custom');
    });

    it('isCustom is true for custom period', () => {
      mockSearchParamsMap.set('period', 'custom');
      const { result } = renderHook(() => useDateFilter());
      expect(result.current.isCustom).toBe(true);
    });

    it('parses custom date range from URL params', () => {
      mockSearchParamsMap.set('period', 'custom');
      mockSearchParamsMap.set('from', '2026-01-01T00:00:00');
      mockSearchParamsMap.set('to', '2026-01-10T23:59:59');

      const { result } = renderHook(() => useDateFilter());

      expect(result.current.dateRange.from).toEqual(new Date('2026-01-01T00:00:00'));
      expect(result.current.dateRange.to).toEqual(new Date('2026-01-10T23:59:59'));
    });

    it('falls back to month range for invalid custom dates', () => {
      mockSearchParamsMap.set('period', 'custom');
      mockSearchParamsMap.set('from', 'invalid');
      mockSearchParamsMap.set('to', 'invalid');

      const { result } = renderHook(() => useDateFilter());

      expect(result.current.dateRange.from).toEqual(startOfMonth(MOCK_DATE));
      expect(result.current.dateRange.to).toEqual(endOfDay(MOCK_DATE));
    });
  });

  describe('Invalid Period Handling', () => {
    it('falls back to month for invalid period', () => {
      mockSearchParamsMap.set('period', 'invalid');
      const { result } = renderHook(() => useDateFilter());
      expect(result.current.period).toBe('month');
    });

    it('falls back to month for empty period', () => {
      const { result } = renderHook(() => useDateFilter());
      expect(result.current.period).toBe('month');
    });
  });
});
