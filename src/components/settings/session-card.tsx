/**
 * Session Card Component
 * Story 7.1 / Story 11-4: Migrated to Supabase Auth (AC-5)
 */
'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Loader2 } from 'lucide-react';

export function SessionCard() {
  const { user, isAuthenticated } = useAuth();
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
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router]);

  if (!user) return null;

  // Determine provider from user metadata
  const provider = user.app_metadata?.provider || 'email';
  const providerDisplay = provider === 'google' ? 'Google' : 'Email';

  return (
    <Card data-testid="session-card">
      <CardHeader>
        <CardTitle>Session</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Provider</span>
            <span data-testid="session-provider">{providerDisplay}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span
              className={isAuthenticated ? 'text-green-600' : 'text-red-600'}
              data-testid="session-status"
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
