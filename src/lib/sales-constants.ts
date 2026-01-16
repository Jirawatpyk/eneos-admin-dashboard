/**
 * Sales Performance Constants
 * Story 3.2: Conversion Rate Analytics
 *
 * Centralized thresholds and configuration for sales performance metrics
 */

/**
 * Conversion rate thresholds for performance classification
 * - EXCELLENT (green): >= 30%
 * - ACCEPTABLE (amber): 10% - 29%
 * - NEEDS_IMPROVEMENT (red): < 10%
 */
export const CONVERSION_THRESHOLDS = {
  /** Target/excellent threshold - above this is green */
  EXCELLENT: 30,
  /** Below this needs improvement - shows red */
  NEEDS_IMPROVEMENT: 10,
} as const;

/**
 * Progress bar fill calculation
 * Max fill (100%) is reached at this conversion rate
 */
export const PROGRESS_BAR_MAX_RATE = 50;

/**
 * Get status text based on conversion rate threshold
 */
export function getConversionStatus(rate: number): 'above target' | 'acceptable' | 'needs improvement' | 'no data' {
  if (rate < 0) return 'no data';
  if (rate >= CONVERSION_THRESHOLDS.EXCELLENT) return 'above target';
  if (rate >= CONVERSION_THRESHOLDS.NEEDS_IMPROVEMENT) return 'acceptable';
  return 'needs improvement';
}

/**
 * Get color class based on conversion rate threshold
 */
export function getConversionColorClass(rate: number): string {
  if (rate < 0) return 'bg-gray-300';
  if (rate >= CONVERSION_THRESHOLDS.EXCELLENT) return 'bg-green-500';
  if (rate >= CONVERSION_THRESHOLDS.NEEDS_IMPROVEMENT) return 'bg-amber-500';
  return 'bg-red-500';
}
