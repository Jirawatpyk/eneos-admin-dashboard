/**
 * Performance Bar Chart Skeleton
 * Story 3.3: Sales Performance Bar Chart
 *
 * AC#7: Loading State
 * - Shows skeleton placeholder matching chart dimensions
 * - Shows placeholder bars
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PerformanceBarChartSkeleton() {
  return (
    <Card data-testid="performance-bar-chart-skeleton">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-40" />
      </CardHeader>
      <CardContent>
        <div className="h-[400px] flex flex-col justify-center gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4" data-testid="skeleton-bar">
              <Skeleton className="h-4 w-20" />
              <Skeleton
                className="h-6"
                style={{ width: `${Math.max(20, 80 - i * 8)}%` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
