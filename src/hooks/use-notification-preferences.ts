/**
 * useNotificationPreferences Hook
 * Story 7.3: Notification Settings
 *
 * Manages notification preferences with localStorage persistence.
 *
 * AC#5: Settings Persistence - stores preferences in localStorage
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'eneos-notification-preferences';

export interface NotificationPreferences {
  /** Notify when new leads arrive */
  newLeadAlerts: boolean;
  /** Remind about leads not contacted within 24 hours */
  staleLeadReminders: boolean;
  /** Warn when metrics fall below targets */
  performanceAlerts: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  newLeadAlerts: true,
  staleLeadReminders: true,
  performanceAlerts: true,
};

export interface UseNotificationPreferencesReturn {
  /** Current notification preferences */
  preferences: NotificationPreferences;
  /** Whether preferences have been loaded from localStorage */
  isLoaded: boolean;
  /** Update a single preference */
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => void;
}

/**
 * Hook for managing notification preferences with localStorage persistence.
 * Uses opt-out model - all preferences default to true.
 *
 * @example
 * ```tsx
 * const { preferences, updatePreference } = useNotificationPreferences();
 *
 * <Switch
 *   checked={preferences.newLeadAlerts}
 *   onCheckedChange={(checked) => updatePreference('newLeadAlerts', checked)}
 * />
 * ```
 */
export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    // SSR: window doesn't exist, but we still need to mark as loaded
    // so the UI doesn't stay in loading state forever
    if (typeof window === 'undefined') {
      setIsLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<NotificationPreferences>;
        // Merge with defaults to handle new preference keys
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
        });
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage - use functional update to avoid stale closure
  const updatePreference = useCallback(
    (key: keyof NotificationPreferences, value: boolean) => {
      setPreferences((prev) => {
        const newPreferences = { ...prev, [key]: value };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
        } catch (error) {
          console.error('Failed to save notification preferences:', error);
        }

        return newPreferences;
      });
    },
    []
  );

  return {
    preferences,
    isLoaded,
    updatePreference,
  };
}
