/**
 * Session Card Skeleton Component
 * Story 7.1: User Profile
 *
 * Loading state skeleton for SessionCard.
 *
 * AC#7: Loading State - skeleton loader while session loads
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SessionCardSkeleton() {
  return (
    <Card data-testid="session-card-skeleton">
      <CardHeader>
        <Skeleton className="h-6 w-16" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {/* Provider row */}
          <div className="flex justify-between" data-testid="skeleton-row-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
          {/* Status row */}
          <div className="flex justify-between" data-testid="skeleton-row-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          {/* Expiry row */}
          <div className="flex justify-between" data-testid="skeleton-row-3">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {/* Button skeleton */}
        <Skeleton className="h-10 w-full" data-testid="skeleton-button" />
      </CardContent>
    </Card>
  );
}
