'use client';

import { useAuth } from '@/hooks/use-auth';

/**
 * Session expiry warning component (AC-6)
 * Simplified: Supabase handles auto-refresh via onAuthStateChange TOKEN_REFRESHED.
 * This component now only ensures unauthenticated users are not stuck on protected pages.
 */
export function SessionWarning() {
  const { isAuthenticated, isLoading } = useAuth();

  // Supabase handles token refresh automatically.
  // If auth state goes to unauthenticated, the SupabaseAuthListener in providers.tsx
  // will handle the redirect. No complex timer logic needed.

  if (!isLoading && !isAuthenticated) {
    // Edge case: if somehow user is on a protected page without auth,
    // the proxy and layout already handle redirects. Nothing to do here.
    return null;
  }

  return null;
}
