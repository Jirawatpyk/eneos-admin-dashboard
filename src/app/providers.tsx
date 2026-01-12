'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers wrapper
 * Configures SessionProvider for:
 * - Auto-refresh every 5 minutes (AC2)
 * - Tab sync on window focus (AC6)
 * - Skip refresh when offline
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Check session every 5 minutes
      refetchOnWindowFocus={true} // Sync across tabs (AC6)
      refetchWhenOffline={false} // Don't try to refresh when offline
    >
      {children}
    </SessionProvider>
  );
}
