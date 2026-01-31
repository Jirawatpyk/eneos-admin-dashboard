/**
 * useCampaignDateFilter Hook Edge Cases Tests (TEA Guardrail)
 * Story 5.8: Campaign Date Filter
 *
 * Additional edge case tests beyond the main test file
 * Focuses on boundary conditions and error handling
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

describe('useCampaignDateFilter Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsMap.clear();
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Boundary Dates', () => {
    it('[P1] should handle month boundary correctly (start of month)', () => {
      // Set date to first day of month
      vi.setSystemTime(new Date('2026-01-01T00:00:01'));
      mockSearchParamsMap.set('period', 'month');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Should still work correctly on first day of month
      expect(result.current.dateFrom).toBe(
        startOfMonth(new Date('2026-01-01T00:00:01')).toISOString()
      );
    });

    it('[P1] should handle week boundary correctly (Monday)', () => {
      // Set date to a Monday
      vi.setSystemTime(new Date('2026-01-13T10:00:00')); // Monday
      mockSearchParamsMap.set('period', 'week');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Week should start on the same day (Monday)
      expect(result.current.dateFrom).toBe(
        startOfWeek(new Date('2026-01-13T10:00:00'), { weekStartsOn: 1 }).toISOString()
      );
    });

    it('[P1] should handle week boundary correctly (Sunday)', () => {
      // Set date to a Sunday
      vi.setSystemTime(new Date('2026-01-19T10:00:00')); // Sunday
      mockSearchParamsMap.set('period', 'week');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Week should start on previous Monday
      const expectedStart = startOfWeek(new Date('2026-01-19T10:00:00'), {
        weekStartsOn: 1,
      });
      expect(result.current.dateFrom).toBe(expectedStart.toISOString());
    });

    it('[P2] should handle year boundary for lastMonth (January)', () => {
      // Set date to January - lastMonth should be December of previous year
      vi.setSystemTime(new Date('2026-01-15T10:00:00'));
      mockSearchParamsMap.set('period', 'lastMonth');

      const { result } = renderHook(() => useCampaignDateFilter());

      const lastMonth = subMonths(new Date('2026-01-15T10:00:00'), 1);
      expect(result.current.dateFrom).toBe(startOfMonth(lastMonth).toISOString());
      expect(result.current.dateTo).toBe(endOfMonth(lastMonth).toISOString());
    });
  });

  describe('Custom Period Edge Cases', () => {
    it('[P1] should handle same from and to date', () => {
      mockSearchParamsMap.set('period', 'custom');
      mockSearchParamsMap.set('from', '2026-01-15T00:00:00.000Z');
      mockSearchParamsMap.set('to', '2026-01-15T23:59:59.999Z');

      const { result } = renderHook(() => useCampaignDateFilter());

      expect(result.current.dateFrom).toBe('2026-01-15T00:00:00.000Z');
      expect(result.current.dateTo).toBe('2026-01-15T23:59:59.999Z');
    });

    it('[P1] should handle exactly equal from and to timestamps', () => {
      mockSearchParamsMap.set('period', 'custom');
      mockSearchParamsMap.set('from', '2026-01-15T12:00:00.000Z');
      mockSearchParamsMap.set('to', '2026-01-15T12:00:00.000Z');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Equal dates should be valid (from <= to)
      expect(result.current.dateFrom).toBe('2026-01-15T12:00:00.000Z');
      expect(result.current.dateTo).toBe('2026-01-15T12:00:00.000Z');
    });

    it('[P1] should return undefined for from > to (Fix #9 validation)', () => {
      mockSearchParamsMap.set('period', 'custom');
      mockSearchParamsMap.set('from', '2026-02-01T00:00:00.000Z');
      mockSearchParamsMap.set('to', '2026-01-01T00:00:00.000Z');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Invalid order should return undefined dates
      expect(result.current.dateFrom).toBeUndefined();
      expect(result.current.dateTo).toBeUndefined();
    });

    it('[P2] should handle timezone edge cases in custom dates', () => {
      mockSearchParamsMap.set('period', 'custom');
      // UTC dates that might cross day boundaries in local time
      mockSearchParamsMap.set('from', '2026-01-14T23:00:00.000Z');
      mockSearchParamsMap.set('to', '2026-01-15T01:00:00.000Z');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Should preserve the UTC dates exactly
      expect(result.current.dateFrom).toBe(
        new Date('2026-01-14T23:00:00.000Z').toISOString()
      );
      expect(result.current.dateTo).toBe(
        new Date('2026-01-15T01:00:00.000Z').toISOString()
      );
    });

    it('[P2] should handle partial ISO date strings', () => {
      mockSearchParamsMap.set('period', 'custom');
      // Date without time component
      mockSearchParamsMap.set('from', '2026-01-01');
      mockSearchParamsMap.set('to', '2026-01-15');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Should parse partial dates
      expect(result.current.dateFrom).toBeDefined();
      expect(result.current.dateTo).toBeDefined();
    });

    it('[P2] should handle empty string from param', () => {
      mockSearchParamsMap.set('period', 'custom');
      mockSearchParamsMap.set('from', '');
      mockSearchParamsMap.set('to', '2026-01-15T23:59:59.999Z');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Empty string should result in undefined dates
      expect(result.current.dateFrom).toBeUndefined();
      expect(result.current.dateTo).toBeUndefined();
    });

    it('[P2] should handle empty string to param', () => {
      mockSearchParamsMap.set('period', 'custom');
      mockSearchParamsMap.set('from', '2026-01-01T00:00:00.000Z');
      mockSearchParamsMap.set('to', '');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Empty string should result in undefined dates
      expect(result.current.dateFrom).toBeUndefined();
      expect(result.current.dateTo).toBeUndefined();
    });
  });

  describe('Invalid Period Values', () => {
    it('[P1] should handle null period gracefully', () => {
      // No period set = null
      const { result } = renderHook(() => useCampaignDateFilter());

      expect(result.current.period).toBe('allTime');
      expect(result.current.dateFrom).toBeUndefined();
      expect(result.current.dateTo).toBeUndefined();
    });

    it('[P2] should handle whitespace period', () => {
      mockSearchParamsMap.set('period', '   ');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Should fall back to allTime
      expect(result.current.period).toBe('allTime');
    });

    it('[P2] should handle case-sensitive period values', () => {
      mockSearchParamsMap.set('period', 'TODAY'); // uppercase

      const { result } = renderHook(() => useCampaignDateFilter());

      // Should fall back to allTime (case-sensitive)
      expect(result.current.period).toBe('allTime');
    });

    it('[P2] should handle period with special characters', () => {
      mockSearchParamsMap.set('period', 'today<script>');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Should fall back to allTime
      expect(result.current.period).toBe('allTime');
    });
  });

  describe('Today Period Edge Cases', () => {
    it('[P1] should handle midnight boundary', () => {
      vi.setSystemTime(new Date('2026-01-15T00:00:00'));
      mockSearchParamsMap.set('period', 'today');

      const { result } = renderHook(() => useCampaignDateFilter());

      expect(result.current.dateFrom).toBe(
        startOfDay(new Date('2026-01-15T00:00:00')).toISOString()
      );
      expect(result.current.dateTo).toBe(
        endOfDay(new Date('2026-01-15T00:00:00')).toISOString()
      );
    });

    it('[P1] should handle end of day boundary', () => {
      vi.setSystemTime(new Date('2026-01-15T23:59:59.999'));
      mockSearchParamsMap.set('period', 'today');

      const { result } = renderHook(() => useCampaignDateFilter());

      expect(result.current.dateFrom).toBe(
        startOfDay(new Date('2026-01-15T23:59:59.999')).toISOString()
      );
    });
  });

  describe('Return Value Structure', () => {
    it('[P0] should always return period property', () => {
      const { result } = renderHook(() => useCampaignDateFilter());

      expect(result.current).toHaveProperty('period');
      expect(typeof result.current.period).toBe('string');
    });

    it('[P0] should always return dateFrom property (may be undefined)', () => {
      const { result } = renderHook(() => useCampaignDateFilter());

      expect(result.current).toHaveProperty('dateFrom');
    });

    it('[P0] should always return dateTo property (may be undefined)', () => {
      const { result } = renderHook(() => useCampaignDateFilter());

      expect(result.current).toHaveProperty('dateTo');
    });

    it('[P1] should return ISO 8601 format strings for dates', () => {
      mockSearchParamsMap.set('period', 'today');

      const { result } = renderHook(() => useCampaignDateFilter());

      // Should be valid ISO 8601 strings
      expect(result.current.dateFrom).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      );
      expect(result.current.dateTo).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      );
    });
  });

  describe('Hook Stability', () => {
    it('[P2] should return consistent results on re-render', () => {
      mockSearchParamsMap.set('period', 'month');

      const { result, rerender } = renderHook(() => useCampaignDateFilter());

      const firstDateFrom = result.current.dateFrom;
      const firstDateTo = result.current.dateTo;

      rerender();

      // Same values on re-render (since time is frozen)
      expect(result.current.dateFrom).toBe(firstDateFrom);
      expect(result.current.dateTo).toBe(firstDateTo);
    });
  });
});
