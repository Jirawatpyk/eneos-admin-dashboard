'use client';

import { signOut } from 'next-auth/react';
import { useState, useCallback, useEffect } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Broadcast channel for multi-tab logout sync (AC6)
const LOGOUT_CHANNEL = 'eneos-logout';

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

/**
 * UserNav component with dropdown menu and logout functionality
 * Implements Story 1.4 requirements:
 * - AC1: Logout button visible in header
 * - AC2: Clicking logout triggers signOut()
 * - AC3: Session termination (handled by NextAuth)
 * - AC6: Multi-tab logout sync via BroadcastChannel
 * - AC7: Keyboard accessible
 */
export function UserNav({ user }: UserNavProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Get user initials for avatar fallback
  const getInitials = (name?: string | null): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle logout with multi-tab sync (AC2, AC6)
  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      // Broadcast logout event to other tabs (AC6)
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(LOGOUT_CHANNEL);
        channel.postMessage({ type: 'logout' });
        channel.close();
      }

      // Perform sign out (AC2, AC3)
      await signOut({ callbackUrl: '/login?signedOut=true' });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  }, []);

  // Listen for logout events from other tabs (AC6)
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    const channel = new BroadcastChannel(LOGOUT_CHANNEL);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'logout') {
        // Another tab logged out, redirect to login
        window.location.href = '/login?signedOut=true';
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full focus:ring-2 focus:ring-eneos-red focus:ring-offset-2"
          aria-label="Open user menu"
          data-testid="user-nav-trigger"
        >
          <Avatar className="h-10 w-10">
            {user.image && (
              <AvatarImage
                src={user.image}
                alt={user.name || 'User avatar'}
                referrerPolicy="no-referrer"
              />
            )}
            <AvatarFallback className="bg-eneos-red text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none" data-testid="user-name">
              {user.name || 'User'}
            </p>
            <p
              className="text-xs leading-none text-muted-foreground truncate"
              data-testid="user-email"
            >
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleSignOut}
          disabled={isLoading}
          data-testid="logout-menu-item"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="logout-spinner" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
