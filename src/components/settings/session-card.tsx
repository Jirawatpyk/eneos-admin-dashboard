/**
 * Session Card Component
 * Story 7.1: User Profile
 *
 * Displays session information and sign out functionality.
 *
 * AC#4: Session Information - provider, status, expiry, sign out button
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Loader2 } from 'lucide-react';

// Broadcast channel for multi-tab logout sync (consistent with UserNav)
const LOGOUT_CHANNEL = 'eneos-logout';

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

export function SessionCard() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Handle sign out with loading state and multi-tab sync (M1, M3, M4)
  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      // Broadcast logout event to other tabs (consistent with UserNav)
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(LOGOUT_CHANNEL);
        channel.postMessage({ type: 'logout' });
        channel.close();
      }

      // Perform sign out with correct callback URL (M3)
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

  // Return null when no session (M2 - consistent with ProfileCard)
  if (!session?.user) return null;

  const isActive = status === 'authenticated';

  return (
    <Card data-testid="session-card">
      <CardHeader>
        <CardTitle>Session</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {/* Provider */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Provider</span>
            <span data-testid="session-provider">Google</span>
          </div>

          {/* Status */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span
              className={isActive ? 'text-green-600' : 'text-red-600'}
              data-testid="session-status"
            >
              {isActive ? 'Active' : 'Expired'}
            </span>
          </div>

          {/* Expiry */}
          {session?.expires && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expires</span>
              <span data-testid="session-expires">
                {formatExpiryDate(session.expires)}
              </span>
            </div>
          )}
        </div>

        {/* Sign Out Button with loading state (M1) */}
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
