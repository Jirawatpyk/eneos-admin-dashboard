/**
 * Target Progress Cell Component
 * Story 3.7: Target vs Actual Comparison
 * Task 4: Table Target Column (AC#3, AC#4)
 *
 * Shows mini progress bar with target comparison in table cell:
 * - Progress bar fills based on percentage of target achieved
 * - Color coding: Green (≥100%), Amber (70-99%), Red (<70%)
 * - Tooltip shows detailed breakdown
 */
'use client';

import { Check, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  getTargetStatus,
  formatTargetDifference,
  getProgressColor,
  getProgressBarColor,
} from '@/lib/target-utils';

interface TargetProgressCellProps {
  /** Actual value achieved */
  actual: number;
  /** Target value for this person */
  target: number;
  /** Whether to show achievement badge when target met (default: true) */
  showAchievementBadge?: boolean;
  /** Optional label for the metric (e.g., "closed", "claimed") */
  metricLabel?: string;
}

/**
 * Target Progress Cell for table
 * Shows actual value with mini progress bar and target comparison
 */
export function TargetProgressCell({
  actual,
  target,
  showAchievementBadge = true,
  metricLabel = 'closed',
}: TargetProgressCellProps) {
  const { status, difference, percent } = getTargetStatus(actual, target);
  const achieved = percent >= 100;

  // Cap progress bar at 100%
  const progressValue = Math.min(percent, 100);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-2 min-w-[140px] cursor-help"
            data-testid="target-progress-cell"
          >
            <div className="flex-1 min-w-0">
              {/* Actual value and badge */}
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium tabular-nums" data-testid="actual-value">
                  {actual}
                </span>
                {showAchievementBadge && achieved && (
                  <span
                    className="text-green-600"
                    data-testid="achievement-badge"
                    aria-label="Target achieved"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              {/* Mini progress bar */}
              <Progress
                value={progressValue}
                className={cn('h-1.5', getProgressBarColor(status))}
                data-testid="target-cell-progress-bar"
              />

              {/* Target label (subtle) */}
              <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-between">
                <span>of {Math.round(target)}</span>
                <span className={cn('font-medium', getProgressColor(status))}>
                  {Math.round(percent)}%
                </span>
              </div>
            </div>
          </div>
        </TooltipTrigger>

        {/* Detailed tooltip */}
        <TooltipContent
          className="max-w-xs"
          data-testid="target-cell-tooltip"
        >
          <div className="space-y-1 text-xs">
            <div className="font-medium capitalize">
              {metricLabel} vs Target
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <span className="text-muted-foreground">Current:</span>
              <span className="tabular-nums">{actual}</span>

              <span className="text-muted-foreground">Target:</span>
              <span className="tabular-nums">{Math.round(target)}</span>

              <span className="text-muted-foreground">Progress:</span>
              <span className="tabular-nums">{Math.round(percent)}%</span>

              <span className="text-muted-foreground">Status:</span>
              <span className={getProgressColor(status)}>
                {formatTargetDifference(Math.round(difference))}
              </span>
            </div>

            {achieved && (
              <div className="flex items-center gap-1 text-green-600 mt-2 pt-2 border-t">
                <Star className="h-3 w-3 fill-current" />
                <span>Target achieved!</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Achievement Badge Component
 * Story 3.7 Task 5: Shows badge when target achieved
 */
interface TargetAchievementBadgeProps {
  /** Number of targets achieved (out of total) */
  achieved: number;
  /** Total number of targets */
  total: number;
  /** Whether to show detailed badge (e.g., "2/3 targets met") */
  showDetails?: boolean;
}

export function TargetAchievementBadge({
  achieved,
  total,
  showDetails = false,
}: TargetAchievementBadgeProps) {
  if (achieved === 0) {
    return null;
  }

  const allAchieved = achieved === total;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
              allAchieved
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            )}
            data-testid="achievement-badge-multi"
          >
            {allAchieved ? (
              <>
                <Check className="h-3 w-3" />
                {showDetails && <span>All targets</span>}
              </>
            ) : (
              showDetails && <span>{achieved}/{total} targets</span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {allAchieved
              ? 'All targets achieved!'
              : `${achieved} of ${total} targets met`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
