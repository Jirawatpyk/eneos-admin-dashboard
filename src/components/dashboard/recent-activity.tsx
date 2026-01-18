/**
 * Recent Activity Component
 * Story 2.5: Recent Activity Feed
 *
 * AC#1: Activity Feed Display - panel with latest 10 activities
 * AC#2: Activity Types - different types with distinct icon/color
 * AC#5: View All Link - navigation to activity log
 * AC#7: Loading & Empty States
 */
'use client';

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
      {/* AC#5: View All Link - L-03 Fix: improved accessibility */}
      {/* Temporary: Link to /leads until dedicated /activity page is built (see backlog) */}
      <CardFooter className="pt-3 border-t">
        <Link
          href="/leads?sort=updatedAt&order=desc"
          className="text-sm text-primary hover:underline flex items-center gap-1 transition-colors"
          aria-label="View all recent leads activity"
        >
          View All Activity
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
