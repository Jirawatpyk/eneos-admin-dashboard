/**
 * Performance Bar Chart Empty State
 * Story 3.3: Sales Performance Bar Chart
 *
 * AC#8: Empty State
 * - Shows "No performance data available"
 * - Suggestion to check if sales team is configured
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users } from 'lucide-react';

export function PerformanceBarChartEmpty() {
  return (
    <Card data-testid="performance-bar-chart-empty">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
          Performance Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex flex-col items-center justify-center text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
          <p className="text-lg font-medium text-muted-foreground">
            No performance data available
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Please check if sales team is configured and has activity
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
