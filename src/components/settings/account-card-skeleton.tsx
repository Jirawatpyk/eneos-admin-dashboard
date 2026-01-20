/**
 * Account Card Skeleton Component
 * Story 7.1: User Profile (Consolidated)
 *
 * Loading state skeleton for AccountCard.
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function AccountCardSkeleton() {
  return (
    <Card data-testid="account-card-skeleton">
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="text-center space-y-2">
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>

        <Separator />

        {/* Session Section */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Sign Out Button */}
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
