/**
 * Response Time Card Component
 * Story 3.4: Response Time Analytics
 *
 * AC#1: Response Time Summary Card
 * AC#2: Fastest Responder Highlight
 * AC#3: Response Time Gauge/Indicator
 * AC#5: Response Time Ranking (Top 3)
 * AC#6: Slow Responder Alert
 * AC#9: Responsive Design
 */
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatResponseTime,
  getResponseTimeStatus,
  getResponseTimeColor,
  RESPONSE_TIME_THRESHOLDS,
} from '@/lib/format-sales';
import { ResponseTimeGauge } from './response-time-gauge';
import type { SalesPersonMetrics } from '@/types/sales';

interface ResponseTimeCardProps {
  /** Team average response time in MINUTES */
  teamAverage: number | null | undefined;
  /** Array of sales person metrics */
  teamPerformance: SalesPersonMetrics[];
  /** Callback when a sales person is clicked to highlight in table */
  onHighlight?: (userId: string) => void;
  /** Callback when slow responders badge is clicked */
  onFilterSlow?: () => void;
}

export function ResponseTimeCard({
  teamAverage,
  teamPerformance,
  onHighlight,
  onFilterSlow,
}: ResponseTimeCardProps) {
  const status = getResponseTimeStatus(teamAverage);

  // AC#6: Count sales with avgResponseTime > 60 minutes (exactly 60 is acceptable, not slow)
  const slowCount = useMemo(() => {
    return teamPerformance.filter(
      (p) => p.avgResponseTime != null && p.avgResponseTime > RESPONSE_TIME_THRESHOLDS.ACCEPTABLE
    ).length;
  }, [teamPerformance]);

  // AC#2, AC#5: Get top 3 fastest responders
  const topResponders = useMemo(() => {
    const validResponders = teamPerformance.filter(
      (p) => p.avgResponseTime != null && p.avgResponseTime > 0
    );

    // Sort by avgResponseTime ascending (fastest first)
    // AC#2: Handle ties - first alphabetically by name
    // Use spread to avoid mutating the original array
    const sorted = [...validResponders].sort((a, b) => {
      const timeDiff = a.avgResponseTime - b.avgResponseTime;
      if (timeDiff !== 0) return timeDiff;
      return a.name.localeCompare(b.name);
    });

    return sorted.slice(0, 3);
  }, [teamPerformance]);

  const fastestResponder = topResponders[0] || null;

  return (
    <Card data-testid="response-time-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden="true" />
            Response Time
          </span>
          {/* AC#6: Slow Responder Alert Badge */}
          {slowCount > 0 ? (
            <Badge
              variant="destructive"
              className="cursor-pointer hover:bg-destructive/80 transition-colors"
              onClick={onFilterSlow}
              data-testid="slow-responders-badge"
              role="button"
              aria-label={`${slowCount} slow responders. Click to filter.`}
            >
              <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
              {slowCount} slow
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
              data-testid="all-on-track-badge"
            >
              All on track!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AC#1: Team Average Display */}
        <div>
          <div
            className={cn('text-2xl font-bold', getResponseTimeColor(status))}
            data-testid="team-average-time"
          >
            {formatResponseTime(teamAverage)}
          </div>
          <p className="text-xs text-muted-foreground">
            Team Average • Target: &lt; {RESPONSE_TIME_THRESHOLDS.FAST} min
          </p>
        </div>

        {/* AC#3: Visual Gauge */}
        <ResponseTimeGauge
          currentValue={teamAverage}
          fastThreshold={RESPONSE_TIME_THRESHOLDS.FAST}
          acceptableThreshold={RESPONSE_TIME_THRESHOLDS.ACCEPTABLE}
        />

        {/* AC#5: Top 3 Fastest Responders */}
        {topResponders.length > 0 && (
          <div className="space-y-2" data-testid="top-responders">
            <p className="text-xs font-medium text-muted-foreground">
              Fastest Responders
            </p>
            <div className="space-y-1">
              {topResponders.map((person, index) => (
                <RankingItem
                  key={person.userId}
                  rank={(index + 1) as 1 | 2 | 3}
                  name={person.name}
                  time={person.avgResponseTime}
                  onClick={() => onHighlight?.(person.userId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* AC#8: No data fallback */}
        {topResponders.length === 0 && (
          <p
            className="text-sm text-muted-foreground text-center py-2"
            data-testid="no-response-data"
          >
            No response time data available
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ===========================================
// Ranking Item Sub-component
// ===========================================

/**
 * RankingItem - Displays a single entry in the top 3 fastest responders list
 *
 * Shows the rank medal emoji, person's name, and their response time.
 * Clicking on the item triggers the onHighlight callback.
 */
interface RankingItemProps {
  /** Position in ranking (1, 2, or 3) */
  rank: 1 | 2 | 3;
  /** Name of the sales person */
  name: string;
  /** Response time in minutes */
  time: number;
  /** Callback when the item is clicked */
  onClick?: () => void;
}

const RANK_ICONS = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function RankingItem({ rank, name, time, onClick }: RankingItemProps) {
  const status = getResponseTimeStatus(time);

  return (
    <button
      className={cn(
        'flex items-center gap-2 w-full text-sm rounded-md p-1.5 -ml-1.5',
        'hover:bg-muted/50 transition-colors cursor-pointer text-left',
        rank === 1 && 'font-medium'
      )}
      onClick={onClick}
      data-testid={`ranking-item-${rank}`}
    >
      <span className="text-base" aria-label={`Rank ${rank}`}>
        {RANK_ICONS[rank]}
      </span>
      <span className="flex-1 truncate">{name}</span>
      <span className={cn('text-right tabular-nums', getResponseTimeColor(status))}>
        {formatResponseTime(time)}
      </span>
    </button>
  );
}
