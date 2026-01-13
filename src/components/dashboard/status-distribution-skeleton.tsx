/**
 * Status Distribution Skeleton Component
 * Story 2.3: Status Distribution Chart - AC#7
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatusDistributionSkeleton() {
  return (
    <Card data-testid="status-distribution-skeleton">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {/* Circular skeleton for donut chart */}
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
        {/* Legend skeleton */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        {/* Total skeleton */}
        <Skeleton className="mt-4 h-6 w-24" />
      </CardContent>
    </Card>
  );
}
