/**
 * Profile Card Component
 * Story 7.1 / Story 11-4: Migrated to Supabase Auth
 */
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye } from 'lucide-react';
import { ROLES, type Role } from '@/config/roles';

function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeConfig(role?: Role) {
  switch (role) {
    case ROLES.ADMIN:
      return { variant: 'default' as const, icon: Shield, label: 'Admin' };
    case ROLES.VIEWER:
    default:
      return { variant: 'secondary' as const, icon: Eye, label: 'Viewer' };
  }
}

export function ProfileCard() {
  const { user, role } = useAuth();

  if (!user) return null;

  const name = user.user_metadata?.name || user.email;
  const email = user.email;
  const image = user.user_metadata?.avatar_url || null;
  const initials = getInitials(name);
  const roleConfig = getRoleBadgeConfig(role as Role);
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
