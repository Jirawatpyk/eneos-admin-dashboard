/**
 * Permission Utilities Tests
 * Story 1.5: Role-based Access Control
 * AC: #3 (Admin Access), #4 (Viewer Access)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: ReactNode }) => children,
}));

describe('Permission Utilities', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseSession.mockReset();
  });

  describe('permissions object', () => {
    describe('canExport', () => {
      it('should return true for admin role', async () => {
        const { permissions } = await import('../lib/permissions');
        expect(permissions.canExport('admin')).toBe(true);
      });

      it('should return false for viewer role', async () => {
        const { permissions } = await import('../lib/permissions');
        expect(permissions.canExport('viewer')).toBe(false);
      });
    });

    describe('canAccessSettings', () => {
      it('should return true for admin role', async () => {
        const { permissions } = await import('../lib/permissions');
        expect(permissions.canAccessSettings('admin')).toBe(true);
      });

      it('should return false for viewer role', async () => {
        const { permissions } = await import('../lib/permissions');
        expect(permissions.canAccessSettings('viewer')).toBe(false);
      });
    });

    describe('canManageUsers', () => {
      it('should return true for admin role', async () => {
        const { permissions } = await import('../lib/permissions');
        expect(permissions.canManageUsers('admin')).toBe(true);
      });

      it('should return false for viewer role', async () => {
        const { permissions } = await import('../lib/permissions');
        expect(permissions.canManageUsers('viewer')).toBe(false);
      });
    });

    describe('isAdmin', () => {
      it('should return true for admin role', async () => {
        const { permissions } = await import('../lib/permissions');
        expect(permissions.isAdmin('admin')).toBe(true);
      });

      it('should return false for viewer role', async () => {
        const { permissions } = await import('../lib/permissions');
        expect(permissions.isAdmin('viewer')).toBe(false);
      });
    });

    describe('isViewer', () => {
      it('should return true for viewer role', async () => {
        const { permissions } = await import('../lib/permissions');
        expect(permissions.isViewer('viewer')).toBe(true);
      });

      it('should return false for admin role', async () => {
        const { permissions } = await import('../lib/permissions');
        expect(permissions.isViewer('admin')).toBe(false);
      });
    });
  });

  describe('usePermissions hook', () => {
    it('should return admin permissions for admin user', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            name: 'Admin',
            email: 'admin@eneos.co.th',
            role: 'admin',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { usePermissions } = await import('../lib/permissions');
      const { result } = renderHook(() => usePermissions());

      expect(result.current.role).toBe('admin');
      expect(result.current.canExport).toBe(true);
      expect(result.current.canAccessSettings).toBe(true);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isViewer).toBe(false);
    });

    it('should return viewer permissions for viewer user', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-456',
            name: 'Viewer',
            email: 'viewer@eneos.co.th',
            role: 'viewer',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { usePermissions } = await import('../lib/permissions');
      const { result } = renderHook(() => usePermissions());

      expect(result.current.role).toBe('viewer');
      expect(result.current.canExport).toBe(false);
      expect(result.current.canAccessSettings).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isViewer).toBe(true);
    });

    it('should default to viewer for unauthenticated users', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { usePermissions } = await import('../lib/permissions');
      const { result } = renderHook(() => usePermissions());

      expect(result.current.role).toBe('viewer');
      expect(result.current.canExport).toBe(false);
      expect(result.current.canAccessSettings).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isViewer).toBe(true);
    });

    it('should default to viewer when session has no role', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-789',
            name: 'User',
            email: 'user@eneos.co.th',
            // No role property
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { usePermissions } = await import('../lib/permissions');
      const { result } = renderHook(() => usePermissions());

      expect(result.current.role).toBe('viewer');
      expect(result.current.canExport).toBe(false);
    });

    it('should return isLoading true when session is loading', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { usePermissions } = await import('../lib/permissions');
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return isLoading false when session is loaded', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            name: 'Admin',
            email: 'admin@eneos.co.th',
            role: 'admin',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { usePermissions } = await import('../lib/permissions');
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isLoading).toBe(false);
    });
  });
});
