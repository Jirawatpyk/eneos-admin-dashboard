/**
 * KPI Card Skeleton Component
 * Story 2.1: KPI Cards
 *
 * AC#5: Loading state with skeleton loaders
 * Matches dimensions of actual KPI card
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader for KPI Card
 * Displays while data is being fetched
 */
export function KPICardSkeleton() {
  return (
    <Card data-testid="kpi-card-skeleton" aria-busy="true" aria-label="Loading KPI data">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

/**
 * Grid of skeleton cards for loading state
 */
export function KPICardsSkeletonGrid() {
  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      data-testid="kpi-cards-skeleton-grid"
    >
      {[...Array(4)].map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}
