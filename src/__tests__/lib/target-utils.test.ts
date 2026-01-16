/**
 * Target Utils Tests
 * Story 3.7: Target vs Actual Comparison
 * Task 3: Period Proration Logic (AC#6)
 * Task 6: Above/Below Target Indicator (AC#7)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  prorateTarget,
  getTargetStatus,
  formatTargetDifference,
  getProgressColor,
  getProgressBarColor,
  getPeriodLabel,
  getDaysInRange,
} from '@/lib/target-utils';

describe('Target Utils', () => {
  describe('prorateTarget', () => {
    // Mock date to a month with 30 days for consistent testing
    beforeEach(() => {
      vi.useFakeTimers();
      // January 2026 has 31 days
      vi.setSystemTime(new Date('2026-01-15'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return full monthly target for "month" period', () => {
      const result = prorateTarget(15, 'month');
      expect(result).toBe(15);
    });

    it('should prorate weekly target using 7 days / days in month', () => {
      // January has 31 days, so 15 * (7/31) ≈ 3.387
      const result = prorateTarget(15, 'week');
      expect(result).toBeCloseTo(15 * (7 / 31), 2);
    });

    it('should multiply by 3 for "quarter" period', () => {
      const result = prorateTarget(15, 'quarter');
      expect(result).toBe(45);
    });

    it('should multiply by 3 for "lastQuarter" period', () => {
      const result = prorateTarget(15, 'lastQuarter');
      expect(result).toBe(45);
    });

    it('should prorate custom period based on days / 30', () => {
      // Custom range of 10 days: 15 * (10/30) = 5
      const result = prorateTarget(15, 'custom', 10);
      expect(result).toBe(5);
    });

    it('should return monthly target for custom period without days', () => {
      const result = prorateTarget(15, 'custom');
      expect(result).toBe(15);
    });

    it('should handle custom period with 0 days (edge case)', () => {
      const result = prorateTarget(15, 'custom', 0);
      expect(result).toBe(15); // Falls back to monthly
    });

    it('should return monthly target for unknown period', () => {
      const result = prorateTarget(15, 'unknown');
      expect(result).toBe(15);
    });

    it('should handle 0 monthly target', () => {
      const result = prorateTarget(0, 'month');
      expect(result).toBe(0);
    });
  });

  describe('getTargetStatus', () => {
    it('should return "above" when actual >= target', () => {
      const result = getTargetStatus(15, 15);
      expect(result.status).toBe('above');
      expect(result.percent).toBe(100);
    });

    it('should return "above" when actual exceeds target (200%)', () => {
      const result = getTargetStatus(30, 15);
      expect(result.status).toBe('above');
      expect(result.percent).toBe(200);
      expect(result.difference).toBe(15);
    });

    it('should return "on" when progress is 70-99%', () => {
      const result = getTargetStatus(12, 15); // 80%
      expect(result.status).toBe('on');
      expect(result.percent).toBe(80);
    });

    it('should return "on" at exactly 70% boundary', () => {
      const result = getTargetStatus(7, 10); // 70%
      expect(result.status).toBe('on');
    });

    it('should return "below" when progress < 70%', () => {
      const result = getTargetStatus(6, 10); // 60%
      expect(result.status).toBe('below');
    });

    it('should return "below" at 69% (just under threshold)', () => {
      const result = getTargetStatus(69, 100);
      expect(result.status).toBe('below');
    });

    it('should handle target = 0 (edge case)', () => {
      const result = getTargetStatus(5, 0);
      expect(result.status).toBe('above');
      expect(result.percent).toBe(100);
    });

    it('should handle actual = 0', () => {
      const result = getTargetStatus(0, 15);
      expect(result.status).toBe('below');
      expect(result.percent).toBe(0);
    });

    it('should calculate correct difference when above target', () => {
      const result = getTargetStatus(20, 15);
      expect(result.difference).toBe(5);
    });

    it('should calculate correct difference when below target', () => {
      const result = getTargetStatus(10, 15);
      expect(result.difference).toBe(-5);
    });

    it('should have difference of 0 when on target', () => {
      const result = getTargetStatus(15, 15);
      expect(result.difference).toBe(0);
    });
  });

  describe('formatTargetDifference', () => {
    it('should format positive difference as "+X above target"', () => {
      const result = formatTargetDifference(3);
      expect(result).toBe('+3 above target');
    });

    it('should format negative difference as "X below target"', () => {
      const result = formatTargetDifference(-2);
      expect(result).toBe('-2 below target');
    });

    it('should format 0 difference as "On target"', () => {
      const result = formatTargetDifference(0);
      expect(result).toBe('On target');
    });

    it('should handle large positive numbers', () => {
      const result = formatTargetDifference(100);
      expect(result).toBe('+100 above target');
    });

    it('should handle large negative numbers', () => {
      const result = formatTargetDifference(-50);
      expect(result).toBe('-50 below target');
    });
  });

  describe('getProgressColor', () => {
    it('should return green class for "above" status', () => {
      const result = getProgressColor('above');
      expect(result).toContain('green');
    });

    it('should return amber class for "on" status', () => {
      const result = getProgressColor('on');
      expect(result).toContain('amber');
    });

    it('should return red class for "below" status', () => {
      const result = getProgressColor('below');
      expect(result).toContain('red');
    });
  });

  describe('getProgressBarColor', () => {
    it('should return green progress bar class for "above" status', () => {
      const result = getProgressBarColor('above');
      expect(result).toContain('bg-green-500');
    });

    it('should return amber progress bar class for "on" status', () => {
      const result = getProgressBarColor('on');
      expect(result).toContain('bg-amber-500');
    });

    it('should return red progress bar class for "below" status', () => {
      const result = getProgressBarColor('below');
      expect(result).toContain('bg-red-500');
    });

    it('should return empty string for unknown status', () => {
      // @ts-expect-error - Testing invalid input
      const result = getProgressBarColor('unknown');
      expect(result).toBe('');
    });
  });

  describe('getPeriodLabel', () => {
    it('should return "week" for week period', () => {
      expect(getPeriodLabel('week')).toBe('week');
    });

    it('should return "month" for month period', () => {
      expect(getPeriodLabel('month')).toBe('month');
    });

    it('should return "quarter" for quarter period', () => {
      expect(getPeriodLabel('quarter')).toBe('quarter');
    });

    it('should return "quarter" for lastQuarter period', () => {
      expect(getPeriodLabel('lastQuarter')).toBe('quarter');
    });

    it('should return "period" for custom period', () => {
      expect(getPeriodLabel('custom')).toBe('period');
    });

    it('should return "period" for unknown period', () => {
      expect(getPeriodLabel('unknown')).toBe('period');
    });
  });

  describe('getDaysInRange', () => {
    it('should return 1 for same day range', () => {
      const date = new Date('2026-01-15');
      expect(getDaysInRange(date, date)).toBe(1);
    });

    it('should return correct days for week range (inclusive)', () => {
      const from = new Date('2026-01-01');
      const to = new Date('2026-01-07');
      expect(getDaysInRange(from, to)).toBe(7);
    });

    it('should return correct days for month range', () => {
      const from = new Date('2026-01-01');
      const to = new Date('2026-01-31');
      expect(getDaysInRange(from, to)).toBe(31);
    });

    it('should handle range crossing month boundary', () => {
      const from = new Date('2026-01-25');
      const to = new Date('2026-02-05');
      // Jan 25-31 = 7 days, Feb 1-5 = 5 days, total = 12 days
      expect(getDaysInRange(from, to)).toBe(12);
    });

    it('should work regardless of date order (uses absolute value)', () => {
      const from = new Date('2026-01-07');
      const to = new Date('2026-01-01');
      expect(getDaysInRange(from, to)).toBe(7);
    });

    it('should return 2 for adjacent days', () => {
      const from = new Date('2026-01-15');
      const to = new Date('2026-01-16');
      expect(getDaysInRange(from, to)).toBe(2);
    });
  });
});
