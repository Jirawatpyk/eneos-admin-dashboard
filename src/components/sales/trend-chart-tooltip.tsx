/**
 * Trend Chart Tooltip Component
 * Story 3.5: Individual Performance Trend
 *
 * AC#5: Data Points and Tooltip
 * - Shows date
 * - Shows metric name and value
 * - Shows comparison to team average: "+3 above avg" (green) or "-2 below avg" (red)
 * - "= avg" shown in gray when equal to team average
 */
'use client';

import type { DailyMetric } from '@/types/sales';
import { cn } from '@/lib/utils';

// ===========================================
// Types
// ===========================================

interface TooltipPayloadEntry {
  value: number;
  dataKey: string;
  color: string;
  name: string;
}

interface TrendChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  teamAverage?: DailyMetric[];
}

// ===========================================
// Constants
// ===========================================

const METRIC_LABELS: Record<string, string> = {
  claimed: 'Claimed',
  closed: 'Closed',
  teamAvgClosed: 'Team Avg',
};

// ===========================================
// Helper Functions
// ===========================================

/**
 * Format comparison to team average
 */
function formatComparison(
  value: number,
  teamAvgValue: number
): { text: string; colorClass: string } {
  const diff = value - teamAvgValue;

  if (diff > 0) {
    return {
      text: `+${diff} above avg`,
      colorClass: 'text-green-600',
    };
  }
  if (diff < 0) {
    return {
      text: `${diff} below avg`,
      colorClass: 'text-red-600',
    };
  }
  return {
    text: '= avg',
    colorClass: 'text-gray-500',
  };
}

/**
 * Find team average for a specific date
 */
function findTeamAvgForDate(
  date: string,
  teamAverage: DailyMetric[]
): DailyMetric | undefined {
  return teamAverage.find((d) => d.date === date);
}

// ===========================================
// Component
// ===========================================

export function TrendChartTooltip({
  active,
  payload,
  label,
  teamAverage = [],
}: TrendChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Find team average for comparison
  const teamAvgData = findTeamAvgForDate(label || '', teamAverage);

  return (
    <div
      className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[160px]"
      data-testid="trend-chart-tooltip"
    >
      {/* Date header */}
      <p className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-2">
        {label}
      </p>

      {/* Metric values */}
      {payload.map((entry, index) => {
        const isTeamAvg = entry.dataKey === 'teamAvgClosed';
        const metricLabel = METRIC_LABELS[entry.dataKey] || entry.name;

        // Get comparison for non-team-avg metrics (both claimed and closed)
        let comparison: { text: string; colorClass: string } | null = null;
        if (!isTeamAvg && teamAvgData) {
          if (entry.dataKey === 'closed') {
            comparison = formatComparison(entry.value, teamAvgData.closed);
          } else if (entry.dataKey === 'claimed') {
            comparison = formatComparison(entry.value, teamAvgData.claimed);
          }
        }

        return (
          <div key={index} className="py-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-block w-2.5 h-2.5 rounded-full',
                    isTeamAvg && 'opacity-50'
                  )}
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {metricLabel}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {entry.value}
              </span>
            </div>
            {/* Comparison to team average */}
            {comparison && (
              <p className={cn('text-xs ml-5 mt-0.5', comparison.colorClass)}>
                {comparison.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
