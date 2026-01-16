/**
 * Trend Indicator Component
 * Story 3.5: Individual Performance Trend
 *
 * AC#6: Trend Indicator
 * - Shows ↑ Improving, ↓ Declining, → Stable
 * - Compares first half vs second half of period
 * - Color coding: Green (up), Red (down), Gray (stable)
 * - If first half avg is 0, treat as "Stable" (avoid division by zero)
 */
'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrendDirection, DailyMetric } from '@/types/sales';

// ===========================================
// Constants
// ===========================================

/**
 * Threshold for determining trend direction
 * >10% change = improving/declining, else stable
 */
const TREND_THRESHOLD_PERCENT = 10;

// ===========================================
// Trend Calculation
// ===========================================

/**
 * Calculate trend direction from daily data
 * Compares first half vs second half averages of closed metric
 *
 * @param data - Array of daily metrics
 * @returns TrendDirection - 'up', 'down', or 'stable'
 */
export function calculateTrendDirection(data: DailyMetric[]): TrendDirection {
  if (data.length < 2) {
    return 'stable';
  }

  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid);
  const secondHalf = data.slice(mid);

  // Calculate averages (using closed as primary KPI)
  const avgFirst =
    firstHalf.length > 0
      ? firstHalf.reduce((sum, d) => sum + d.closed, 0) / firstHalf.length
      : 0;
  const avgSecond =
    secondHalf.length > 0
      ? secondHalf.reduce((sum, d) => sum + d.closed, 0) / secondHalf.length
      : 0;

  // Guard: If first half avg is 0, return "up" if second half > 0, else "stable"
  if (avgFirst === 0) {
    return avgSecond > 0 ? 'up' : 'stable';
  }

  // Calculate percentage change
  const percentChange = ((avgSecond - avgFirst) / avgFirst) * 100;

  // Determine direction based on threshold
  if (percentChange > TREND_THRESHOLD_PERCENT) {
    return 'up';
  }
  if (percentChange < -TREND_THRESHOLD_PERCENT) {
    return 'down';
  }
  return 'stable';
}

// ===========================================
// Component
// ===========================================

interface TrendIndicatorProps {
  direction: TrendDirection;
  showLabel?: boolean;
  className?: string;
}

const TREND_CONFIG = {
  up: {
    icon: TrendingUp,
    label: 'Improving',
    colorClass: 'text-green-600',
    bgClass: 'bg-green-100',
  },
  down: {
    icon: TrendingDown,
    label: 'Declining',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-100',
  },
  stable: {
    icon: Minus,
    label: 'Stable',
    colorClass: 'text-gray-500',
    bgClass: 'bg-gray-100',
  },
} as const;

export function TrendIndicator({
  direction,
  showLabel = true,
  className,
}: TrendIndicatorProps) {
  const config = TREND_CONFIG[direction];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.bgClass,
        className
      )}
      data-testid="trend-indicator"
      aria-label={`Trend is ${config.label}`}
    >
      <Icon className={cn('h-3.5 w-3.5', config.colorClass)} aria-hidden="true" />
      {showLabel && (
        <span className={config.colorClass}>{config.label}</span>
      )}
    </span>
  );
}
