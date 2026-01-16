/**
 * Conversion Summary Skeleton Component
 * Story 3.2: Conversion Rate Analytics
 * Story 3.4: Response Time Analytics
 *
 * AC#7: Loading States
 * - Summary cards show skeleton loaders
 * - Skeletons match the card dimensions
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponseTimeCardSkeleton } from './response-time-card-skeleton';

export function ConversionSummarySkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      data-testid="conversion-summary-skeleton"
      aria-busy="true"
      aria-label="Loading summary cards"
    >
      {/* First 3 cards (Team Average, Best Performer, Needs Improvement) */}
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
      {/* Response Time Card Skeleton (Story 3.4) - more complex structure */}
      <ResponseTimeCardSkeleton />
    </div>
  );
}
