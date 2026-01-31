/**
 * Campaign Rate Benchmarks
 * Story 5.5: Open Rate & Click Rate Display (AC#3, AC#4)
 *
 * Rate performance benchmarks based on B2B email industry averages.
 * Source: Mailchimp/HubSpot industry reports (B2B averages: 15-25% open, 2-5% click)
 *
 * NOTE: These values can be adjusted based on ENEOS-specific campaign performance.
 * Future enhancement: Make configurable via admin settings or environment variables.
 */

// ===========================================
// Benchmark Constants (AC#3)
// ===========================================

/**
 * Rate benchmark thresholds for color-coding.
 * - excellent: Green (high performance)
 * - good: Yellow (average performance)
 * - below good: Red (needs improvement)
 */
export const RATE_BENCHMARKS = {
  openRate: {
    excellent: 25, // ≥25% = Green
    good: 15, // 15-24% = Yellow, <15% = Red
  },
  clickRate: {
    excellent: 5, // ≥5% = Green
    good: 2, // 2-4% = Yellow, <2% = Red
  },
} as const;

// ===========================================
// Types
// ===========================================

export type RateType = 'open' | 'click';
export type RateBenchmarkType = 'openRate' | 'clickRate';
export type RatePerformanceLevel = 'excellent' | 'good' | 'poor';

// ===========================================
// Classification Logic (AC#3)
// ===========================================

/**
 * Classify rate performance based on benchmark thresholds.
 *
 * @param value - The rate value (0-100)
 * @param type - 'openRate' or 'clickRate'
 * @returns Performance level: 'excellent' | 'good' | 'poor'
 *
 * @example
 * classifyRatePerformance(30, 'openRate') // => 'excellent'
 * classifyRatePerformance(20, 'openRate') // => 'good'
 * classifyRatePerformance(10, 'openRate') // => 'poor'
 */
export function classifyRatePerformance(
  value: number,
  type: RateBenchmarkType
): RatePerformanceLevel {
  const benchmark = RATE_BENCHMARKS[type];

  if (value >= benchmark.excellent) return 'excellent';
  if (value >= benchmark.good) return 'good';
  return 'poor';
}

/**
 * Map RateType to RateBenchmarkType
 */
export function getRateBenchmarkType(type: RateType): RateBenchmarkType {
  return type === 'open' ? 'openRate' : 'clickRate';
}

// ===========================================
// Tooltip Messages (AC#4)
// ===========================================

/**
 * Benchmark tooltip messages for user education.
 */
export const RATE_TOOLTIP_MESSAGES = {
  open: {
    benchmark: 'Industry avg: 20-25% for B2B emails',
    excellent: 'Above average - great engagement!',
    good: 'Within industry average',
    poor: 'Below average - consider improving subject lines',
  },
  click: {
    benchmark: 'Industry avg: 2-5% for B2B emails',
    excellent: 'Above average - compelling CTAs!',
    good: 'Within industry average',
    poor: 'Below average - review call-to-action buttons',
  },
} as const;

/**
 * Get tooltip message for a rate value.
 */
export function getRateTooltipMessage(
  value: number,
  type: RateType
): { benchmark: string; status: string } {
  const benchmarkType = getRateBenchmarkType(type);
  const level = classifyRatePerformance(value, benchmarkType);
  const messages = RATE_TOOLTIP_MESSAGES[type];

  return {
    benchmark: messages.benchmark,
    status: messages[level],
  };
}

// ===========================================
// Performance Config (for UI styling)
// ===========================================

/**
 * Performance level visual configuration.
 * Used by RatePerformanceBadge for consistent styling.
 */
export const PERFORMANCE_LEVEL_CONFIG = {
  excellent: {
    className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    label: 'Excellent',
    ariaLabel: 'excellent performance',
  },
  good: {
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    label: 'Average',
    ariaLabel: 'average performance',
  },
  poor: {
    className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    label: 'Needs Improvement',
    ariaLabel: 'below average performance',
  },
} as const;
