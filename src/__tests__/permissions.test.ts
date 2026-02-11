/**
 * Permission Utilities Tests
 * Story 1.5 / Story 11-4: Migrated to useAuth
 * AC: #3 (Admin Access), #4 (Viewer Access)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { permissions } from '../lib/permissions';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Permission Utilities', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  describe('permissions object', () => {
    describe('canExport', () => {
      it('should return true for admin role', () => {
        expect(permissions.canExport('admin')).toBe(true);
      });

      it('should return false for viewer role', () => {
        expect(permissions.canExport('viewer')).toBe(false);
      });
    });

    describe('canAccessSettings', () => {
      it('should return true for admin role', () => {
        expect(permissions.canAccessSettings('admin')).toBe(true);
      });

      it('should return false for viewer role', () => {
        expect(permissions.canAccessSettings('viewer')).toBe(false);
      });
    });

    describe('canManageUsers', () => {
      it('should return true for admin role', () => {
        expect(permissions.canManageUsers('admin')).toBe(true);
      });

      it('should return false for viewer role', () => {
        expect(permissions.canManageUsers('viewer')).toBe(false);
      });
    });

    describe('isAdmin', () => {
      it('should return true for admin role', () => {
        expect(permissions.isAdmin('admin')).toBe(true);
      });

      it('should return false for viewer role', () => {
        expect(permissions.isAdmin('viewer')).toBe(false);
      });
    });

    describe('isViewer', () => {
      it('should return true for viewer role', () => {
        expect(permissions.isViewer('viewer')).toBe(true);
      });

      it('should return false for admin role', () => {
        expect(permissions.isViewer('admin')).toBe(false);
      });
    });
  });

  describe('usePermissions hook', () => {
    it('should return admin permissions for admin user', async () => {
      mockUseAuth.mockReturnValue({
        role: 'admin', isLoading: false, isAuthenticated: true, user: null,
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
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
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
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: false, user: null,
      });

      const { usePermissions } = await import('../lib/permissions');
      const { result } = renderHook(() => usePermissions());

      expect(result.current.role).toBe('viewer');
      expect(result.current.canExport).toBe(false);
      expect(result.current.canAccessSettings).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isViewer).toBe(true);
    });

    it('should default to viewer when auth has no role', async () => {
      mockUseAuth.mockReturnValue({
        role: undefined, isLoading: false, isAuthenticated: true, user: null,
      });

      const { usePermissions } = await import('../lib/permissions');
      const { result } = renderHook(() => usePermissions());

      expect(result.current.role).toBe('viewer');
      expect(result.current.canExport).toBe(false);
    });

    it('should return isLoading true when auth is loading', async () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: true, isAuthenticated: false, user: null,
      });

      const { usePermissions } = await import('../lib/permissions');
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return isLoading false when auth is loaded', async () => {
      mockUseAuth.mockReturnValue({
        role: 'admin', isLoading: false, isAuthenticated: true, user: null,
      });

      const { usePermissions } = await import('../lib/permissions');
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isLoading).toBe(false);
    });
  });
});
