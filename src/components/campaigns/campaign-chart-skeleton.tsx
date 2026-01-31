/**
 * Campaign Chart Skeleton Component
 * Story 5.6: Campaign Performance Chart
 *
 * AC#5: Loading state with skeleton matching chart dimensions
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton placeholder for campaign performance chart.
 * Displays animated bars mimicking the chart layout while data loads.
 */
export function CampaignChartSkeleton() {
  return (
    <Card
      aria-busy={true}
      aria-label="Loading campaign performance chart"
      data-testid="campaign-chart-skeleton"
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaign Performance</CardTitle>
        <Skeleton className="h-9 w-[120px]" />
      </CardHeader>
      <CardContent className="h-[400px]">
        <div className="space-y-4 pt-4">
          {[80, 65, 50, 40, 30].map((width, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32 shrink-0" />
              <Skeleton
                className="h-6 flex-1"
                style={{ maxWidth: `${width}%` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
