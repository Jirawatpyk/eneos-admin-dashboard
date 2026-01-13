/**
 * Alerts Panel Skeleton
 * Story 2.6: Alerts Panel
 *
 * Loading state skeleton for the alerts panel
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loading state for AlertsPanel
 * Matches the structure of the actual component
 */
export function AlertsPanelSkeleton() {
  return (
    <Card
      data-testid="alerts-panel-skeleton"
      aria-busy="true"
      aria-label="Loading alerts"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 mt-0.5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
