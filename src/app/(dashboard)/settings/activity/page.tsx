/**
 * Activity Log Page (Story 7-7)
 * /settings/activity - Admin only access
 * Story 11-4: Migrated to useAuth
 *
 * AC#1: Admin only access (redirect viewers with toast)
 * AC#2: Display activity log with pagination
 * AC#9: Responsive design
 */
'use client';

import { useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ActivityLogContainer, ActivityLogSkeleton } from '@/components/settings';
import { useToast } from '@/hooks/use-toast';
import { isAdmin } from '@/config/roles';

export default function ActivityLogPage() {
  const { role, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Check if user is admin
  const hasAccess = role && isAdmin(role);

  // AC#1: Redirect non-admin users to dashboard with toast
  useEffect(() => {
    if (!isLoading && !hasAccess) {
      toast({
        title: 'Admin access required',
        description: 'Only administrators can access Activity Log.',
        variant: 'destructive',
      });
      router.replace('/');
    }
  }, [isLoading, hasAccess, router, toast]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="activity-page-loading">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            View all lead status changes and activities.
          </p>
        </div>
        <ActivityLogSkeleton />
      </div>
    );
  }

  // AC#1: Show nothing while redirecting (useEffect handles redirect)
  if (!hasAccess) {
    return (
      <div className="space-y-6" data-testid="activity-page-redirecting">
        <ActivityLogSkeleton />
      </div>
    );
  }

  // Admin access granted
  return (
    <div className="space-y-6" data-testid="activity-page">
      {/* Header with back link */}
      <div>
        <Link
          href="/settings"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          View all lead status changes and activities across the system.
        </p>
      </div>

      {/* Activity Log Container wrapped in Suspense for useSearchParams */}
      <Suspense fallback={<ActivityLogSkeleton />}>
        <ActivityLogContainer />
      </Suspense>
    </div>
  );
}
