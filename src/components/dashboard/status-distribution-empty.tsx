/**
 * Status Distribution Empty State Component
 * Story 2.3: Status Distribution Chart - AC#7
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

export function StatusDistributionEmpty() {
  return (
    <Card data-testid="status-distribution-empty">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChart className="h-5 w-5" aria-hidden="true" />
          Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-[300px] flex-col items-center justify-center">
        <PieChart className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No data available</p>
        <p className="text-sm text-muted-foreground/70">
          Lead status data will appear here
        </p>
      </CardContent>
    </Card>
  );
}
