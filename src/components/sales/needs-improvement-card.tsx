/**
 * Needs Improvement Card Component
 * Story 3.2: Conversion Rate Analytics
 *
 * AC#4: Needs Improvement Card
 * - Shows count of sales with conversion rate < 10%
 * - Subtitle shows "Below 10% threshold"
 * - Clicking filters the table to show only those sales
 * - Shows "0" with positive message if everyone above threshold
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONVERSION_THRESHOLDS } from '@/lib/sales-constants';
import type { SalesPersonMetrics } from '@/types/sales';

interface NeedsImprovementCardProps {
  teamPerformance: SalesPersonMetrics[];
  onClick?: () => void;
}

export function NeedsImprovementCard({
  teamPerformance,
  onClick,
}: NeedsImprovementCardProps) {
  const hasNoData = teamPerformance.length === 0;
  const needsImprovementCount = teamPerformance.filter(
    (p) => p.conversionRate < CONVERSION_THRESHOLDS.NEEDS_IMPROVEMENT
  ).length;

  const hasIssues = needsImprovementCount > 0;

  const handleClick = () => {
    if (hasIssues && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      data-testid="needs-improvement-card"
      className={cn(
        'transition-colors',
        hasIssues ? 'cursor-pointer hover:bg-accent/50' : ''
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={hasIssues ? 0 : undefined}
      role={hasIssues ? 'button' : undefined}
      aria-label={
        hasIssues
          ? `Filter table to show ${needsImprovementCount} sales below threshold`
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Needs Improvement
        </CardTitle>
        {hasNoData ? (
          <AlertTriangle
            className="h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
        ) : hasIssues ? (
          <AlertTriangle
            className="h-4 w-4 text-amber-500"
            aria-hidden="true"
          />
        ) : (
          <CheckCircle2
            className="h-4 w-4 text-green-500"
            aria-hidden="true"
          />
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'text-2xl font-bold',
            hasNoData ? 'text-gray-400' : hasIssues ? 'text-amber-600' : 'text-green-600'
          )}
        >
          {hasNoData ? '-' : needsImprovementCount}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {hasNoData
            ? 'No sales data in period'
            : hasIssues
              ? 'Below 10% threshold'
              : 'Everyone on track!'}
        </p>
      </CardContent>
    </Card>
  );
}
