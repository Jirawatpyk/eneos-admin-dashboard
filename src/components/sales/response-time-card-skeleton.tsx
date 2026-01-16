/**
 * Response Time Card Skeleton
 * Story 3.4: Response Time Analytics
 *
 * AC#8: Loading state with skeleton matching card dimensions
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ResponseTimeCardSkeleton() {
  return (
    <Card data-testid="response-time-card-skeleton">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Average */}
        <div>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Gauge */}
        <Skeleton className="h-2 w-full rounded-full" />

        {/* Top 3 Ranking */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 p-1.5">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
