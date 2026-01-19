/**
 * useNotificationPreferences Hook Tests
 * Story 7.3: Notification Settings
 *
 * Tests for notification preferences localStorage persistence.
 * AC#5: Settings Persistence
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotificationPreferences } from '@/hooks/use-notification-preferences';

describe('useNotificationPreferences', () => {
  const STORAGE_KEY = 'eneos-notification-preferences';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should return default preferences when no stored data', async () => {
      const { result } = renderHook(() => useNotificationPreferences());

      // Wait for isLoaded to be true
      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.preferences.newLeadAlerts).toBe(true);
      expect(result.current.preferences.staleLeadReminders).toBe(true);
      expect(result.current.preferences.performanceAlerts).toBe(true);
    });

    it('should load preferences from localStorage', async () => {
      const storedPrefs = {
        newLeadAlerts: false,
        staleLeadReminders: true,
        performanceAlerts: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedPrefs));

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.preferences.newLeadAlerts).toBe(false);
      expect(result.current.preferences.staleLeadReminders).toBe(true);
      expect(result.current.preferences.performanceAlerts).toBe(false);
    });

    it('should handle partial stored data by merging with defaults', async () => {
      // Only store one preference
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ newLeadAlerts: false }));

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // The stored one should be false
      expect(result.current.preferences.newLeadAlerts).toBe(false);
      // The others should default to true
      expect(result.current.preferences.staleLeadReminders).toBe(true);
      expect(result.current.preferences.performanceAlerts).toBe(true);
    });

    it('should handle invalid JSON in localStorage gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // Should fall back to defaults
      expect(result.current.preferences.newLeadAlerts).toBe(true);
      expect(result.current.preferences.staleLeadReminders).toBe(true);
      expect(result.current.preferences.performanceAlerts).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('updatePreference', () => {
    it('should update a single preference', async () => {
      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.updatePreference('newLeadAlerts', false);
      });

      expect(result.current.preferences.newLeadAlerts).toBe(false);
      // Others should remain unchanged
      expect(result.current.preferences.staleLeadReminders).toBe(true);
      expect(result.current.preferences.performanceAlerts).toBe(true);
    });

    it('should persist preference to localStorage', async () => {
      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.updatePreference('newLeadAlerts', false);
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.newLeadAlerts).toBe(false);
    });

    it('should handle rapid preference updates without stale closure', async () => {
      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // Rapidly toggle multiple preferences
      act(() => {
        result.current.updatePreference('newLeadAlerts', false);
        result.current.updatePreference('staleLeadReminders', false);
        result.current.updatePreference('performanceAlerts', false);
      });

      // All should be updated correctly
      expect(result.current.preferences.newLeadAlerts).toBe(false);
      expect(result.current.preferences.staleLeadReminders).toBe(false);
      expect(result.current.preferences.performanceAlerts).toBe(false);

      // Check localStorage
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.newLeadAlerts).toBe(false);
      expect(stored.staleLeadReminders).toBe(false);
      expect(stored.performanceAlerts).toBe(false);
    });

    it('should toggle preference back to true', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        newLeadAlerts: false,
        staleLeadReminders: true,
        performanceAlerts: true,
      }));

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.preferences.newLeadAlerts).toBe(false);

      act(() => {
        result.current.updatePreference('newLeadAlerts', true);
      });

      expect(result.current.preferences.newLeadAlerts).toBe(true);
    });

    it('should handle localStorage setItem error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // Should still update state even if localStorage fails
      act(() => {
        result.current.updatePreference('newLeadAlerts', false);
      });

      expect(result.current.preferences.newLeadAlerts).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });
});
