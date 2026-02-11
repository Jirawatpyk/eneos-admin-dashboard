/**
 * Session Sync Tests
 * Story 11-4: Migrated to Supabase onAuthStateChange (AC-3)
 *
 * The hook now uses Supabase onAuthStateChange for cross-tab sync.
 * SIGNED_OUT event → redirect to /login?signedOut=true
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock Supabase client
const mockUnsubscribe = vi.fn();
let authStateCallback: ((event: string, session: unknown) => void) | null = null;

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: vi.fn((callback: (event: string, session: unknown) => void) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }),
    },
  }),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Import after mocks
import { useSessionSync } from '@/hooks/use-session-sync';

describe('useSessionSync - Story 11-4: Supabase Auth Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set up onAuthStateChange listener on mount', () => {
    const { unmount } = renderHook(() => useSessionSync());

    expect(authStateCallback).toBeDefined();

    unmount();
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useSessionSync());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should redirect to /login when SIGNED_OUT event fires', () => {
    const { unmount } = renderHook(() => useSessionSync());

    // Simulate SIGNED_OUT event
    act(() => {
      authStateCallback?.('SIGNED_OUT', null);
    });

    expect(mockPush).toHaveBeenCalledWith('/login?signedOut=true');

    unmount();
  });

  it('should not redirect on other auth events', () => {
    const { unmount } = renderHook(() => useSessionSync());

    // Simulate SIGNED_IN event (should not redirect)
    act(() => {
      authStateCallback?.('SIGNED_IN', { user: {} });
    });

    expect(mockPush).not.toHaveBeenCalled();

    unmount();
  });

  it('should not redirect on TOKEN_REFRESHED event', () => {
    const { unmount } = renderHook(() => useSessionSync());

    // Simulate TOKEN_REFRESHED event (should not redirect)
    act(() => {
      authStateCallback?.('TOKEN_REFRESHED', { user: {} });
    });

    expect(mockPush).not.toHaveBeenCalled();

    unmount();
  });
});
