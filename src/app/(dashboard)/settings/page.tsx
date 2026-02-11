/**
 * Settings Page
 * Story 7.1 / Story 11-4: Migrated to useAuth
 */
'use client';

import { useAuth } from '@/hooks/use-auth';
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
import { isAdmin, type Role } from '@/config/roles';

export default function SettingsPage() {
  const { role, isLoading } = useAuth();
  const userIsAdmin = role && isAdmin(role as Role);

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div data-testid="settings-header">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div
        className={`grid gap-6 ${isLoading || userIsAdmin ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}
        data-testid="settings-grid"
      >
        {isLoading ? <AccountCardSkeleton /> : <AccountCard />}
        {(isLoading || userIsAdmin) && <SystemHealthCard />}
        {(isLoading || userIsAdmin) && <LeadProcessingStatusCard />}
      </div>

      {isLoading ? (
        <NotificationSettingsSkeleton />
      ) : (
        <NotificationSettingsCard />
      )}

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
