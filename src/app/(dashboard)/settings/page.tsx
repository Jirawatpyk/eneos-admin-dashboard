/**
 * Settings Page
 * Story 7.1: User Profile
 * Story 7.3: Notification Settings
 *
 * Displays user profile, session information, and notification settings.
 *
 * AC#1 (7.1): Settings Page Access - accessible via sidebar navigation
 * AC#5 (7.1): Viewer Access Restriction - handled by middleware (from Story 1-5)
 * AC#6 (7.1): Responsive Design - grid layout with responsive breakpoints
 * AC#7 (7.1): Loading State - shows skeletons while session loads
 * AC#1 (7.3): Notification Settings Section - full-width below grid
 */
'use client';

import { useSession } from 'next-auth/react';
import {
  ProfileCard,
  ProfileCardSkeleton,
  SessionCard,
  SessionCardSkeleton,
  NotificationSettingsCard,
  NotificationSettingsSkeleton,
} from '@/components/settings';

export default function SettingsPage() {
  const { status } = useSession();
  const isLoading = status === 'loading';

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div data-testid="settings-header">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Content Grid - Responsive: 1 col mobile, 2 cols tablet+ */}
      <div
        className="grid gap-6 md:grid-cols-2"
        data-testid="settings-grid"
      >
        {isLoading ? (
          <>
            <ProfileCardSkeleton />
            <SessionCardSkeleton />
          </>
        ) : (
          <>
            <ProfileCard />
            <SessionCard />
          </>
        )}
      </div>

      {/* Full-width Notification Settings (Story 7.3 AC#1) */}
      {isLoading ? (
        <NotificationSettingsSkeleton />
      ) : (
        <NotificationSettingsCard />
      )}
    </div>
  );
}
