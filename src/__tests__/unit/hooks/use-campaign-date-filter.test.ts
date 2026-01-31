/**
 * useCampaignDateFilter Hook Tests
 * Story 5.8: Campaign Date Filter
 *
 * AC#3: Filter Application - date range calculations
 * AC#4: URL Sync - reads period from URL
 * AC#7: Clear Filter - allTime returns undefined dates
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
const mockSearchParamsMap = new Map<string, string>();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsMap.get(key) ?? null,
  }),
}));

// Import after mocking
import { useCampaignDateFilter } from '@/hooks/use-campaign-date-filter';

describe('useCampaignDateFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsMap.clear();
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Default Period (allTime)', () => {
    it('returns "allTime" as default period when no URL param', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.period).toBe('allTime');
    });

    it('returns undefined dateFrom and dateTo for allTime', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.dateFrom).toBeUndefined();
      expect(result.current.dateTo).toBeUndefined();
    });
  });

  describe('Today Period', () => {
    beforeEach(() => {
      mockSearchParamsMap.set('period', 'today');
    });

    it('returns "today" period from URL', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.period).toBe('today');
    });

    it('calculates correct date range for today', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.dateFrom).toBe(startOfDay(MOCK_DATE).toISOString());
      expect(result.current.dateTo).toBe(endOfDay(MOCK_DATE).toISOString());
    });
  });

  describe('Week Period', () => {
    beforeEach(() => {
      mockSearchParamsMap.set('period', 'week');
    });

    it('returns "week" period from URL', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.period).toBe('week');
    });

    it('calculates correct date range for this week (Monday start)', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.dateFrom).toBe(
        startOfWeek(MOCK_DATE, { weekStartsOn: 1 }).toISOString()
      );
      expect(result.current.dateTo).toBe(endOfDay(MOCK_DATE).toISOString());
    });
  });

  describe('Month Period', () => {
    beforeEach(() => {
      mockSearchParamsMap.set('period', 'month');
    });

    it('returns "month" period from URL', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.period).toBe('month');
    });

    it('calculates correct date range for this month', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.dateFrom).toBe(startOfMonth(MOCK_DATE).toISOString());
      expect(result.current.dateTo).toBe(endOfDay(MOCK_DATE).toISOString());
    });
  });

  describe('Last Month Period', () => {
    beforeEach(() => {
      mockSearchParamsMap.set('period', 'lastMonth');
    });

    it('returns "lastMonth" period from URL', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.period).toBe('lastMonth');
    });

    it('calculates correct date range for last month', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      const lastMonth = subMonths(MOCK_DATE, 1);
      expect(result.current.dateFrom).toBe(startOfMonth(lastMonth).toISOString());
      expect(result.current.dateTo).toBe(endOfMonth(lastMonth).toISOString());
    });
  });

  describe('Custom Period', () => {
    it('returns "custom" period from URL', () => {
      mockSearchParamsMap.set('period', 'custom');
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.period).toBe('custom');
    });

    it('parses custom date range from URL params', () => {
      mockSearchParamsMap.set('period', 'custom');
      mockSearchParamsMap.set('from', '2026-01-01T00:00:00.000Z');
      mockSearchParamsMap.set('to', '2026-01-10T23:59:59.999Z');

      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.dateFrom).toBe(new Date('2026-01-01T00:00:00.000Z').toISOString());
      expect(result.current.dateTo).toBe(new Date('2026-01-10T23:59:59.999Z').toISOString());
    });

    it('returns undefined dates for custom period with missing from/to', () => {
      mockSearchParamsMap.set('period', 'custom');
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.dateFrom).toBeUndefined();
      expect(result.current.dateTo).toBeUndefined();
    });

    it('returns undefined dates for custom period with invalid dates', () => {
      mockSearchParamsMap.set('period', 'custom');
      mockSearchParamsMap.set('from', 'invalid');
      mockSearchParamsMap.set('to', 'also-invalid');

      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.dateFrom).toBeUndefined();
      expect(result.current.dateTo).toBeUndefined();
    });

    // Story 5.8 Fix #9: Validate from <= to
    it('returns undefined dates when from > to (invalid date order)', () => {
      mockSearchParamsMap.set('period', 'custom');
      mockSearchParamsMap.set('from', '2026-02-01T00:00:00.000Z');  // Feb 1
      mockSearchParamsMap.set('to', '2026-01-01T00:00:00.000Z');    // Jan 1 (earlier)

      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.dateFrom).toBeUndefined();
      expect(result.current.dateTo).toBeUndefined();
    });
  });

  describe('Invalid Period Handling', () => {
    it('falls back to allTime for invalid period', () => {
      mockSearchParamsMap.set('period', 'invalid');
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.period).toBe('allTime');
      expect(result.current.dateFrom).toBeUndefined();
      expect(result.current.dateTo).toBeUndefined();
    });

    it('falls back to allTime for empty period', () => {
      const { result } = renderHook(() => useCampaignDateFilter());
      expect(result.current.period).toBe('allTime');
    });
  });
});
