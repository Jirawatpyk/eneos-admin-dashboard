/**
 * Conversion Summary Cards Container
 * Story 3.2: Conversion Rate Analytics
 *
 * AC#1: Summary cards display above performance table
 * AC#8: Responsive design (3 cols desktop, 2 tablet, 1 mobile)
 */
'use client';

import { TeamAverageCard } from './team-average-card';
import { BestPerformerCard } from './best-performer-card';
import { NeedsImprovementCard } from './needs-improvement-card';
import { ConversionSummarySkeleton } from './conversion-summary-skeleton';
import type { SalesPerformanceData } from '@/types/sales';

interface ConversionSummaryCardsProps {
  data: SalesPerformanceData | undefined;
  isLoading: boolean;
  onFilterNeedsImprovement: () => void;
  onHighlightBestPerformer: (userId: string) => void;
}

export function ConversionSummaryCards({
  data,
  isLoading,
  onFilterNeedsImprovement,
  onHighlightBestPerformer,
}: ConversionSummaryCardsProps) {
  if (isLoading || !data) {
    return <ConversionSummarySkeleton />;
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      data-testid="conversion-summary-cards"
    >
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
  );
}
