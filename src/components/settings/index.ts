/**
 * Settings Components Barrel Export
 * Story 7.1: User Profile (Consolidated)
 * Story 7.3: Notification Settings
 * Story 7.4: Team Management
 */
// Story 7.1: Account Card (Profile + Session combined) - PRIMARY
export { AccountCard } from './account-card';
export { AccountCardSkeleton } from './account-card-skeleton';

// Legacy components (DEPRECATED - scheduled for removal)
// These are superseded by AccountCard but kept for backwards compatibility
// TODO: Remove after confirming no external usage
export { ProfileCard } from './profile-card';
export { ProfileCardSkeleton } from './profile-card-skeleton';
export { SessionCard } from './session-card';
export { SessionCardSkeleton } from './session-card-skeleton';

// Story 7.3: Notification Settings
export { NotificationSettingsCard } from './notification-settings-card';
export { NotificationSettingsSkeleton } from './notification-settings-skeleton';

// Story 7.4: Team Management
export { TeamManagementCard, TeamManagementCardSkeleton } from './team-management-card';
export { TeamMemberFilter } from './team-member-filter';
export { TeamMemberTable } from './team-member-table';
export { TeamMemberEditModal } from './team-member-edit-modal';

// Story 7.5: System Health
export { SystemHealthCard } from './system-health-card';
export { SystemHealthSkeleton } from './system-health-skeleton';

// Story 7.7: Activity Log
export { ActivityLogContainer } from './activity-log-container';
export { ActivityLogTable } from './activity-log-table';
export { ActivityLogSkeleton } from './activity-log-skeleton';
export { ActivityLogEmpty } from './activity-log-empty';
export { ActivityLogFilters } from './activity-log-filters';
