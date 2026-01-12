/**
 * RoleGate Component
 * Story 1.5: Role-based Access Control
 *
 * AC#3: Admin can see all features
 * AC#4: Viewer sees restricted UI with tooltips
 */

'use client';

import { useSession } from 'next-auth/react';
import { Role, ROLES } from '@/config/roles';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

// ===========================================
// Types
// ===========================================

export interface RoleGateProps {
  /** Roles that are allowed to see the children */
  allowedRoles: Role[];
  /** Content to render when user has required role */
  children: React.ReactNode;
  /** Content to render when user does NOT have required role */
  fallback?: React.ReactNode;
  /** Whether to show tooltip on fallback element */
  showTooltip?: boolean;
  /** Tooltip message (AC#4: "Contact admin for export access") */
  tooltipMessage?: string;
}

// ===========================================
// RoleGate Component
// ===========================================

/**
 * Conditional rendering based on user role
 *
 * @example
 * // Show export button only to admins
 * <RoleGate allowedRoles={['admin']}>
 *   <ExportButton />
 * </RoleGate>
 *
 * @example
 * // Show disabled button with tooltip to viewers
 * <RoleGate
 *   allowedRoles={['admin']}
 *   fallback={<Button disabled>Export</Button>}
 *   showTooltip={true}
 *   tooltipMessage="Contact admin for export access"
 * >
 *   <ExportButton />
 * </RoleGate>
 */
export function RoleGate({
  allowedRoles,
  children,
  fallback = null,
  showTooltip = false,
  tooltipMessage = 'Contact admin for export access',
}: RoleGateProps) {
  const { data: session } = useSession();

  // Default to viewer role for safety (AC#1)
  const userRole: Role = (session?.user?.role as Role) || ROLES.VIEWER;

  // Check if user has an allowed role
  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  // User doesn't have required role - show fallback with optional tooltip
  if (showTooltip && fallback) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-not-allowed">{fallback}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <>{fallback}</>;
}

// ===========================================
// Convenience Components
// ===========================================

/**
 * Show content only to admins
 */
export function AdminOnly({
  children,
  fallback,
  showTooltip,
  tooltipMessage,
}: Omit<RoleGateProps, 'allowedRoles'>) {
  return (
    <RoleGate
      allowedRoles={[ROLES.ADMIN]}
      fallback={fallback}
      showTooltip={showTooltip}
      tooltipMessage={tooltipMessage}
    >
      {children}
    </RoleGate>
  );
}
