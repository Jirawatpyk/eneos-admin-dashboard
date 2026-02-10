/**
 * Campaign Summary Empty State Component
 * Story 2.9: Campaign Summary on Main Dashboard - AC#5
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function CampaignSummaryEmpty() {
  return (
    <Card data-testid="campaign-summary-empty">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
          Campaign Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-[300px] flex-col items-center justify-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No campaign data available</p>
        <p className="text-sm text-muted-foreground/70">
          Campaign metrics will appear here once data is available
        </p>
      </CardContent>
    </Card>
  );
}
