/**
 * Profile Card Component
 * Story 7.1: User Profile
 *
 * Displays user profile information from Google OAuth session.
 *
 * AC#2: Profile Information Display - name, email, image, role
 * AC#3: Profile Card Layout - centered avatar, role badge
 */
'use client';

import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Users } from 'lucide-react';
import { ROLES, type Role } from '@/config/roles';

/**
 * Get user initials for avatar fallback
 */
function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get role badge configuration
 */
function getRoleBadgeConfig(role?: Role) {
  switch (role) {
    case ROLES.ADMIN:
      return {
        variant: 'default' as const,
        icon: Shield,
        label: 'Admin',
      };
    case ROLES.MANAGER:
      return {
        variant: 'default' as const,
        icon: Users,
        label: 'Manager',
      };
    case ROLES.VIEWER:
    default:
      return {
        variant: 'secondary' as const,
        icon: Eye,
        label: 'Viewer',
      };
  }
}

export function ProfileCard() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const { name, email, image, role } = session.user;
  const initials = getInitials(name);
  const roleConfig = getRoleBadgeConfig(role);
  const RoleIcon = roleConfig.icon;

  return (
    <Card data-testid="profile-card">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Avatar className="h-16 w-16" data-testid="profile-avatar">
          <AvatarImage
            src={image || undefined}
            alt={name || 'User'}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="bg-eneos-red text-white text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center space-y-1">
          <p className="text-lg font-medium" data-testid="profile-name">
            {name || 'User'}
          </p>
          <p className="text-sm text-muted-foreground" data-testid="profile-email">
            {email}
          </p>
        </div>
        <Badge variant={roleConfig.variant} data-testid="profile-role-badge">
          <RoleIcon className="mr-1 h-3 w-3" />
          {roleConfig.label}
        </Badge>
      </CardContent>
    </Card>
  );
}
