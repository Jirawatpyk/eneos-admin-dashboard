/**
 * Lead Trend Chart Empty State Component
 * Story 2.2: Lead Trend Chart
 *
 * AC#7: Empty state with message and suggestion
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CalendarDays } from 'lucide-react';

/**
 * Empty state for Lead Trend Chart
 * Displayed when no trend data is available for the selected period
 */
export function LeadTrendChartEmpty() {
  return (
    <Card data-testid="lead-trend-chart-empty">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
          Lead Trend (30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-72 flex-col items-center justify-center text-center">
          <CalendarDays
            className="h-12 w-12 text-muted-foreground mb-4"
            aria-hidden="true"
          />
          <p className="text-muted-foreground font-medium">
            No data available for this period
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting the date filter to see lead trends
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
