/**
 * Profile Card Skeleton Component
 * Story 7.1: User Profile
 *
 * Loading state skeleton for ProfileCard.
 *
 * AC#7: Loading State - skeleton loader while session loads
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileCardSkeleton() {
  return (
    <Card data-testid="profile-card-skeleton">
      <CardHeader>
        <Skeleton className="h-6 w-16" />
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {/* Avatar skeleton */}
        <Skeleton
          className="h-16 w-16 rounded-full"
          data-testid="skeleton-avatar"
        />
        {/* Name and email skeleton */}
        <div className="space-y-2 text-center">
          <Skeleton className="h-5 w-32 mx-auto" data-testid="skeleton-name" />
          <Skeleton className="h-4 w-48 mx-auto" data-testid="skeleton-email" />
        </div>
        {/* Role badge skeleton */}
        <Skeleton className="h-5 w-16" data-testid="skeleton-badge" />
      </CardContent>
    </Card>
  );
}
