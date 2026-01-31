/**
 * Rate Performance Badge Component
 * Story 5.5: Open Rate & Click Rate Display
 *
 * AC#3: Color-coded performance indicators
 * AC#4: Benchmark tooltips
 * AC#7: Empty rate handling
 *
 * Accessibility (WCAG 2.1):
 * - Color is NOT the sole indicator (includes icon + text)
 * - Screen reader text via sr-only class
 * - Focusable tooltip trigger
 */
'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  classifyRatePerformance,
  getRateBenchmarkType,
  getRateTooltipMessage,
  PERFORMANCE_LEVEL_CONFIG,
  type RateType,
  type RatePerformanceLevel,
} from '@/lib/campaign-benchmarks';

// ===========================================
// Types
// ===========================================

export interface RatePerformanceBadgeProps {
  /** The rate value (0-100) */
  value: number;
  /** Type of rate: 'open' or 'click' */
  type: RateType;
  /** Delivered count for empty state handling (AC#7) */
  delivered?: number;
  /** Additional CSS classes */
  className?: string;
}

// ===========================================
// Icon Configuration
// ===========================================

const LEVEL_ICONS: Record<RatePerformanceLevel, React.ComponentType<{ className?: string }>> = {
  excellent: TrendingUp,
  good: Minus,
  poor: TrendingDown,
};

// ===========================================
// Component
// ===========================================

/**
 * RatePerformanceBadge - Displays rate with color-coded performance indicator.
 *
 * @example
 * <RatePerformanceBadge value={30} type="open" delivered={100} />
 * <RatePerformanceBadge value={3.5} type="click" delivered={200} />
 */
export function RatePerformanceBadge({
  value,
  type,
  delivered,
  className,
}: RatePerformanceBadgeProps) {
  // AC#7: Handle edge case - no deliveries
  if (delivered === 0 || (delivered !== undefined && delivered < 1)) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="tabular-nums text-muted-foreground cursor-help"
            data-testid={`rate-badge-${type}-empty`}
          >
            -
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>No deliveries yet</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // AC#7: Handle edge case - NaN or undefined/null values
  if (value === undefined || value === null || Number.isNaN(value)) {
    return (
      <span
        className="tabular-nums text-muted-foreground"
        data-testid={`rate-badge-${type}-invalid`}
      >
        -
      </span>
    );
  }

  // Clamp display value to 0-100 range (guard against backend anomalies)
  const displayValue = Math.min(Math.max(value, 0), 100);

  // Classify performance (AC#3)
  const benchmarkType = getRateBenchmarkType(type);
  const level = classifyRatePerformance(displayValue, benchmarkType);
  const config = PERFORMANCE_LEVEL_CONFIG[level];
  const Icon = LEVEL_ICONS[level];
  const { benchmark, status } = getRateTooltipMessage(displayValue, type);

  const rateLabel = type === 'open' ? 'Open Rate' : 'Click Rate';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="secondary"
          className={cn(
            'flex items-center gap-1 font-medium cursor-help',
            config.className,
            className
          )}
          data-testid={`rate-badge-${type}`}
          data-level={level}
        >
          <Icon className="h-3 w-3" aria-hidden="true" />
          <span className="tabular-nums">{displayValue.toFixed(1)}%</span>
          {/* Screen reader text for accessibility (WCAG 1.4.1) */}
          <span className="sr-only">{config.label}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs bg-popover text-popover-foreground"
      >
        <div className="space-y-1">
          <p className="font-medium">
            {rateLabel}: {displayValue.toFixed(1)}%
          </p>
          <p className="text-xs opacity-80">{benchmark}</p>
          <p className="text-xs">{status}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
