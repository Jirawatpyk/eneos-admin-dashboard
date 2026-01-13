/**
 * Top Sales Table Empty State Component
 * Story 2.4: Top Sales Table (AC#7)
 *
 * Empty state when no sales data is available
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export function TopSalesTableEmpty() {
  return (
    <Card data-testid="top-sales-table-empty">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5" aria-hidden="true" />
          Top Sales This Month
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-[200px] items-center justify-center">
        <p className="text-muted-foreground">No sales data available</p>
      </CardContent>
    </Card>
  );
}
