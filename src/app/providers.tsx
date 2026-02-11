'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ReactNode, useState, useEffect, useMemo } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Supabase Auth Listener (AC-2)
 * Listens for auth state changes and handles:
 * - SIGNED_OUT → redirect to /login (multi-tab sync via Supabase cookies)
 * - TOKEN_REFRESHED → refresh router to pick up new session
 */
function SupabaseAuthListener({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login?signedOut=true');
        }
        if (event === 'TOKEN_REFRESHED') {
          router.refresh();
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [router, supabase]);

  return <>{children}</>;
}

/**
 * Application providers wrapper
 * Configures:
 * - ThemeProvider for light/dark mode (Story 7.2)
 * - SupabaseAuthListener for auth state management (Story 11-4 AC-2)
 * - QueryClientProvider for TanStack Query v5
 * - TooltipProvider for Radix UI tooltips
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <SupabaseAuthListener>
          <TooltipProvider delayDuration={300}>
            {children}
          </TooltipProvider>
        </SupabaseAuthListener>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
