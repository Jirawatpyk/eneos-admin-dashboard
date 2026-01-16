/**
 * Sales Targets Configuration
 * Story 3.7: Target vs Actual Comparison
 * Task 1: Target Configuration (AC#1)
 *
 * MVP: Hardcoded defaults for per-person monthly targets
 * Future: Load from backend/localStorage for persistence
 */

/**
 * Sales Targets Interface
 * Defines monthly per-person targets for key metrics
 */
export interface SalesTargets {
  /** Monthly target for claimed leads per person */
  claimed: number;
  /** Monthly target for closed deals per person */
  closed: number;
  /** Target conversion rate percentage */
  conversionRate: number;
}

/**
 * Default Sales Targets (MVP Hardcoded)
 * Per-person monthly targets:
 * - claimed: 50 leads per person per month
 * - closed: 15 deals per person per month
 * - conversionRate: 30% target
 *
 * Team total = target × team size
 */
export const DEFAULT_TARGETS: SalesTargets = {
  claimed: 50,
  closed: 15,
  conversionRate: 30,
};

/**
 * Get current sales targets
 * MVP: Returns hardcoded defaults
 * Future: Will load from backend API or localStorage
 *
 * @returns SalesTargets - Current target configuration
 */
export function getTargets(): SalesTargets {
  // TODO: Load from backend API or localStorage for persistence
  // For MVP, return hardcoded defaults
  return DEFAULT_TARGETS;
}

/**
 * Target thresholds for color coding
 * - EXCELLENT: >= 100% = Green (target achieved)
 * - ON_TRACK: 70-99% = Amber (on track)
 * - NEEDS_WORK: < 70% = Red (needs attention)
 */
export const TARGET_THRESHOLDS = {
  EXCELLENT: 100,
  ON_TRACK: 70,
  NEEDS_WORK: 0,
} as const;
