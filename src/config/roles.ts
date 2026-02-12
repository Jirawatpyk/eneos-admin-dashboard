/**
 * Role Configuration
 * Story 11-1: Role Simplification (AC#5)
 *
 * Defines roles and role-based access for the admin dashboard.
 * Two roles: admin (full access), viewer (read-only)
 * Manager role removed per D4b decision.
 */

// ===========================================
// Role Definitions
// ===========================================

/**
 * Available roles in the system
 * Matches backend UserRole type for consistency
 */
export const ROLES = {
  ADMIN: 'admin',
  VIEWER: 'viewer',
} as const;

/**
 * Role type derived from ROLES constant
 * Use this for type-safe role handling
 */
export type Role = (typeof ROLES)[keyof typeof ROLES];

// ===========================================
// Role Helper Functions
// ===========================================

/**
 * Check if role is admin
 */
export function isAdmin(role: Role): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if role is viewer
 */
export function isViewer(role: Role): boolean {
  return role === ROLES.VIEWER;
}

/**
 * Get role display name for UI
 */
export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case ROLES.ADMIN:
      return 'Admin';
    case ROLES.VIEWER:
      return 'Viewer';
    default:
      return 'Unknown';
  }
}
