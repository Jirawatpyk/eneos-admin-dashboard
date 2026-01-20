/**
 * Account Card Component
 * Story 7.1: User Profile (Consolidated)
 *
 * Combines Profile and Session information into a single card.
 * Displays user info, role, session status, and sign out functionality.
 *
 * AC#2: Profile Information Display - name, email, image, role
 * AC#3: Profile Card Layout - centered avatar, role badge
 * AC#4: Session Information - provider, status, expiry, sign out button
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Users, LogOut, Loader2 } from 'lucide-react';
import { ROLES, type Role } from '@/config/roles';

// Broadcast channel for multi-tab logout sync
const LOGOUT_CHANNEL = 'eneos-logout';

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

/**
 * Format session expiry date for display
 */
function formatExpiryDate(expiresString: string): string {
  try {
    const date = new Date(expiresString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown';
  }
}

export function AccountCard() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Handle sign out with loading state and multi-tab sync
  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      // Broadcast logout event to other tabs
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(LOGOUT_CHANNEL);
        channel.postMessage({ type: 'logout' });
        channel.close();
      }

      await signOut({ callbackUrl: '/login?signedOut=true' });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  }, []);

  // Listen for logout events from other tabs
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    const channel = new BroadcastChannel(LOGOUT_CHANNEL);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'logout') {
        window.location.href = '/login?signedOut=true';
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  if (!session?.user) return null;

  const { name, email, image, role } = session.user;
  const initials = getInitials(name);
  const roleConfig = getRoleBadgeConfig(role);
  const RoleIcon = roleConfig.icon;
  const isActive = status === 'authenticated';

  return (
    <Card data-testid="account-card">
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Section */}
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

        {/* Session Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Provider</span>
            <span data-testid="account-provider">Google</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span
              className={isActive ? 'text-green-600' : 'text-red-600'}
              data-testid="account-status"
            >
              {isActive ? 'Active' : 'Expired'}
            </span>
          </div>
          {session?.expires && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expires</span>
              <span data-testid="account-expires">
                {formatExpiryDate(session.expires)}
              </span>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
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
