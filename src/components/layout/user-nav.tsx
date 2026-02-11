'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';
import { LogOut, Loader2, Shield, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ROLES, type Role } from '@/config/roles';
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

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: Role;
  };
}

/**
 * UserNav component with dropdown menu and logout functionality (AC-5)
 * Uses Supabase signOut() instead of NextAuth.
 * Multi-tab logout sync handled by SupabaseAuthListener (onAuthStateChange).
 */
export function UserNav({ user }: UserNavProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const getInitials = (name?: string | null): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login?signedOut=true');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router]);

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
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none truncate max-w-[180px]" data-testid="user-name">
                {user.name || 'User'}
              </p>
              <Badge
                variant={user.role === ROLES.ADMIN ? 'default' : 'secondary'}
                className="text-[10px] px-1.5 py-0"
                data-testid="user-role-badge"
              >
                {user.role === ROLES.ADMIN ? (
                  <>
                    <Shield className="w-3 h-3 mr-0.5" />
                    Admin
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-0.5" />
                    Viewer
                  </>
                )}
              </Badge>
            </div>
            <p
              className="text-xs leading-none text-muted-foreground"
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
