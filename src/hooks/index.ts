/**
 * Hooks Barrel Export
 * Story 7.2: Theme Toggle
 * Story 7.3: Notification Settings
 */
export { useChartTheme, useChartPalette } from './use-chart-theme';
export type { ChartThemeColors, UseChartThemeReturn } from './use-chart-theme';

// Story 7.3: Notification Settings
export { useNotificationPermission } from './use-notification-permission';
export type {
  NotificationPermissionStatus,
  UseNotificationPermissionReturn,
} from './use-notification-permission';

export { useNotificationPreferences } from './use-notification-preferences';
export type {
  NotificationPreferences,
  UseNotificationPreferencesReturn,
} from './use-notification-preferences';

// Story 7.4: Team Management
export { useTeamList, useTeamMember, useUpdateTeamMember } from './use-team-management';

// Story 7.5: System Health
export { useSystemHealth, formatUptime } from './use-system-health';
export type { SystemHealthData, UseSystemHealthReturn } from './use-system-health';

// Story 7.7: Activity Log
export { useActivityLog } from './use-activity-log';
export type {
  ActivityEntry,
  ActivityPagination,
  ActivityLogQueryParams,
  ChangedByOption,
} from './use-activity-log';
