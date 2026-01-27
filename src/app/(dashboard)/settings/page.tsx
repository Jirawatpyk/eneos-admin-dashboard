/**
 * Settings Page
 * Story 7.1: User Profile (Consolidated)
 * Story 7.3: Notification Settings
 * Story 7.4: Team Management Link (Admin only)
 * Story 7.5: System Health (Admin only)
 * Story 0-16: Lead Processing Status (Admin only)
 *
 * Displays user account (profile + session combined), and notification settings.
 * Admin users also see System Health card and Lead Processing Status card.
 *
 * AC#1 (7.1): Settings Page Access - accessible via sidebar navigation
 * AC#5 (7.1): Viewer Access Restriction - handled by middleware (from Story 1-5)
 * AC#6 (7.1): Responsive Design - grid layout with responsive breakpoints
 * AC#7 (7.1): Loading State - shows skeletons while session loads
 * AC#1 (7.3): Notification Settings Section - full-width below grid
 * AC#1 (7.5): System Health Card - displays for admin users only
 * AC#7 (7.5): Admin Only Access - System Health visible to admins only
 * AC#3 (0-16): Lead Processing Status Card - displays for admin users only
 */
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Users, ChevronRight, ClipboardList } from 'lucide-react';
import {
  AccountCard,
  AccountCardSkeleton,
  NotificationSettingsCard,
  NotificationSettingsSkeleton,
  SystemHealthCard,
  LeadProcessingStatusCard,
} from '@/components/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isAdmin } from '@/config/roles';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const userIsAdmin = session?.user?.role && isAdmin(session.user.role);

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div data-testid="settings-header">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Content Grid - 2 columns for non-admin, 3 columns for admin */}
      <div
        className={`grid gap-6 ${userIsAdmin ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}
        data-testid="settings-grid"
      >
        {/* Column 1: Account */}
        {isLoading ? <AccountCardSkeleton /> : <AccountCard />}

        {/* Column 2: System Health (Admin only) */}
        {/* Show during loading (assume admin) or when confirmed admin */}
        {/* SystemHealthCard has its own internal skeleton via useSystemHealth */}
        {(isLoading || userIsAdmin) && <SystemHealthCard />}

        {/* Column 3: Lead Processing Status (Admin only - Story 0-16 AC#3) */}
        {(isLoading || userIsAdmin) && <LeadProcessingStatusCard />}
      </div>

      {/* Full-width Notification Settings (Story 7.3 AC#1) */}
      {isLoading ? (
        <NotificationSettingsSkeleton />
      ) : (
        <NotificationSettingsCard />
      )}

      {/* Admin-only: Team Management Link (Story 7.4) */}
      {!isLoading && userIsAdmin && (
        <Link href="/settings/team" className="block mt-4" data-testid="team-management-link">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-medium">Team Management</CardTitle>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage sales team members, roles, and access permissions.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Admin-only: Activity Log Link (Story 7.7) */}
      {!isLoading && userIsAdmin && (
        <Link href="/settings/activity" className="block mt-4" data-testid="activity-log-link">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-medium">Activity Log</CardTitle>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                View all lead status changes and activities across the system.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}
