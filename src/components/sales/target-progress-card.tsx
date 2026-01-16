/**
 * Target Progress Card Component
 * Story 3.7: Target vs Actual Comparison
 * Task 2: Target Progress Summary Card (AC#2)
 *
 * Displays team progress toward monthly target with:
 * - "X of Y target achieved" format
 * - Progress bar with color coding
 * - Period-adjusted targets
 */
'use client';

import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getTargets } from '@/config/sales-targets';
import {
  prorateTarget,
  getTargetStatus,
  formatTargetDifference,
  getProgressColor,
  getProgressBarColor,
  getPeriodLabel,
  getDaysInRange,
} from '@/lib/target-utils';

interface TargetProgressCardProps {
  /** Total closed deals from team */
  totalClosed: number;
  /** Number of team members */
  teamSize: number;
  /** Current filter period (week, month, quarter, etc.) */
  period: string;
  /** Custom date range (for 'custom' period) */
  dateRange?: { from: Date; to: Date };
}

/**
 * Target Progress Summary Card
 * Shows team progress toward monthly closed deals target
 */
export function TargetProgressCard({
  totalClosed,
  teamSize,
  period,
  dateRange,
}: TargetProgressCardProps) {
  // Get current targets configuration
  const targets = getTargets();

  // Calculate custom days if applicable
  const customDays =
    period === 'custom' && dateRange
      ? getDaysInRange(dateRange.from, dateRange.to)
      : undefined;

  // Calculate prorated target per person
  const proratedTargetPerPerson = prorateTarget(targets.closed, period, customDays);

  // Guard against division by zero (team size = 0)
  if (teamSize === 0) {
    return (
      <Card data-testid="target-progress-card-empty">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            Target Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No team members</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate team target (per-person × team size)
  const teamTarget = proratedTargetPerPerson * teamSize;

  // Get status and progress
  const { status, difference, percent } = getTargetStatus(totalClosed, teamTarget);
  const progressPercent = Math.min(percent, 100); // Cap progress bar at 100%

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className="cursor-help transition-shadow hover:shadow-md"
            data-testid="target-progress-card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Progress percentage and count */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn('text-2xl font-bold', getProgressColor(status))}
                    data-testid="target-progress-percent"
                  >
                    {Math.round(percent)}%
                  </span>
                  <span
                    className="text-sm text-muted-foreground"
                    data-testid="target-progress-count"
                  >
                    {totalClosed} of {Math.round(teamTarget)}
                  </span>
                </div>

                {/* Progress bar */}
                <Progress
                  value={progressPercent}
                  className={cn('h-2', getProgressBarColor(status))}
                  data-testid="target-progress-bar"
                />

                {/* Period label and status */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Closed deals this {getPeriodLabel(period)}
                  </p>
                  <span
                    className={cn('text-xs font-medium', getProgressColor(status))}
                    data-testid="target-status-indicator"
                  >
                    {formatTargetDifference(Math.round(difference))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>

        {/* Detailed tooltip (AC#8) */}
        <TooltipContent className="max-w-xs" data-testid="target-tooltip">
          <div className="space-y-1 text-xs">
            <div className="font-medium">Target Breakdown</div>
            <div className="grid grid-cols-2 gap-x-4">
              <span className="text-muted-foreground">Current:</span>
              <span>{totalClosed} closed</span>
              <span className="text-muted-foreground">Target:</span>
              <span>{Math.round(teamTarget)} ({Math.round(proratedTargetPerPerson)}/person)</span>
              <span className="text-muted-foreground">Progress:</span>
              <span>{Math.round(percent)}%</span>
              <span className="text-muted-foreground">Status:</span>
              <span className={getProgressColor(status)}>
                {status === 'above' ? 'Above target' : status === 'on' ? 'On track' : 'Below target'}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Skeleton loading state for Target Progress Card
 */
export function TargetProgressCardSkeleton() {
  return (
    <Card data-testid="target-progress-card-skeleton">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-2 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
