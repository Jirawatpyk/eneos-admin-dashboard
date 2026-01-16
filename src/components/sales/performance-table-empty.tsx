/**
 * Performance Table Empty State Component
 * Story 3.1: Sales Team Performance Table
 *
 * AC#8: Empty shows "No sales team data available" with helpful message
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function PerformanceTableEmpty() {
  return (
    <Card data-testid="performance-table-empty">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" aria-hidden="true" />
          Sales Team Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
          <h3 className="text-lg font-medium text-muted-foreground">
            No sales team data available
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            There is no sales team performance data to display at this time.
            This could be because no leads have been assigned yet or data is
            still being processed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
