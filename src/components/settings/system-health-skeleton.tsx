/**
 * System Health Skeleton Component
 * Story 7.5: System Health
 *
 * Loading state skeleton for SystemHealthCard.
 * Matches the layout of the loaded state.
 *
 * AC#8: Loading State - skeleton loader while health data loads
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SystemHealthSkeleton() {
  return (
    <Card data-testid="system-health-skeleton">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" data-testid="skeleton-icon" />
          <Skeleton className="h-6 w-32" data-testid="skeleton-title" />
        </div>
        <Skeleton className="h-8 w-8 rounded" data-testid="skeleton-refresh-btn" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" data-testid="skeleton-status-label" />
          <Skeleton className="h-5 w-16" data-testid="skeleton-status-badge" />
        </div>

        {/* Services Section */}
        <div className="border-t pt-4 space-y-3">
          <Skeleton className="h-3 w-16" data-testid="skeleton-services-label" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2"
              data-testid={`skeleton-service-row-${i}`}
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Metrics Footer - 3 rows: Version, Uptime, Last Check */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
