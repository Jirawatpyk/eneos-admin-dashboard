/**
 * Conversion Summary Cards Container
 * Story 3.2: Conversion Rate Analytics
 * Story 3.4: Response Time Analytics
 * Story 3.7: Target vs Actual Comparison
 *
 * AC#1: Summary cards display above performance table
 * AC#8: Responsive design
 * Story 3.7 Task 9: Grid layout 2 rows (3 + 2 cards)
 */
'use client';

import { TeamAverageCard } from './team-average-card';
import { BestPerformerCard } from './best-performer-card';
import { NeedsImprovementCard } from './needs-improvement-card';
import { ResponseTimeCard } from './response-time-card';
import { TargetProgressCard } from './target-progress-card';
import { ConversionSummarySkeleton } from './conversion-summary-skeleton';
import type { SalesPerformanceData } from '@/types/sales';

interface ConversionSummaryCardsProps {
  data: SalesPerformanceData | undefined;
  isLoading: boolean;
  onFilterNeedsImprovement: () => void;
  onHighlightBestPerformer: (userId: string) => void;
  /** Story 3.4: Filter to show only slow responders */
  onFilterSlowResponders?: () => void;
  /** Story 3.7: Current period for target proration */
  period?: string;
  /** Story 3.7: Date range for custom period */
  dateRange?: { from: Date; to: Date };
}

export function ConversionSummaryCards({
  data,
  isLoading,
  onFilterNeedsImprovement,
  onHighlightBestPerformer,
  onFilterSlowResponders,
  period = 'month',
  dateRange,
}: ConversionSummaryCardsProps) {
  if (isLoading || !data) {
    return <ConversionSummarySkeleton />;
  }

  // Story 3.7: Calculate total closed for target progress
  const totalClosed = data.summary.totalClosed;
  const teamSize = data.teamPerformance.length;

  return (
    <div className="space-y-4 mb-6" data-testid="conversion-summary-cards">
      {/* Row 1: Team Average, Best Performer, Needs Improvement (3 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TeamAverageCard avgConversionRate={data.summary.avgConversionRate} />
        <BestPerformerCard
          teamPerformance={data.teamPerformance}
          onClick={onHighlightBestPerformer}
        />
        <NeedsImprovementCard
          teamPerformance={data.teamPerformance}
          onClick={onFilterNeedsImprovement}
        />
      </div>

      {/* Row 2: Response Time, Target Progress (2 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Story 3.4: Response Time Card */}
        <ResponseTimeCard
          teamAverage={data.summary.avgResponseTime}
          teamPerformance={data.teamPerformance}
          onHighlight={onHighlightBestPerformer}
          onFilterSlow={onFilterSlowResponders}
        />

        {/* Story 3.7: Target Progress Card */}
        <TargetProgressCard
          totalClosed={totalClosed}
          teamSize={teamSize}
          period={period}
          dateRange={dateRange}
        />
      </div>
    </div>
  );
}
