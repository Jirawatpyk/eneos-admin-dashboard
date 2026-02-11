/**
 * RoleGate Component
 * Story 1.5: Role-based Access Control
 * Story 11-4: Migrated from NextAuth useSession to useAuth
 */

'use client';

import { useAuth } from '@/hooks/use-auth';
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
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

// ===========================================
// RoleGate Component
// ===========================================

export function RoleGate({
  allowedRoles,
  children,
  fallback = null,
  showTooltip = false,
  tooltipMessage = 'Contact admin for export access',
}: RoleGateProps) {
  const { role: authRole } = useAuth();

  const userRole: Role = (authRole as Role) || ROLES.VIEWER;

  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

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
