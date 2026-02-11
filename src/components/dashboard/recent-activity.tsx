/**
 * Recent Activity Component
 * Story 2.5 / Story 11-4: Migrated to useAuth
 */
'use client';

import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, ArrowRight } from 'lucide-react';
import { ActivityItem, type Activity } from './activity-item';
import { RecentActivitySkeleton } from './recent-activity-skeleton';

interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  const { role, isAuthenticated } = useAuth();

  const isAdmin = isAuthenticated && role === 'admin';

  if (isLoading) {
    return <RecentActivitySkeleton />;
  }

  return (
    <Card data-testid="recent-activity-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" aria-hidden="true" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <Clock className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground/70">
                Activity will appear here as sales actions occur
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.slice(0, 10).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      {isAdmin && (
        <CardFooter className="pt-3 border-t">
          <Link
            href="/settings/activity"
            className="text-sm text-primary hover:underline flex items-center gap-1 transition-colors"
            aria-label="View all activity log"
          >
            View All Activity
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
