/**
 * Permission Utilities
 * Story 1.5: Role-based Access Control
 * Story 11-4: Migrated from NextAuth useSession to useAuth (AC-7)
 *
 * AC#3: Admin Access - can view, export, access settings
 * AC#4: Viewer Access - read-only, no export or settings
 */

'use client';

import { useAuth } from '@/hooks/use-auth';
import { Role, ROLES } from '../config/roles';

// ===========================================
// Permission Check Functions
// ===========================================

export const permissions = {
  canExport: (role: Role): boolean => role === ROLES.ADMIN,
  canAccessSettings: (role: Role): boolean => role === ROLES.ADMIN,
  canManageUsers: (role: Role): boolean => role === ROLES.ADMIN,
  isAdmin: (role: Role): boolean => role === ROLES.ADMIN,
  isViewer: (role: Role): boolean => role === ROLES.VIEWER,
};

// ===========================================
// Permission Hook Type
// ===========================================

export interface PermissionsResult {
  role: Role;
  canExport: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  isLoading: boolean;
}

// ===========================================
// Permission Hook
// ===========================================

export function usePermissions(): PermissionsResult {
  const { role: authRole, isLoading } = useAuth();

  const role: Role = authRole || ROLES.VIEWER;

  return {
    role,
    canExport: permissions.canExport(role),
    canAccessSettings: permissions.canAccessSettings(role),
    canManageUsers: permissions.canManageUsers(role),
    isAdmin: permissions.isAdmin(role),
    isViewer: permissions.isViewer(role),
    isLoading,
  };
}
