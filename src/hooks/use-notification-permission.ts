/**
 * useNotificationPermission Hook
 * Story 7.3: Notification Settings
 *
 * Manages browser notification permission state.
 *
 * AC#2: Browser Notification Permission - handles permission requests
 * AC#3: Permission Status Display - exposes permission state
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default';

export interface UseNotificationPermissionReturn {
  /** Current permission status */
  permission: NotificationPermissionStatus;
  /** Whether browser supports Notification API */
  isSupported: boolean;
  /** Whether notifications are granted */
  isGranted: boolean;
  /** Whether notifications are denied */
  isDenied: boolean;
  /** Whether permission hasn't been asked yet */
  isDefault: boolean;
  /** Request notification permission from user */
  requestPermission: () => Promise<NotificationPermissionStatus>;
}

/**
 * Hook for managing browser notification permissions.
 *
 * @example
 * ```tsx
 * const { permission, isGranted, requestPermission } = useNotificationPermission();
 *
 * if (!isGranted) {
 *   return <button onClick={requestPermission}>Enable Notifications</button>;
 * }
 * ```
 */
export function useNotificationPermission(): UseNotificationPermissionReturn {
  const [permission, setPermission] = useState<NotificationPermissionStatus>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports Notification API (client-side only)
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission as NotificationPermissionStatus);

    // Listen for permission changes (supported in some browsers)
    // This allows the UI to update if user changes permission via browser settings
    const handlePermissionChange = () => {
      setPermission(Notification.permission as NotificationPermissionStatus);
    };

    // navigator.permissions API for reactive updates (Chrome, Edge)
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'notifications' as PermissionName })
        .then((permissionStatus) => {
          permissionStatus.onchange = handlePermissionChange;
        })
        .catch(() => {
          // Permission query not supported, ignore
        });
    }

    return () => {
      // Cleanup: try to remove listener if possible
      if ('permissions' in navigator) {
        navigator.permissions
          .query({ name: 'notifications' as PermissionName })
          .then((permissionStatus) => {
            permissionStatus.onchange = null;
          })
          .catch(() => {
            // Ignore cleanup errors
          });
      }
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
    if (!isSupported) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      const status = result as NotificationPermissionStatus;
      setPermission(status);
      return status;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  return {
    permission,
    isSupported,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isDefault: permission === 'default',
    requestPermission,
  };
}
