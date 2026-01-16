/**
 * Role Configuration Tests
 * Story 1.5: Role-based Access Control
 * AC: #1, #2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Tests for role configuration
describe('Role Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('ROLES constant', () => {
    it('should define ADMIN, MANAGER and VIEWER roles', async () => {
      const { ROLES } = await import('../config/roles');

      expect(ROLES).toBeDefined();
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.MANAGER).toBe('manager');
      expect(ROLES.VIEWER).toBe('viewer');
    });

    it('should have three roles (admin, manager and viewer)', async () => {
      const { ROLES } = await import('../config/roles');

      const roleValues = Object.values(ROLES);
      expect(roleValues).toHaveLength(3);
      expect(roleValues).toContain('admin');
      expect(roleValues).toContain('manager');
      expect(roleValues).toContain('viewer');
    });
  });

  describe('Role type', () => {
    it('should export Role type that matches ROLES values', async () => {
      const { ROLES } = await import('../config/roles');

      // Type check - verify ROLES values are strings
      const adminRole: (typeof ROLES)[keyof typeof ROLES] = 'admin';
      const viewerRole: (typeof ROLES)[keyof typeof ROLES] = 'viewer';

      expect(adminRole).toBe(ROLES.ADMIN);
      expect(viewerRole).toBe(ROLES.VIEWER);
    });
  });

  describe('getUserRole', () => {
    it('should return "admin" for emails in ADMIN_EMAILS env var', async () => {
      // Set up env before importing
      vi.stubEnv('ADMIN_EMAILS', 'admin@eneos.co.th,manager@eneos.co.th');

      const { getUserRole, ROLES } = await import('../config/roles');

      expect(getUserRole('admin@eneos.co.th')).toBe(ROLES.ADMIN);
      expect(getUserRole('manager@eneos.co.th')).toBe(ROLES.ADMIN);
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

      // All users should be viewers if no admins configured
      expect(getUserRole('anyone@eneos.co.th')).toBe(ROLES.VIEWER);
    });

    it('should handle whitespace in ADMIN_EMAILS', async () => {
      vi.stubEnv('ADMIN_EMAILS', '  admin@eneos.co.th , manager@eneos.co.th  ');

      const { getUserRole, ROLES } = await import('../config/roles');

      expect(getUserRole('admin@eneos.co.th')).toBe(ROLES.ADMIN);
      expect(getUserRole('manager@eneos.co.th')).toBe(ROLES.ADMIN);
    });
  });

  describe('isAdmin helper', () => {
    it('should return true for admin role', async () => {
      const { isAdmin, ROLES } = await import('../config/roles');

      expect(isAdmin(ROLES.ADMIN)).toBe(true);
    });

    it('should return false for manager role', async () => {
      const { isAdmin, ROLES } = await import('../config/roles');

      expect(isAdmin(ROLES.MANAGER)).toBe(false);
    });

    it('should return false for viewer role', async () => {
      const { isAdmin, ROLES } = await import('../config/roles');

      expect(isAdmin(ROLES.VIEWER)).toBe(false);
    });
  });

  describe('isManager helper', () => {
    it('should return true for admin role', async () => {
      const { isManager, ROLES } = await import('../config/roles');

      expect(isManager(ROLES.ADMIN)).toBe(true);
    });

    it('should return true for manager role', async () => {
      const { isManager, ROLES } = await import('../config/roles');

      expect(isManager(ROLES.MANAGER)).toBe(true);
    });

    it('should return false for viewer role', async () => {
      const { isManager, ROLES } = await import('../config/roles');

      expect(isManager(ROLES.VIEWER)).toBe(false);
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

    it('should return false for manager role', async () => {
      const { isViewer, ROLES } = await import('../config/roles');

      expect(isViewer(ROLES.MANAGER)).toBe(false);
    });
  });

  describe('getRoleDisplayName helper', () => {
    it('should return "Admin" for admin role', async () => {
      const { getRoleDisplayName, ROLES } = await import('../config/roles');

      expect(getRoleDisplayName(ROLES.ADMIN)).toBe('Admin');
    });

    it('should return "Manager" for manager role', async () => {
      const { getRoleDisplayName, ROLES } = await import('../config/roles');

      expect(getRoleDisplayName(ROLES.MANAGER)).toBe('Manager');
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
