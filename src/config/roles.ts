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
// Legacy Role Configuration (Deprecated)
// ===========================================

/**
 * Parse admin emails from environment variable
 *
 * @deprecated Use Backend API (fetchRoleFromBackend in auth.ts) instead.
 */
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';

  if (!adminEmailsEnv.trim()) {
    return [];
  }

  return adminEmailsEnv
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Get user role based on email from ADMIN_EMAILS env var
 *
 * @deprecated Role is now fetched from Backend API during login.
 */
export function getUserRole(email: string): Role {
  if (!email) {
    return ROLES.VIEWER;
  }

  const adminEmails = getAdminEmails();
  const normalizedEmail = email.toLowerCase();

  if (adminEmails.includes(normalizedEmail)) {
    return ROLES.ADMIN;
  }

  return ROLES.VIEWER;
}

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
