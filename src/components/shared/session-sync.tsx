'use client';

import { useSessionSync } from '@/hooks/use-session-sync';

/**
 * Session synchronization component (AC6)
 * Handles multi-tab session sync via BroadcastChannel
 * This component renders nothing but sets up the sync listeners
 */
export function SessionSync() {
  // Initialize session sync - this sets up BroadcastChannel listeners
  useSessionSync();

  // This component only sets up listeners, doesn't render anything
  return null;
}
