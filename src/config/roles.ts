/**
 * Role Configuration
 * Story 1.5: Role-based Access Control
 *
 * Defines roles and role-based access for the admin dashboard.
 * Two roles: admin (full access) and viewer (read-only)
 *
 * AC#1: Role Definition - admin and viewer roles
 * AC#2: Role Storage - role mapping via ADMIN_EMAILS env var
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
// Role Configuration
// ===========================================

/**
 * Parse admin emails from environment variable
 * Format: comma-separated list of emails
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
// Role Resolution Functions
// ===========================================

/**
 * Get user role based on email
 *
 * AC#1: Default role for new users is "viewer"
 * AC#2: Role is fetched from ADMIN_EMAILS configuration
 *
 * @param email - User email address
 * @returns User role (admin or viewer)
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
