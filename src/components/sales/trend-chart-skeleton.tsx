/**
 * Trend Chart Skeleton Component
 * Story 3.5: Individual Performance Trend
 *
 * AC#8: Loading State
 * - Shows skeleton placeholder while data loads
 * - Matches chart dimensions
 */
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CHART_HEIGHT = 250;

export function TrendChartSkeleton() {
  return (
    <Card data-testid="trend-chart-skeleton">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* Title skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        {/* Period selector skeleton */}
        <div className="flex gap-1">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart area skeleton */}
        <div style={{ height: CHART_HEIGHT }} className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
          </div>
          {/* Chart grid lines */}
          <div className="ml-8 h-full flex flex-col justify-between py-4">
            <Skeleton className="h-[1px] w-full opacity-50" />
            <Skeleton className="h-[1px] w-full opacity-50" />
            <Skeleton className="h-[1px] w-full opacity-50" />
            <Skeleton className="h-[1px] w-full opacity-50" />
          </div>
          {/* Chart area placeholder */}
          <div className="absolute inset-0 ml-8 mt-4 mb-8">
            <Skeleton className="h-full w-full rounded-lg opacity-30" />
          </div>
        </div>
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 ml-8">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
        {/* Legend skeleton */}
        <div className="flex items-center justify-start gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
