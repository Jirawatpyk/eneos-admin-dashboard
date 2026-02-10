/**
 * Campaign Summary Skeleton Component
 * Story 2.9: Campaign Summary on Main Dashboard - AC#6
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CampaignSummarySkeleton() {
  return (
    <Card data-testid="campaign-summary-skeleton">
      <CardHeader>
        <Skeleton className="h-6 w-44" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3 metric placeholders */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>

        <Skeleton className="h-px w-full" />

        {/* 3 list item placeholders */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-2 w-24 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Skeleton className="h-4 w-36" />
        </div>
      </CardContent>
    </Card>
  );
}
