/**
 * Response Time Gauge Component
 * Story 3.4: Response Time Analytics
 *
 * AC#3: Response Time Gauge/Indicator
 * - Shows Green (< 30 min), Amber (30-60 min), Red (> 60 min)
 * - Indicates current team average position
 * AC#9: Responsive - readable at all sizes
 */
'use client';

import { cn } from '@/lib/utils';
import { getResponseTimeStatus } from '@/lib/format-sales';

/**
 * Multiplier for slow zone cap. The slow zone ends at
 * acceptableThreshold * SLOW_ZONE_MAX_MULTIPLIER (e.g., 60 * 1.5 = 90 min)
 */
const SLOW_ZONE_MAX_MULTIPLIER = 1.5;

interface ResponseTimeGaugeProps {
  /** Current team average response time in MINUTES */
  currentValue: number | null | undefined;
  /** Threshold for "fast" status (< this value = green) */
  fastThreshold: number;
  /** Threshold for "acceptable" status (< this value = amber, else red) */
  acceptableThreshold: number;
}

export function ResponseTimeGauge({
  currentValue,
  fastThreshold,
  acceptableThreshold,
}: ResponseTimeGaugeProps) {
  const status = getResponseTimeStatus(currentValue);

  // Calculate indicator position (0-100%)
  // Position the indicator on the appropriate zone
  const getIndicatorPosition = (): number => {
    if (currentValue == null || currentValue < 0) return 0;

    // Zone 1: 0-33% (fast zone: 0 to fastThreshold)
    if (currentValue < fastThreshold) {
      const progress = currentValue / fastThreshold;
      return progress * 33;
    }

    // Zone 2: 33-66% (acceptable zone: fastThreshold to acceptableThreshold)
    if (currentValue <= acceptableThreshold) {
      const progress = (currentValue - fastThreshold) / (acceptableThreshold - fastThreshold);
      return 33 + progress * 33;
    }

    // Zone 3: 66-100% (slow zone: > acceptableThreshold)
    // Cap at 90 minutes for 100% position (using SLOW_ZONE_MAX_MULTIPLIER)
    const maxSlowTime = acceptableThreshold * SLOW_ZONE_MAX_MULTIPLIER;
    const progress = Math.min(
      (currentValue - acceptableThreshold) / (maxSlowTime - acceptableThreshold),
      1
    );
    return 66 + progress * 34;
  };

  const indicatorPosition = getIndicatorPosition();

  return (
    <div
      className="relative"
      role="img"
      aria-label={`Response time gauge showing ${status || 'no data'} status`}
      data-testid="response-time-gauge"
    >
      {/* Gauge Bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
        {/* Green zone (0-33%) - Fast */}
        <div
          className={cn(
            'w-1/3 transition-opacity duration-200',
            status === 'fast' ? 'bg-green-500' : 'bg-green-500/30'
          )}
          aria-hidden="true"
        />
        {/* Amber zone (33-66%) - Acceptable */}
        <div
          className={cn(
            'w-1/3 transition-opacity duration-200',
            status === 'acceptable' ? 'bg-amber-500' : 'bg-amber-500/30'
          )}
          aria-hidden="true"
        />
        {/* Red zone (66-100%) - Slow */}
        <div
          className={cn(
            'w-1/3 transition-opacity duration-200',
            status === 'slow' ? 'bg-red-500' : 'bg-red-500/30'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Indicator needle */}
      {currentValue != null && currentValue >= 0 && (
        <div
          className="absolute -top-1 -translate-x-1/2 transition-all duration-300"
          style={{ left: `${indicatorPosition}%` }}
          data-testid="gauge-indicator"
        >
          <div
            className={cn(
              'w-3 h-3 rounded-full border-2 border-white shadow-sm',
              status === 'fast' && 'bg-green-500',
              status === 'acceptable' && 'bg-amber-500',
              status === 'slow' && 'bg-red-500'
            )}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Labels */}
      <div
        className="flex justify-between text-[10px] text-muted-foreground mt-1"
        aria-hidden="true"
      >
        <span>&lt;{fastThreshold}m</span>
        <span>{fastThreshold}-{acceptableThreshold}m</span>
        <span>&gt;{acceptableThreshold}m</span>
      </div>
    </div>
  );
}
