/**
 * useNotificationPermission Hook Tests
 * Story 7.3: Notification Settings
 *
 * Tests for browser notification permission management.
 * AC#2: Browser Notification Permission
 * AC#3: Permission Status Display
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotificationPermission } from '@/hooks/use-notification-permission';

describe('useNotificationPermission', () => {
  // Store original Notification
  const originalNotification = global.Notification;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original Notification after each test
    if (originalNotification) {
      Object.defineProperty(global, 'Notification', {
        value: originalNotification,
        writable: true,
        configurable: true,
      });
    }
  });

  describe('when browser supports Notification API', () => {
    beforeEach(() => {
      // Mock Notification API
      Object.defineProperty(global, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: vi.fn().mockResolvedValue('granted'),
        },
        writable: true,
        configurable: true,
      });
    });

    it('should return isSupported true', async () => {
      const { result } = renderHook(() => useNotificationPermission());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });
    });

    it('should return current permission status on mount', async () => {
      Object.defineProperty(global, 'Notification', {
        value: {
          permission: 'granted',
          requestPermission: vi.fn(),
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNotificationPermission());

      await waitFor(() => {
        expect(result.current.permission).toBe('granted');
        expect(result.current.isGranted).toBe(true);
        expect(result.current.isDenied).toBe(false);
        expect(result.current.isDefault).toBe(false);
      });
    });

    it('should return denied status correctly', async () => {
      Object.defineProperty(global, 'Notification', {
        value: {
          permission: 'denied',
          requestPermission: vi.fn(),
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNotificationPermission());

      await waitFor(() => {
        expect(result.current.permission).toBe('denied');
        expect(result.current.isGranted).toBe(false);
        expect(result.current.isDenied).toBe(true);
        expect(result.current.isDefault).toBe(false);
      });
    });

    it('should return default status correctly', async () => {
      Object.defineProperty(global, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: vi.fn(),
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNotificationPermission());

      await waitFor(() => {
        expect(result.current.permission).toBe('default');
        expect(result.current.isGranted).toBe(false);
        expect(result.current.isDenied).toBe(false);
        expect(result.current.isDefault).toBe(true);
      });
    });

    it('should request permission and update state when granted', async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue('granted');
      Object.defineProperty(global, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: mockRequestPermission,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNotificationPermission());

      // Wait for initial state to settle
      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      // Request permission
      let permissionResult: string = 'default';
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(mockRequestPermission).toHaveBeenCalled();
      expect(permissionResult).toBe('granted');
      expect(result.current.permission).toBe('granted');
      expect(result.current.isGranted).toBe(true);
    });

    it('should request permission and update state when denied', async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue('denied');
      Object.defineProperty(global, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: mockRequestPermission,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNotificationPermission());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      let permissionResult: string = 'default';
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(permissionResult).toBe('denied');
      expect(result.current.permission).toBe('denied');
      expect(result.current.isDenied).toBe(true);
    });

    it('should handle request permission error gracefully', async () => {
      const mockRequestPermission = vi.fn().mockRejectedValue(new Error('Permission error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      Object.defineProperty(global, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: mockRequestPermission,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNotificationPermission());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      let permissionResult: string = 'default';
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(permissionResult).toBe('denied');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('when browser does not support Notification API', () => {
    beforeEach(() => {
      // Remove Notification API
      // @ts-expect-error - intentionally deleting for test
      delete global.Notification;
    });

    it('should return isSupported false', () => {
      const { result } = renderHook(() => useNotificationPermission());

      expect(result.current.isSupported).toBe(false);
      expect(result.current.permission).toBe('default');
    });

    it('should return denied when requesting permission on unsupported browser', async () => {
      const { result } = renderHook(() => useNotificationPermission());

      let permissionResult: string = 'default';
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(permissionResult).toBe('denied');
    });
  });
});
