/**
 * Conversion Summary Skeleton Component
 * Story 3.2: Conversion Rate Analytics
 * Story 3.4: Response Time Analytics
 * Story 3.7: Target vs Actual Comparison
 *
 * AC#7: Loading States
 * - Summary cards show skeleton loaders
 * - Skeletons match the card dimensions
 * Story 3.7 Task 9: Grid layout 2 rows (3 + 2 cards)
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponseTimeCardSkeleton } from './response-time-card-skeleton';
import { TargetProgressCardSkeleton } from './target-progress-card';

export function ConversionSummarySkeleton() {
  return (
    <div
      className="space-y-4 mb-6"
      data-testid="conversion-summary-skeleton"
      aria-busy="true"
      aria-label="Loading summary cards"
    >
      {/* Row 1: 3 cards (Team Average, Best Performer, Needs Improvement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: 2 cards (Response Time, Target Progress) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Response Time Card Skeleton (Story 3.4) */}
        <ResponseTimeCardSkeleton />
        {/* Target Progress Card Skeleton (Story 3.7) */}
        <TargetProgressCardSkeleton />
      </div>
    </div>
  );
}
