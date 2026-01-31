/**
 * Export Date Preset Utilities
 * Story 6.4: Custom Date Range
 *
 * Pure date calculation functions for export date presets.
 * AC#7: Preset date range calculations
 * AC#3: Max date range validation (1 year)
 */

import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  differenceInDays,
} from 'date-fns';
import type { DateRange } from 'react-day-picker';

export type ExportPresetType = 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear';

export interface ExportPreset {
  type: ExportPresetType;
  label: string;
}

export const EXPORT_PRESETS: ExportPreset[] = [
  { type: 'thisMonth', label: 'This Month' },
  { type: 'lastMonth', label: 'Last Month' },
  { type: 'thisQuarter', label: 'This Quarter' },
  { type: 'thisYear', label: 'This Year' },
];

/**
 * Calculate date range for a given preset
 * AC#7: Correct date range calculations
 * - "This Month": 1st of current month to today
 * - "Last Month": 1st of previous month to last day of previous month
 * - "This Quarter": 1st day of current quarter to today
 * - "This Year": Jan 1 of current year to today
 */
export function getExportDateRange(preset: ExportPresetType): DateRange {
  const now = new Date();
  switch (preset) {
    case 'thisMonth':
      return { from: startOfMonth(now), to: now };
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case 'thisQuarter':
      return { from: startOfQuarter(now), to: now };
    case 'thisYear':
      return { from: startOfYear(now), to: now };
  }
}

const MAX_RANGE_DAYS = 365;

/**
 * Validate a date range does not exceed 1 year
 * AC#3: Max Date Range Validation
 */
export function validateDateRange(range: DateRange): { valid: boolean; error?: string } {
  if (!range.from || !range.to) return { valid: true }; // incomplete range is OK
  const days = differenceInDays(range.to, range.from);
  if (days > MAX_RANGE_DAYS) {
    return { valid: false, error: 'Date range cannot exceed 1 year' };
  }
  return { valid: true };
}
