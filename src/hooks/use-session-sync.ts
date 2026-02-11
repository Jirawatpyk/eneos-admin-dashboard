'use client';

import { useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

/**
 * Hook for multi-tab session synchronization (AC-3)
 * Uses Supabase onAuthStateChange for cross-tab sync via cookies.
 * SIGNED_OUT event → redirect to /login in all tabs.
 */
export function useSessionSync() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login?signedOut=true');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase]);
}
