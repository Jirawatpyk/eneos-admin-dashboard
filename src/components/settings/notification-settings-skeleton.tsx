/**
 * NotificationSettingsSkeleton Component
 * Story 7.3: Notification Settings
 *
 * Loading skeleton for notification settings card.
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton placeholder for notification settings card during loading.
 *
 * @example
 * ```tsx
 * {isLoading ? <NotificationSettingsSkeleton /> : <NotificationSettingsCard />}
 * ```
 */
export function NotificationSettingsSkeleton() {
  return (
    <Card data-testid="notification-settings-skeleton">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        {/* Preference Toggles */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-28" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
