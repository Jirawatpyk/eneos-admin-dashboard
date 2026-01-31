/**
 * Report Date Utilities Tests
 * Story 6.3: Quick Reports - Task 6
 *
 * Tests for date range calculation, label formatting, and response time formatting
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getReportDateRange,
  formatReportDateLabel,
  type ReportType,
} from '@/lib/report-date-utils';

describe('report-date-utils', () => {
  beforeEach(() => {
    // Fix date to 2026-01-31 (Saturday) for deterministic tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 31, 14, 30, 0)); // Jan 31, 2026 14:30
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getReportDateRange', () => {
    it('should return today range for daily type', () => {
      const range = getReportDateRange('daily');
      expect(range.from).toBeDefined();
      expect(range.to).toBeDefined();
      expect(range.from!.getFullYear()).toBe(2026);
      expect(range.from!.getMonth()).toBe(0); // January
      expect(range.from!.getDate()).toBe(31);
      expect(range.from!.getHours()).toBe(0);
      expect(range.from!.getMinutes()).toBe(0);
      expect(range.to!.getHours()).toBe(23);
      expect(range.to!.getMinutes()).toBe(59);
    });

    it('should return current week range for weekly type (Monday start)', () => {
      const range = getReportDateRange('weekly');
      expect(range.from).toBeDefined();
      expect(range.to).toBeDefined();
      // Jan 31 2026 is Saturday, so Monday = Jan 26
      expect(range.from!.getDate()).toBe(26);
      expect(range.from!.getMonth()).toBe(0);
      // to should be current date
      expect(range.to!.getDate()).toBe(31);
    });

    it('should return current month range for monthly type', () => {
      const range = getReportDateRange('monthly');
      expect(range.from).toBeDefined();
      expect(range.to).toBeDefined();
      // Start of January
      expect(range.from!.getDate()).toBe(1);
      expect(range.from!.getMonth()).toBe(0);
      // to should be current date
      expect(range.to!.getDate()).toBe(31);
    });

    it('should handle all ReportType values', () => {
      const types: ReportType[] = ['daily', 'weekly', 'monthly'];
      types.forEach((type) => {
        const range = getReportDateRange(type);
        expect(range.from).toBeDefined();
        expect(range.to).toBeDefined();
      });
    });
  });

  describe('formatReportDateLabel', () => {
    it('should format daily label as "MMM d, yyyy"', () => {
      const label = formatReportDateLabel('daily');
      expect(label).toBe('Jan 31, 2026');
    });

    it('should format weekly label as date range', () => {
      const label = formatReportDateLabel('weekly');
      expect(label).toBe('Jan 26 - Jan 31, 2026');
    });

    it('should format monthly label as "MMMM yyyy"', () => {
      const label = formatReportDateLabel('monthly');
      expect(label).toBe('January 2026');
    });
  });

});
