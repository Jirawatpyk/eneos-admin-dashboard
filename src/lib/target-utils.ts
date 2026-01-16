/**
 * Target Calculation Utilities
 * Story 3.7: Target vs Actual Comparison
 * Task 3: Period Proration Logic (AC#6)
 * Task 6: Above/Below Target Indicator (AC#7)
 */

import { getDaysInMonth } from 'date-fns';

/**
 * Threshold constants for target status calculation
 * Used in getTargetStatus() to determine above/on/below status
 */
const TARGET_THRESHOLD_ABOVE = 100; // >= 100% = "above" (green)
const TARGET_THRESHOLD_ON_TRACK = 70; // >= 70% = "on track" (amber), < 70% = "below" (red)

/**
 * Target status type
 */
export type TargetStatusType = 'above' | 'on' | 'below';

/**
 * Target status result
 */
export interface TargetStatusResult {
  status: TargetStatusType;
  difference: number;
  percent: number;
}

/**
 * Prorate monthly target based on selected period
 * Story 3.7 AC#6: Period-Adjusted Targets
 *
 * @param monthlyTarget - The full monthly target (e.g., 15 closed deals per person per month)
 * @param period - The selected period (week, month, quarter, lastQuarter, custom)
 * @param customDays - Number of days for custom date range (optional).
 *                     Use `getDaysInRange(from, to)` to calculate this value.
 *                     Only used when period is 'custom'. Falls back to monthlyTarget if 0 or undefined.
 * @returns Prorated target for the period
 *
 * @example
 * // Weekly target (7 days of a 31-day month)
 * prorateTarget(15, 'week') // ~3.39
 *
 * @example
 * // Quarterly target (3 months)
 * prorateTarget(15, 'quarter') // 45
 *
 * @example
 * // Custom 10-day range (10/30 of monthly target)
 * const days = getDaysInRange(startDate, endDate); // e.g., 10
 * prorateTarget(15, 'custom', days) // 5
 */
export function prorateTarget(
  monthlyTarget: number,
  period: string,
  customDays?: number
): number {
  const now = new Date();
  const daysInMonth = getDaysInMonth(now);

  switch (period) {
    case 'week':
      // Prorate to fixed 7 days (not actual days elapsed)
      return (monthlyTarget * 7) / daysInMonth;

    case 'month':
      return monthlyTarget;

    case 'quarter':
    case 'lastQuarter':
      return monthlyTarget * 3;

    case 'custom':
      // Prorate based on custom days / 30 (standard month)
      // If no days specified or 0, fall back to monthly target
      if (!customDays || customDays === 0) {
        return monthlyTarget;
      }
      return (monthlyTarget * customDays) / 30;

    default:
      // Unknown period - return monthly as default
      return monthlyTarget;
  }
}

/**
 * Calculate target status (above/on/below)
 * Story 3.7 AC#3, AC#7: Color coding and above/below indicator
 *
 * Thresholds:
 * - >= 100% = above (green)
 * - 70-99% = on track (amber)
 * - < 70% = below (red)
 *
 * @param actual - The actual value achieved
 * @param target - The target value
 * @returns Status object with status, difference, and percent
 *
 * @example
 * getTargetStatus(12, 15) // { status: 'on', difference: -3, percent: 80 }
 * getTargetStatus(20, 15) // { status: 'above', difference: 5, percent: 133.33 }
 */
export function getTargetStatus(actual: number, target: number): TargetStatusResult {
  // Edge case: target = 0, consider as achieved (avoid division by zero)
  if (target === 0) {
    return {
      status: 'above',
      difference: actual,
      percent: 100,
    };
  }

  const percent = (actual / target) * 100;
  const difference = actual - target;

  // Determine status based on percentage thresholds (see constants at top of file)
  let status: TargetStatusType;
  if (percent >= TARGET_THRESHOLD_ABOVE) {
    status = 'above';
  } else if (percent >= TARGET_THRESHOLD_ON_TRACK) {
    status = 'on';
  } else {
    status = 'below';
  }

  return {
    status,
    difference,
    percent,
  };
}

/**
 * Format target difference for display
 * Story 3.7 AC#7: Above/Below Target Indicator
 *
 * @param difference - The difference between actual and target
 * @returns Formatted string like "+3 above target" or "-2 below target"
 *
 * @example
 * formatTargetDifference(3) // "+3 above target"
 * formatTargetDifference(-2) // "-2 below target"
 * formatTargetDifference(0) // "On target"
 */
export function formatTargetDifference(difference: number): string {
  if (difference > 0) {
    return `+${difference} above target`;
  }
  if (difference < 0) {
    return `${difference} below target`;
  }
  return 'On target';
}

/**
 * Get color class based on target status
 * Story 3.7 AC#3, AC#4: Color coding
 *
 * @param status - The target status ('above' | 'on' | 'below')
 * @returns Tailwind color class string
 */
export function getProgressColor(status: TargetStatusType): string {
  switch (status) {
    case 'above':
      return 'text-green-600';
    case 'on':
      return 'text-amber-600';
    case 'below':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Get progress bar color class based on status
 * Used for styling the Progress component
 *
 * @param status - The target status
 * @returns Tailwind class for progress bar color
 */
export function getProgressBarColor(status: TargetStatusType): string {
  switch (status) {
    case 'above':
      return '[&>div]:bg-green-500';
    case 'on':
      return '[&>div]:bg-amber-500';
    case 'below':
      return '[&>div]:bg-red-500';
    default:
      return '';
  }
}

/**
 * Get period label for display
 *
 * @param period - The period value
 * @returns Human-readable period label
 */
export function getPeriodLabel(period: string): string {
  switch (period) {
    case 'week':
      return 'week';
    case 'month':
      return 'month';
    case 'quarter':
    case 'lastQuarter':
      return 'quarter';
    case 'custom':
      return 'period';
    default:
      return 'period';
  }
}

/**
 * Calculate the number of days between two dates
 * Used for custom date range proration
 *
 * @param from - Start date
 * @param to - End date
 * @returns Number of days in range (inclusive)
 */
export function getDaysInRange(from: Date, to: Date): number {
  const diffTime = Math.abs(to.getTime() - from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Inclusive of both start and end date
}
