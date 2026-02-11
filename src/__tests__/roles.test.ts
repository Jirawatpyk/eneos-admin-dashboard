/**
 * Role Configuration Tests
 * Story 11-1: Role Simplification (AC#5)
 *
 * Manager role removed — only admin and viewer remain.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Role Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('ROLES constant', () => {
    it('should define ADMIN and VIEWER roles', async () => {
      const { ROLES } = await import('../config/roles');

      expect(ROLES).toBeDefined();
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.VIEWER).toBe('viewer');
    });

    it('should have two roles (admin and viewer)', async () => {
      const { ROLES } = await import('../config/roles');

      const roleValues = Object.values(ROLES);
      expect(roleValues).toHaveLength(2);
      expect(roleValues).toContain('admin');
      expect(roleValues).toContain('viewer');
    });

    it('should NOT have manager role (D4b decision)', async () => {
      const { ROLES } = await import('../config/roles');

      const roleValues = Object.values(ROLES);
      expect(roleValues).not.toContain('manager');
      expect((ROLES as Record<string, string>).MANAGER).toBeUndefined();
    });
  });

  describe('Role type', () => {
    it('should export Role type that matches ROLES values', async () => {
      const { ROLES } = await import('../config/roles');

      const adminRole: (typeof ROLES)[keyof typeof ROLES] = 'admin';
      const viewerRole: (typeof ROLES)[keyof typeof ROLES] = 'viewer';

      expect(adminRole).toBe(ROLES.ADMIN);
      expect(viewerRole).toBe(ROLES.VIEWER);
    });
  });

  describe('getUserRole', () => {
    it('should return "admin" for emails in ADMIN_EMAILS env var', async () => {
      vi.stubEnv('ADMIN_EMAILS', 'admin@eneos.co.th,lead@eneos.co.th');

      const { getUserRole, ROLES } = await import('../config/roles');

      expect(getUserRole('admin@eneos.co.th')).toBe(ROLES.ADMIN);
      expect(getUserRole('lead@eneos.co.th')).toBe(ROLES.ADMIN);
    });

    it('should return "viewer" as default for non-admin emails', async () => {
      vi.stubEnv('ADMIN_EMAILS', 'admin@eneos.co.th');

      const { getUserRole, ROLES } = await import('../config/roles');

      expect(getUserRole('user@eneos.co.th')).toBe(ROLES.VIEWER);
      expect(getUserRole('sales@eneos.co.th')).toBe(ROLES.VIEWER);
    });

    it('should be case-insensitive for email matching', async () => {
      vi.stubEnv('ADMIN_EMAILS', 'Admin@eneos.co.th');

      const { getUserRole, ROLES } = await import('../config/roles');

      expect(getUserRole('admin@eneos.co.th')).toBe(ROLES.ADMIN);
      expect(getUserRole('ADMIN@ENEOS.CO.TH')).toBe(ROLES.ADMIN);
      expect(getUserRole('Admin@Eneos.Co.Th')).toBe(ROLES.ADMIN);
    });

    it('should return "viewer" for empty email', async () => {
      const { getUserRole, ROLES } = await import('../config/roles');

      expect(getUserRole('')).toBe(ROLES.VIEWER);
    });

    it('should handle missing ADMIN_EMAILS env var', async () => {
      vi.stubEnv('ADMIN_EMAILS', '');

      const { getUserRole, ROLES } = await import('../config/roles');

      expect(getUserRole('anyone@eneos.co.th')).toBe(ROLES.VIEWER);
    });

    it('should handle whitespace in ADMIN_EMAILS', async () => {
      vi.stubEnv('ADMIN_EMAILS', '  admin@eneos.co.th , lead@eneos.co.th  ');

      const { getUserRole, ROLES } = await import('../config/roles');

      expect(getUserRole('admin@eneos.co.th')).toBe(ROLES.ADMIN);
      expect(getUserRole('lead@eneos.co.th')).toBe(ROLES.ADMIN);
    });
  });

  describe('isAdmin helper', () => {
    it('should return true for admin role', async () => {
      const { isAdmin, ROLES } = await import('../config/roles');

      expect(isAdmin(ROLES.ADMIN)).toBe(true);
    });

    it('should return false for viewer role', async () => {
      const { isAdmin, ROLES } = await import('../config/roles');

      expect(isAdmin(ROLES.VIEWER)).toBe(false);
    });
  });

  describe('isViewer helper', () => {
    it('should return true for viewer role', async () => {
      const { isViewer, ROLES } = await import('../config/roles');

      expect(isViewer(ROLES.VIEWER)).toBe(true);
    });

    it('should return false for admin role', async () => {
      const { isViewer, ROLES } = await import('../config/roles');

      expect(isViewer(ROLES.ADMIN)).toBe(false);
    });
  });

  describe('getRoleDisplayName helper', () => {
    it('should return "Admin" for admin role', async () => {
      const { getRoleDisplayName, ROLES } = await import('../config/roles');

      expect(getRoleDisplayName(ROLES.ADMIN)).toBe('Admin');
    });

    it('should return "Viewer" for viewer role', async () => {
      const { getRoleDisplayName, ROLES } = await import('../config/roles');

      expect(getRoleDisplayName(ROLES.VIEWER)).toBe('Viewer');
    });

    it('should return "Unknown" for invalid role', async () => {
      const { getRoleDisplayName } = await import('../config/roles');

      // @ts-expect-error - Testing invalid input
      expect(getRoleDisplayName('invalid')).toBe('Unknown');
    });
  });
});
