/**
 * Date Presets Tests
 * Story 4.6: Filter by Date - AC#3
 *
 * Tests for:
 * - Date preset calculations (today, yesterday, last 7 days, etc.)
 * - Date range formatting for display
 * - Date formatting for API
 *
 * @note Uses vi.useFakeTimers per pattern 3.3 from test-pattern-library.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import module under test
import {
  getPresetDateRange,
  formatDateRangeLabel,
  formatDateForApi,
  DATE_PRESET_OPTIONS,
  type DatePreset,
  type DateRange,
} from '@/lib/date-presets';

// Fixed test date: January 15, 2026 at 10:00 AM local time
const TEST_DATE = new Date(2026, 0, 15, 10, 0, 0);

describe('date-presets', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(TEST_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('DATE_PRESET_OPTIONS', () => {
    it('contains all expected presets', () => {
      const presetValues = DATE_PRESET_OPTIONS.map((o) => o.value);

      expect(presetValues).toContain('today');
      expect(presetValues).toContain('yesterday');
      expect(presetValues).toContain('last7days');
      expect(presetValues).toContain('last30days');
      expect(presetValues).toContain('thisMonth');
      expect(presetValues).toContain('lastMonth');
      expect(presetValues).toContain('custom');
    });

    it('has labels for all presets', () => {
      DATE_PRESET_OPTIONS.forEach((option) => {
        expect(option.label).toBeTruthy();
        expect(typeof option.label).toBe('string');
      });
    });
  });

  describe('getPresetDateRange', () => {
    describe('today preset', () => {
      it('returns start of today to end of today', () => {
        const range = getPresetDateRange('today');

        expect(range).not.toBeNull();
        // January 15, 2026 00:00:00
        expect(range!.from.getFullYear()).toBe(2026);
        expect(range!.from.getMonth()).toBe(0); // January
        expect(range!.from.getDate()).toBe(15);
        expect(range!.from.getHours()).toBe(0);
        expect(range!.from.getMinutes()).toBe(0);

        // January 15, 2026 23:59:59.999
        expect(range!.to.getFullYear()).toBe(2026);
        expect(range!.to.getMonth()).toBe(0);
        expect(range!.to.getDate()).toBe(15);
        expect(range!.to.getHours()).toBe(23);
        expect(range!.to.getMinutes()).toBe(59);
      });
    });

    describe('yesterday preset', () => {
      it('returns start of yesterday to end of yesterday', () => {
        const range = getPresetDateRange('yesterday');

        expect(range).not.toBeNull();
        // January 14, 2026
        expect(range!.from.getDate()).toBe(14);
        expect(range!.to.getDate()).toBe(14);
        expect(range!.from.getHours()).toBe(0);
        expect(range!.to.getHours()).toBe(23);
      });
    });

    describe('last7days preset', () => {
      it('returns 7 days back including today (Jan 9-15)', () => {
        const range = getPresetDateRange('last7days');

        expect(range).not.toBeNull();
        // January 9, 2026 (6 days before Jan 15)
        expect(range!.from.getDate()).toBe(9);
        expect(range!.from.getMonth()).toBe(0);

        // January 15, 2026 (today)
        expect(range!.to.getDate()).toBe(15);
        expect(range!.to.getMonth()).toBe(0);
      });
    });

    describe('last30days preset', () => {
      it('returns 30 days back including today (Dec 17 - Jan 15)', () => {
        const range = getPresetDateRange('last30days');

        expect(range).not.toBeNull();
        // December 17, 2025 (29 days before Jan 15, 2026)
        expect(range!.from.getDate()).toBe(17);
        expect(range!.from.getMonth()).toBe(11); // December
        expect(range!.from.getFullYear()).toBe(2025);

        // January 15, 2026
        expect(range!.to.getDate()).toBe(15);
        expect(range!.to.getMonth()).toBe(0);
        expect(range!.to.getFullYear()).toBe(2026);
      });
    });

    describe('thisMonth preset', () => {
      it('returns start of current month to end of current month', () => {
        const range = getPresetDateRange('thisMonth');

        expect(range).not.toBeNull();
        // January 1, 2026
        expect(range!.from.getDate()).toBe(1);
        expect(range!.from.getMonth()).toBe(0);

        // January 31, 2026
        expect(range!.to.getDate()).toBe(31);
        expect(range!.to.getMonth()).toBe(0);
      });
    });

    describe('lastMonth preset', () => {
      it('returns start of last month to end of last month', () => {
        const range = getPresetDateRange('lastMonth');

        expect(range).not.toBeNull();
        // December 1, 2025
        expect(range!.from.getDate()).toBe(1);
        expect(range!.from.getMonth()).toBe(11); // December
        expect(range!.from.getFullYear()).toBe(2025);

        // December 31, 2025
        expect(range!.to.getDate()).toBe(31);
        expect(range!.to.getMonth()).toBe(11);
        expect(range!.to.getFullYear()).toBe(2025);
      });
    });

    describe('custom preset', () => {
      it('returns null (handled separately by custom date picker)', () => {
        const range = getPresetDateRange('custom');

        expect(range).toBeNull();
      });
    });

    describe('invalid preset', () => {
      it('returns null for unknown preset', () => {
        const range = getPresetDateRange('unknown' as DatePreset);

        expect(range).toBeNull();
      });
    });
  });

  describe('formatDateRangeLabel', () => {
    it('formats null range as "All Time"', () => {
      const label = formatDateRangeLabel(null);

      expect(label).toBe('All Time');
    });

    it('formats same day range correctly', () => {
      const range: DateRange = {
        from: new Date(2026, 0, 15, 0, 0, 0),
        to: new Date(2026, 0, 15, 23, 59, 59),
      };

      const label = formatDateRangeLabel(range);

      // Single day format: "Jan 15, 2026"
      expect(label).toBe('Jan 15, 2026');
    });

    it('formats range within same year', () => {
      const range: DateRange = {
        from: new Date(2026, 0, 9, 0, 0, 0),
        to: new Date(2026, 0, 15, 23, 59, 59),
      };

      const label = formatDateRangeLabel(range);

      // Same year: "Jan 9 - Jan 15, 2026"
      expect(label).toBe('Jan 9 - Jan 15, 2026');
    });

    it('formats range across years', () => {
      const range: DateRange = {
        from: new Date(2025, 11, 17, 0, 0, 0), // Dec 17, 2025
        to: new Date(2026, 0, 15, 23, 59, 59), // Jan 15, 2026
      };

      const label = formatDateRangeLabel(range);

      // Different years: "Dec 17, 2025 - Jan 15, 2026"
      expect(label).toBe('Dec 17, 2025 - Jan 15, 2026');
    });
  });

  describe('formatDateForApi', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2026, 0, 15);

      const formatted = formatDateForApi(date);

      expect(formatted).toBe('2026-01-15');
    });

    it('pads single digit months and days', () => {
      const date = new Date(2026, 0, 5); // January 5

      const formatted = formatDateForApi(date);

      expect(formatted).toBe('2026-01-05');
    });

    it('handles December correctly', () => {
      const date = new Date(2025, 11, 31); // December 31

      const formatted = formatDateForApi(date);

      expect(formatted).toBe('2025-12-31');
    });

    it('returns empty string for invalid Date', () => {
      const invalidDate = new Date('invalid');

      const formatted = formatDateForApi(invalidDate);

      expect(formatted).toBe('');
    });

    it('returns empty string for null-ish values', () => {
      // @ts-expect-error - testing invalid input
      const formatted = formatDateForApi(null);

      expect(formatted).toBe('');
    });
  });
});
