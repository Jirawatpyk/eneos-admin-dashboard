'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const FIVE_MINUTES_IN_SECONDS = 5 * 60;
const CHECK_INTERVAL_MS = 30 * 1000; // Check every 30 seconds
const SIGNOUT_DELAY_MS = 2000; // Delay before signOut to allow toast to be shown

/**
 * Session expiry warning component (AC3)
 * Shows a toast notification when session has < 5 minutes remaining
 * Also handles session errors (e.g., RefreshTokenError) by redirecting to login
 */
export function SessionWarning() {
  const { data: session } = useSession();
  const warningShownRef = useRef(false);
  const errorHandledRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle session errors (e.g., token refresh failed)
  useEffect(() => {
    if (session?.error && !errorHandledRef.current) {
      errorHandledRef.current = true;
      console.warn('[SessionWarning] Session error detected:', session.error);

      toast({
        title: 'Session Error',
        description: 'Your session has expired. Please login again.',
        variant: 'destructive',
        duration: 5000,
      });

      // Sign out and redirect to login after toast is shown
      setTimeout(() => {
        signOut({ callbackUrl: '/login?error=SessionExpired' });
      }, SIGNOUT_DELAY_MS);
    }
  }, [session?.error]);

  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Don't set up if no session or no expiresAt
    if (!session?.expiresAt) {
      return;
    }

    const checkExpiry = () => {
      if (!session?.expiresAt) return;

      const now = Math.floor(Date.now() / 1000);
      const timeLeft = session.expiresAt - now;

      // Show warning if within 5 minutes and not already shown
      if (timeLeft > 0 && timeLeft <= FIVE_MINUTES_IN_SECONDS && !warningShownRef.current) {
        warningShownRef.current = true;
        const minutesLeft = Math.ceil(timeLeft / 60);

        toast({
          title: 'Session Expiring Soon',
          description: `Your session will expire in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Extend Session
            </Button>
          ),
          duration: Infinity, // Don't auto-dismiss
        });
      }
    };

    // Check immediately
    checkExpiry();

    // Set up interval to check periodically
    intervalRef.current = setInterval(checkExpiry, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session?.expiresAt]);

  // Reset warning flag when session changes (e.g., after refresh)
  useEffect(() => {
    if (session?.expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = session.expiresAt - now;

      // If session has been refreshed (more than 5 minutes remaining), reset warning
      if (timeLeft > FIVE_MINUTES_IN_SECONDS) {
        warningShownRef.current = false;
      }
    }
  }, [session?.expiresAt]);

  // This component only shows toasts, doesn't render anything
  return null;
}
