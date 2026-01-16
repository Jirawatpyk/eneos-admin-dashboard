/**
 * Sales Period Filter Hook Tests
 * Story 3.6: Period Filter for Sales Performance
 *
 * AC#3: Filter Application - date range calculation for different periods
 * AC#8: Integration with Existing Hooks - returns period, from, to for API calls
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
} from 'date-fns';

// Mock next/navigation
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

import { useSalesPeriodFilter } from '@/hooks/use-sales-period-filter';
import { renderHook } from '@testing-library/react';

// Fixed reference date for testing
const TEST_DATE = new Date('2026-01-15T10:00:00Z');

describe('useSalesPeriodFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('period');
    mockSearchParams.delete('from');
    mockSearchParams.delete('to');
    // Mock Date.now() for consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(TEST_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Period Detection', () => {
    it('returns "month" as default when no period param', () => {
      const { result } = renderHook(() => useSalesPeriodFilter());
      expect(result.current.period).toBe('month');
    });

    it('returns period from URL params', () => {
      mockSearchParams.set('period', 'quarter');
      const { result } = renderHook(() => useSalesPeriodFilter());
      expect(result.current.period).toBe('quarter');
    });

    it('falls back to "month" for invalid period', () => {
      mockSearchParams.set('period', 'invalid');
      const { result } = renderHook(() => useSalesPeriodFilter());
      expect(result.current.period).toBe('month');
    });
  });

  describe('Week Date Range Calculation', () => {
    it('calculates week range starting from Monday', () => {
      mockSearchParams.set('period', 'week');
      const { result } = renderHook(() => useSalesPeriodFilter());

      // 2026-01-15 is Thursday, so week starts Monday 2026-01-12
      const expectedFrom = startOfWeek(TEST_DATE, { weekStartsOn: 1 });

      expect(result.current.from.toISOString().split('T')[0]).toBe(
        expectedFrom.toISOString().split('T')[0]
      );
      // Hook returns endOfDay(now), so 'to' date should be same day as TEST_DATE
      expect(result.current.to.toISOString().split('T')[0]).toBe(
        TEST_DATE.toISOString().split('T')[0]
      );
    });
  });

  describe('Month Date Range Calculation', () => {
    it('calculates month range from start of month to now', () => {
      mockSearchParams.set('period', 'month');
      const { result } = renderHook(() => useSalesPeriodFilter());

      const expectedFrom = startOfMonth(TEST_DATE);

      expect(result.current.from.toISOString().split('T')[0]).toBe(
        expectedFrom.toISOString().split('T')[0]
      );
    });
  });

  describe('Quarter Date Range Calculation', () => {
    it('calculates current quarter range', () => {
      mockSearchParams.set('period', 'quarter');
      const { result } = renderHook(() => useSalesPeriodFilter());

      // Q1 2026 starts Jan 1
      const expectedFrom = startOfQuarter(TEST_DATE);

      expect(result.current.from.toISOString().split('T')[0]).toBe(
        expectedFrom.toISOString().split('T')[0]
      );
    });

    it('calculates last quarter range', () => {
      mockSearchParams.set('period', 'lastQuarter');
      const { result } = renderHook(() => useSalesPeriodFilter());

      // Q4 2025: Oct 1 - Dec 31
      const lastQ = subQuarters(TEST_DATE, 1);
      const expectedFrom = startOfQuarter(lastQ);
      const expectedTo = endOfQuarter(lastQ);

      expect(result.current.from.toISOString().split('T')[0]).toBe(
        expectedFrom.toISOString().split('T')[0]
      );
      expect(result.current.to.toISOString().split('T')[0]).toBe(
        expectedTo.toISOString().split('T')[0]
      );
    });
  });

  describe('Custom Date Range', () => {
    it('parses custom from/to dates from URL', () => {
      mockSearchParams.set('period', 'custom');
      mockSearchParams.set('from', '2026-01-01T00:00:00.000Z');
      mockSearchParams.set('to', '2026-01-10T23:59:59.999Z');

      const { result } = renderHook(() => useSalesPeriodFilter());

      expect(result.current.from.toISOString().split('T')[0]).toBe('2026-01-01');
      expect(result.current.to.toISOString().split('T')[0]).toBe('2026-01-10');
    });

    it('falls back to month range when custom params missing', () => {
      mockSearchParams.set('period', 'custom');
      // No from/to params

      const { result } = renderHook(() => useSalesPeriodFilter());

      const expectedFrom = startOfMonth(TEST_DATE);
      expect(result.current.from.toISOString().split('T')[0]).toBe(
        expectedFrom.toISOString().split('T')[0]
      );
    });

    it('handles invalid custom dates gracefully', () => {
      mockSearchParams.set('period', 'custom');
      mockSearchParams.set('from', 'invalid-date');
      mockSearchParams.set('to', 'also-invalid');

      const { result } = renderHook(() => useSalesPeriodFilter());

      // Should fall back to default month range
      const expectedFrom = startOfMonth(TEST_DATE);
      expect(result.current.from.toISOString().split('T')[0]).toBe(
        expectedFrom.toISOString().split('T')[0]
      );
    });
  });

  describe('Return Type', () => {
    it('returns period, from, and to', () => {
      const { result } = renderHook(() => useSalesPeriodFilter());

      expect(result.current).toHaveProperty('period');
      expect(result.current).toHaveProperty('from');
      expect(result.current).toHaveProperty('to');
      expect(result.current.from).toBeInstanceOf(Date);
      expect(result.current.to).toBeInstanceOf(Date);
    });

    it('returns isCustom flag', () => {
      const { result } = renderHook(() => useSalesPeriodFilter());
      expect(result.current).toHaveProperty('isCustom');
      expect(result.current.isCustom).toBe(false);
    });

    it('sets isCustom to true for custom period', () => {
      mockSearchParams.set('period', 'custom');
      const { result } = renderHook(() => useSalesPeriodFilter());
      expect(result.current.isCustom).toBe(true);
    });
  });

  describe('Quarter Boundary Dates', () => {
    // Note: These tests verify quarter calculation using date-fns directly
    // date-fns uses local timezone, so we compare month values instead of ISO strings

    it('handles Q1 start (Jan 1)', () => {
      // TEST_DATE is 2026-01-15 which is in Q1
      mockSearchParams.set('period', 'quarter');

      const { result } = renderHook(() => useSalesPeriodFilter());

      // Q1 2026 starts Jan 1
      const q1Start = startOfQuarter(TEST_DATE);
      expect(result.current.from.getMonth()).toBe(q1Start.getMonth()); // January = 0
      expect(result.current.from.getDate()).toBe(1);
    });

    it('handles Q2 start (Apr 1)', () => {
      // Test Q2 calculation using date-fns directly
      const q2Date = new Date(2026, 3, 15); // April 15, 2026 (month is 0-indexed)
      const q2Start = startOfQuarter(q2Date);
      expect(q2Start.getMonth()).toBe(3); // April = 3
      expect(q2Start.getDate()).toBe(1);
    });

    it('handles Q3 start (Jul 1)', () => {
      // Test Q3 calculation using date-fns directly
      const q3Date = new Date(2026, 6, 15); // July 15, 2026
      const q3Start = startOfQuarter(q3Date);
      expect(q3Start.getMonth()).toBe(6); // July = 6
      expect(q3Start.getDate()).toBe(1);
    });

    it('handles Q4 start (Oct 1)', () => {
      // Test Q4 calculation using date-fns directly
      const q4Date = new Date(2026, 9, 15); // October 15, 2026
      const q4Start = startOfQuarter(q4Date);
      expect(q4Start.getMonth()).toBe(9); // October = 9
      expect(q4Start.getDate()).toBe(1);
    });
  });
});
