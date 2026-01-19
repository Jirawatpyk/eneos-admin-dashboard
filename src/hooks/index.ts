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
