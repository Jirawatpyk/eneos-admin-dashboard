'use client';

import { useSessionSync } from '@/hooks/use-session-sync';

/**
 * Session synchronization component (AC-3)
 * Handles multi-tab session sync via Supabase onAuthStateChange
 * This component renders nothing but sets up the sync listeners
 */
export function SessionSync() {
  useSessionSync();
  return null;
}
