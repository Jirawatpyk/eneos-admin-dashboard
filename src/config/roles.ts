/**
 * Role Configuration
 * Story 1.5: Role-based Access Control
 *
 * Defines roles and role-based access for the admin dashboard.
 * Three roles: admin (full access), manager (elevated access), viewer (read-only)
 *
 * AC#1: Role Definition - admin, manager, and viewer roles
 * AC#2: Role Storage - fetched from Backend API (Google Sheets Sales_Team)
 *
 * Note: Role is determined during login via fetchRoleFromBackend() in auth.ts
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
  MANAGER: 'manager',
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
 * Format: comma-separated list of emails
 *
 * @deprecated Use Backend API (fetchRoleFromBackend in auth.ts) instead.
 * This function is kept for backwards compatibility only.
 *
 * @example
 * ADMIN_EMAILS=admin@eneos.co.th,manager@eneos.co.th
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

// ===========================================
// Legacy Role Resolution (Deprecated)
// ===========================================

/**
 * Get user role based on email from ADMIN_EMAILS env var
 *
 * @deprecated Role is now fetched from Backend API during login.
 * See fetchRoleFromBackend() in auth.ts for the current implementation.
 * This function is kept for backwards compatibility and testing only.
 *
 * @param email - User email address
 * @returns User role (admin or viewer - does NOT support manager)
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
 * Check if role has manager-level access or higher
 * Returns true for both 'admin' and 'manager' roles
 *
 * @param role - User role to check
 * @returns true if role is admin or manager
 */
export function isManager(role: Role): boolean {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
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
    case ROLES.MANAGER:
      return 'Manager';
    case ROLES.VIEWER:
      return 'Viewer';
    default:
      return 'Unknown';
  }
}
