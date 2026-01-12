/**
 * Permission Utilities
 * Story 1.5: Role-based Access Control
 *
 * AC#3: Admin Access - can view, export, access settings
 * AC#4: Viewer Access - read-only, no export or settings
 */

'use client';

import { useSession } from 'next-auth/react';
import { Role, ROLES } from '../config/roles';

// ===========================================
// Permission Check Functions
// ===========================================

/**
 * Permission check functions for role-based access control
 *
 * AC#3: Admin can export, access settings, manage users
 * AC#4: Viewer can only view (read-only)
 */
export const permissions = {
  /**
   * Check if user can export data (Excel, CSV, PDF)
   * AC#3: Admin can export
   * AC#4: Viewer cannot export
   */
  canExport: (role: Role): boolean => role === ROLES.ADMIN,

  /**
   * Check if user can access settings/configuration pages
   * AC#3: Admin can access settings
   * AC#4: Viewer cannot access settings
   */
  canAccessSettings: (role: Role): boolean => role === ROLES.ADMIN,

  /**
   * Check if user can manage other users (future feature)
   * AC#3: Admin can manage users
   */
  canManageUsers: (role: Role): boolean => role === ROLES.ADMIN,

  /**
   * Check if user has admin role
   */
  isAdmin: (role: Role): boolean => role === ROLES.ADMIN,

  /**
   * Check if user has viewer role
   */
  isViewer: (role: Role): boolean => role === ROLES.VIEWER,
};

// ===========================================
// Permission Hook Type
// ===========================================

export interface PermissionsResult {
  /** Current user role */
  role: Role;
  /** Whether user can export data */
  canExport: boolean;
  /** Whether user can access settings */
  canAccessSettings: boolean;
  /** Whether user can manage users */
  canManageUsers: boolean;
  /** Whether user is admin */
  isAdmin: boolean;
  /** Whether user is viewer */
  isViewer: boolean;
  /** Whether session is loading */
  isLoading: boolean;
}

// ===========================================
// Permission Hook
// ===========================================

/**
 * React hook for permission checks in components
 *
 * Uses the current session to determine user permissions.
 * Defaults to viewer role if no session or role is available.
 *
 * @returns Permission check results
 *
 * @example
 * ```tsx
 * function ExportButton() {
 *   const { canExport, isLoading } = usePermissions();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!canExport) return null;
 *
 *   return <Button onClick={handleExport}>Export</Button>;
 * }
 * ```
 */
export function usePermissions(): PermissionsResult {
  const { data: session, status } = useSession();

  // Get role from session, default to viewer
  const role: Role = (session?.user?.role as Role) || ROLES.VIEWER;
  const isLoading = status === 'loading';

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
