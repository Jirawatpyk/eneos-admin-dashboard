/**
 * Lead Detail Skeleton Component
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#5: Loading State
 * - Skeleton loaders appear in new sections (History, Metrics)
 * - Indicates data is being fetched
 */
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function LeadDetailSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading lead details"
      data-testid="lead-detail-skeleton"
    >
      {/* Metrics skeleton */}
      <section>
        <Skeleton className="h-5 w-40 mb-4" />
        <Card>
          <CardContent className="p-4 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* History skeleton */}
      <section>
        <Skeleton className="h-5 w-32 mb-4" />
        <Card>
          <CardContent className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 pl-6">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
