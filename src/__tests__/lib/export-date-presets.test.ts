/**
 * Export Date Preset Utilities Tests
 * Story 6.4: Custom Date Range - AC#7, AC#3
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getExportDateRange,
  validateDateRange,
  EXPORT_PRESETS,
  type ExportPresetType,
} from '@/lib/export-date-presets';
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  addDays,
} from 'date-fns';

describe('export-date-presets', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('EXPORT_PRESETS', () => {
    it('has 4 presets', () => {
      expect(EXPORT_PRESETS).toHaveLength(4);
    });

    it('contains correct preset types', () => {
      const types = EXPORT_PRESETS.map((p) => p.type);
      expect(types).toEqual(['thisMonth', 'lastMonth', 'thisQuarter', 'thisYear']);
    });

    it('has human-readable labels', () => {
      const labels = EXPORT_PRESETS.map((p) => p.label);
      expect(labels).toEqual(['This Month', 'Last Month', 'This Quarter', 'This Year']);
    });
  });

  describe('getExportDateRange', () => {
    it('thisMonth: returns 1st of current month to today', () => {
      const now = new Date();
      const range = getExportDateRange('thisMonth');
      expect(range.from).toEqual(startOfMonth(now));
      expect(range.to!.getFullYear()).toBe(now.getFullYear());
      expect(range.to!.getMonth()).toBe(now.getMonth());
      expect(range.to!.getDate()).toBe(now.getDate());
    });

    it('lastMonth: returns 1st to last day of previous month', () => {
      const now = new Date();
      const lastMonth = subMonths(now, 1);
      const range = getExportDateRange('lastMonth');
      expect(range.from).toEqual(startOfMonth(lastMonth));
      expect(range.to).toEqual(endOfMonth(lastMonth));
    });

    it('thisQuarter: returns 1st day of quarter to today', () => {
      const now = new Date();
      const range = getExportDateRange('thisQuarter');
      expect(range.from).toEqual(startOfQuarter(now));
      expect(range.to!.getFullYear()).toBe(now.getFullYear());
      expect(range.to!.getMonth()).toBe(now.getMonth());
      expect(range.to!.getDate()).toBe(now.getDate());
    });

    it('thisYear: returns Jan 1 to today', () => {
      const now = new Date();
      const range = getExportDateRange('thisYear');
      expect(range.from).toEqual(startOfYear(now));
      expect(range.to!.getFullYear()).toBe(now.getFullYear());
      expect(range.to!.getMonth()).toBe(now.getMonth());
      expect(range.to!.getDate()).toBe(now.getDate());
    });

    it('all presets return defined from and to', () => {
      const presetTypes: ExportPresetType[] = ['thisMonth', 'lastMonth', 'thisQuarter', 'thisYear'];
      for (const type of presetTypes) {
        const range = getExportDateRange(type);
        expect(range.from).toBeInstanceOf(Date);
        expect(range.to).toBeInstanceOf(Date);
      }
    });

    it('lastMonth from is before lastMonth to', () => {
      const range = getExportDateRange('lastMonth');
      expect(range.from!.getTime()).toBeLessThan(range.to!.getTime());
    });
  });

  describe('validateDateRange', () => {
    it('returns valid for incomplete range (no from)', () => {
      const result = validateDateRange({ to: new Date() });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns valid for incomplete range (no to)', () => {
      const result = validateDateRange({ from: new Date() });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns valid for range within 365 days', () => {
      const from = new Date(2026, 0, 1);
      const to = new Date(2026, 5, 30); // ~180 days
      const result = validateDateRange({ from, to });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns valid for exactly 365 days', () => {
      const from = new Date(2025, 0, 1);
      const to = addDays(from, 365);
      const result = validateDateRange({ from, to });
      expect(result.valid).toBe(true);
    });

    it('returns invalid for range exceeding 365 days', () => {
      const from = new Date(2025, 0, 1);
      const to = addDays(from, 366);
      const result = validateDateRange({ from, to });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Date range cannot exceed 1 year');
    });

    it('returns valid for same-day range', () => {
      const today = new Date();
      const result = validateDateRange({ from: today, to: today });
      expect(result.valid).toBe(true);
    });
  });
});
