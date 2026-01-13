/**
 * Recent Activity Skeleton Component
 * Story 2.5: Recent Activity Feed - AC#7
 *
 * Loading state with skeleton loaders
 * Matches dimensions of actual activity items
 */
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader for Recent Activity panel
 * Displays while data is being fetched
 */
export function RecentActivitySkeleton() {
  return (
    <Card
      data-testid="recent-activity-skeleton"
      aria-busy="true"
      aria-label="Loading recent activity"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Skeleton className="h-4 w-32" />
      </CardFooter>
    </Card>
  );
}
