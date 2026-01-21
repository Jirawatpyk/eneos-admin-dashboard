/**
 * Recent Activity Component
 * Story 2.5: Recent Activity Feed
 * Story 2.5.1: View All Activity Link Fix (AC#1, #2, #3)
 *
 * AC#1: Activity Feed Display - panel with latest 10 activities
 * AC#2: Activity Types - different types with distinct icon/color
 * AC#5: View All Link - navigation to activity log (admin only)
 * AC#7: Loading & Empty States
 */
'use client';

import { useSession } from 'next-auth/react';
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

/**
 * Recent Activity Feed Component
 * Displays a scrollable list of recent sales activities
 */
export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  // Story 2.5.1: Get session data for role-based link visibility
  const { data: session, status } = useSession();

  // Only show link when authenticated AND admin (prevents flash during loading)
  // AC#1: Admin sees link, AC#2: Viewer does not see link
  const isAdmin = status === 'authenticated' && session?.user?.role === 'admin';

  // AC#7: Loading state
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
          {/* AC#7: Empty state */}
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
              {/* AC#1: Display up to 10 activities */}
              {activities.slice(0, 10).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      {/* Story 2.5.1: AC#1 - Admin sees View All link → /settings/activity */}
      {/* AC#2 - Viewer does NOT see link, AC#3 - Link styling with arrow icon */}
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
