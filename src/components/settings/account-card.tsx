/**
 * Account Card Component
 * Story 7.1 / Story 11-4: Migrated to Supabase Auth (AC-5)
 */
'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, LogOut, Loader2 } from 'lucide-react';
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

export function AccountCard() {
  const { user, role, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login?signedOut=true');
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  }, [supabase, router]);

  if (!user) return null;

  const name = user.user_metadata?.name || user.email;
  const email = user.email;
  const image = user.user_metadata?.avatar_url || null;
  const initials = getInitials(name);
  const roleConfig = getRoleBadgeConfig(role as Role);
  const RoleIcon = roleConfig.icon;
  const provider = user.app_metadata?.provider || 'email';
  const providerDisplay = provider === 'google' ? 'Google' : 'Email';

  return (
    <Card data-testid="account-card">
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-16 w-16" data-testid="account-avatar">
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
            <p className="text-lg font-medium" data-testid="account-name">
              {name || 'User'}
            </p>
            <p className="text-sm text-muted-foreground" data-testid="account-email">
              {email}
            </p>
          </div>
          <Badge variant={roleConfig.variant} data-testid="account-role-badge">
            <RoleIcon className="mr-1 h-3 w-3" />
            {roleConfig.label}
          </Badge>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Provider</span>
            <span data-testid="account-provider">{providerDisplay}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span
              className={isAuthenticated ? 'text-green-600' : 'text-red-600'}
              data-testid="account-status"
            >
              {isAuthenticated ? 'Active' : 'Expired'}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
          disabled={isLoading}
          data-testid="btn-sign-out"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="sign-out-spinner" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>{isLoading ? 'Signing out...' : 'Sign Out'}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
