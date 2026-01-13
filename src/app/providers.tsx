'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers wrapper
 * Configures:
 * - SessionProvider for authentication
 * - QueryClientProvider for TanStack Query v5
 */
export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance per component lifecycle to prevent memory leaks
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute (rate limit aware: 300 req/min)
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider
        refetchInterval={5 * 60} // Check session every 5 minutes
        refetchOnWindowFocus={true} // Sync across tabs
        refetchWhenOffline={false} // Don't try to refresh when offline
      >
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );
}
