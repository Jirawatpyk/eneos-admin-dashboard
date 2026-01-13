/**
 * Lead Trend Chart Skeleton Component
 * Story 2.2: Lead Trend Chart
 *
 * AC#6: Loading state with skeleton placeholder matching chart dimensions
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader for Lead Trend Chart
 * Matches dimensions of actual chart component
 */
export function LeadTrendChartSkeleton() {
  return (
    <Card data-testid="lead-trend-chart-skeleton" aria-busy="true" aria-label="Loading chart data">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart area skeleton */}
        <div className="h-72 relative">
          {/* Y-axis area */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between py-4">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
          </div>
          {/* Chart area */}
          <div className="ml-12 mr-4">
            <Skeleton className="h-56 w-full" />
          </div>
          {/* X-axis labels */}
          <div className="ml-12 mt-2 flex justify-between">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
          </div>
          {/* Legend skeleton */}
          <div className="mt-4 flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
