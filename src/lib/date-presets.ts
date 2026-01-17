/**
 * Date Presets Utility
 * Story 4.6: Filter by Date - AC#3
 *
 * Provides date range calculations for filter presets.
 * Uses date-fns v3 for date manipulation (named imports).
 *
 * References:
 * - [Source: project-context.md] - date-fns ^3.2.0
 */

import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  isSameDay,
  isSameYear,
} from 'date-fns';

/**
 * Date preset options for filter dropdown
 */
export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

/**
 * Date range object with from and to dates
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Preset option for display in dropdown
 */
export interface DatePresetOption {
  value: DatePreset;
  label: string;
}

/**
 * All available date preset options for filter dropdown
 * AC#2: 7 preset options as specified
 */
export const DATE_PRESET_OPTIONS: DatePresetOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

/**
 * Calculate date range for a given preset
 * AC#3: Calculate correct date ranges for each preset
 *
 * @param preset - The preset to calculate range for
 * @returns DateRange or null for custom/invalid presets
 */
export function getPresetDateRange(preset: DatePreset): DateRange | null {
  const now = new Date();

  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };

    case 'yesterday': {
      const yesterday = subDays(now, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    }

    case 'last7days':
      // Last 7 days including today (today - 6 days)
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };

    case 'last30days':
      // Last 30 days including today (today - 29 days)
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };

    case 'thisMonth':
      return { from: startOfMonth(now), to: endOfMonth(now) };

    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }

    case 'custom':
      // Custom is handled separately by the date picker
      return null;

    default:
      return null;
  }
}

/**
 * Format date range for display in filter button
 * AC#3: Button label updates to show date range
 *
 * @param range - Date range to format, or null for "All Time"
 * @returns Formatted label string
 */
export function formatDateRangeLabel(range: DateRange | null): string {
  if (!range) {
    return 'All Time';
  }

  const { from, to } = range;

  // Same day: "Jan 15, 2026"
  if (isSameDay(from, to)) {
    return format(from, 'MMM d, yyyy');
  }

  // Same year: "Jan 9 - Jan 15, 2026"
  if (isSameYear(from, to)) {
    return `${format(from, 'MMM d')} - ${format(to, 'MMM d, yyyy')}`;
  }

  // Different years: "Dec 17, 2025 - Jan 15, 2026"
  return `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`;
}

/**
 * Format date for API query parameter
 * AC#3: URL format YYYY-MM-DD
 *
 * @param date - Date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
