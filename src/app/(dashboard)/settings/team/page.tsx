/**
 * Team Management Page (Story 7-4)
 * /settings/team - Admin only access
 * Story 11-4: Migrated to useAuth
 *
 * AC#1: Admin can view all sales team members in a table
 * AC#10: Viewers are redirected to dashboard with toast message
 */
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TeamManagementCard, TeamManagementCardSkeleton } from '@/components/settings';
import { useToast } from '@/hooks/use-toast';
import { isAdmin } from '@/config/roles';

export default function TeamManagementPage() {
  const { role, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Check if user is admin
  const hasAccess = role && isAdmin(role);

  // AC#10: Redirect non-admin users to dashboard with toast
  useEffect(() => {
    if (!isLoading && !hasAccess) {
      toast({
        title: 'Admin access required',
        description: 'Only administrators can access Team Management.',
        variant: 'destructive',
      });
      router.replace('/');
    }
  }, [isLoading, hasAccess, router, toast]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="team-page-loading">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage sales team members and permissions.
          </p>
        </div>
        <TeamManagementCardSkeleton />
      </div>
    );
  }

  // AC#10: Show nothing while redirecting (useEffect handles redirect)
  if (!hasAccess) {
    return (
      <div className="space-y-6" data-testid="team-page-redirecting">
        <TeamManagementCardSkeleton />
      </div>
    );
  }

  // Admin access granted
  return (
    <div className="space-y-6" data-testid="team-page">
      {/* Header with back link */}
      <div>
        <Link
          href="/settings"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">
          Manage sales team members, roles, and access permissions.
        </p>
      </div>

      {/* Team Management Card - Pass admin status for button visibility */}
      <TeamManagementCard isAdmin={hasAccess} />
    </div>
  );
}
