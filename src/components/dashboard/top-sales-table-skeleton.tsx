/**
 * Top Sales Table Skeleton Component
 * Story 2.4: Top Sales Table (AC#7)
 *
 * Loading state with skeleton rows
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TopSalesTableSkeleton() {
  return (
    <Card data-testid="top-sales-table-skeleton" aria-busy="true" aria-label="Loading top sales data">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        {/* Header row skeleton */}
        <div className="mb-4 flex items-center gap-4 border-b pb-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        {/* Data rows skeleton */}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-12 ml-auto" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
