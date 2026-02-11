/**
 * Providers Tests
 * Story 11-4: Migrated from SessionProvider to SupabaseAuthListener
 *
 * Tests that the Providers component:
 * - Renders children correctly
 * - Sets up SupabaseAuthListener for auth state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

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
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Import after mocks
import { Providers } from '@/app/providers';

describe('Providers - Story 11-4: Supabase Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children', () => {
    render(
      <Providers>
        <div data-testid="test-child">Test Child</div>
      </Providers>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should set up SupabaseAuthListener on mount', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    // Auth state callback should be registered
    expect(authStateCallback).toBeDefined();
  });

  it('should redirect to /login on SIGNED_OUT event', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    // Simulate SIGNED_OUT event
    act(() => {
      authStateCallback?.('SIGNED_OUT', null);
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should refresh router on TOKEN_REFRESHED event', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    // Simulate TOKEN_REFRESHED event
    act(() => {
      authStateCallback?.('TOKEN_REFRESHED', { user: {} });
    });

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should not redirect on other auth events', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    // Simulate SIGNED_IN event (should not redirect)
    act(() => {
      authStateCallback?.('SIGNED_IN', { user: {} });
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should unsubscribe from auth state changes on unmount', () => {
    const { unmount } = render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
