'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

const CHANNEL_NAME = 'eneos-session-sync';

type SessionSyncMessage = {
  type: 'SESSION_EXPIRED' | 'LOGOUT' | 'SESSION_REFRESHED';
  timestamp: number;
};

/**
 * Hook for instant multi-tab session synchronization (AC6)
 * Uses BroadcastChannel API for real-time communication between tabs
 */
export function useSessionSync() {
  const { data: session, status } = useSession();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastExpiresAtRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // BroadcastChannel is not available in all environments (e.g., SSR, some browsers)
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    // Create channel
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);

    // Handle messages from other tabs
    const handleMessage = (event: MessageEvent<SessionSyncMessage>) => {
      const { type } = event.data;

      switch (type) {
        case 'SESSION_EXPIRED':
        case 'LOGOUT':
          // Redirect to login when another tab logs out or session expires
          window.location.href = '/login?error=SessionExpired';
          break;
        case 'SESSION_REFRESHED':
          // Trigger a session refresh in this tab
          window.location.reload();
          break;
      }
    };

    channelRef.current.addEventListener('message', handleMessage);

    return () => {
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
    };
  }, []);

  // Broadcast when session state changes
  useEffect(() => {
    if (!channelRef.current) return;

    // Detect logout (was authenticated, now not)
    if (status === 'unauthenticated' && lastExpiresAtRef.current !== undefined) {
      channelRef.current.postMessage({
        type: 'LOGOUT',
        timestamp: Date.now(),
      } as SessionSyncMessage);
    }

    // Detect session refresh (expiresAt changed to a later time)
    if (session?.expiresAt && lastExpiresAtRef.current !== undefined) {
      if (session.expiresAt > lastExpiresAtRef.current) {
        channelRef.current.postMessage({
          type: 'SESSION_REFRESHED',
          timestamp: Date.now(),
        } as SessionSyncMessage);
      }
    }

    // Track expiresAt for comparison
    lastExpiresAtRef.current = session?.expiresAt;
  }, [session?.expiresAt, status]);

  /**
   * Call this function to broadcast session expiry to other tabs
   */
  const broadcastSessionExpired = () => {
    channelRef.current?.postMessage({
      type: 'SESSION_EXPIRED',
      timestamp: Date.now(),
    } as SessionSyncMessage);
  };

  /**
   * Call this function when logging out to notify other tabs
   */
  const broadcastLogout = async () => {
    channelRef.current?.postMessage({
      type: 'LOGOUT',
      timestamp: Date.now(),
    } as SessionSyncMessage);
    await signOut({ callbackUrl: '/login' });
  };

  return {
    broadcastSessionExpired,
    broadcastLogout,
  };
}
