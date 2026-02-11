import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Unmock useAuth so we test the REAL hook (setup.ts mocks it globally)
vi.unmock('@/hooks/use-auth');

// Mock Supabase client
const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

import { useAuth } from '@/hooks/use-auth';

describe('useAuth', () => {
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBe('viewer');
  });

  it('should set user after getUser resolves with authenticated user', async () => {
    const mockUser = {
      id: 'uuid-123',
      email: 'admin@eneos.co.th',
      app_metadata: { role: 'admin' },
      user_metadata: { name: 'Test Admin' },
    };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('admin');
  });

  it('should default role to viewer when no role in app_metadata', async () => {
    const mockUser = {
      id: 'uuid-456',
      email: 'viewer@eneos.co.th',
      app_metadata: {},
      user_metadata: { name: 'Test Viewer' },
    };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('viewer');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle unauthenticated state', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBe('viewer');
  });

  it('should update user on auth state change', async () => {
    let authStateCallback: (event: string, session: unknown) => void;
    mockOnAuthStateChange.mockImplementation((callback: (event: string, session: unknown) => void) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);

    // Simulate auth state change — user signs in
    const newUser = {
      id: 'uuid-789',
      email: 'new@eneos.co.th',
      app_metadata: { role: 'admin' },
      user_metadata: { name: 'New User' },
    };

    act(() => {
      authStateCallback!('SIGNED_IN', { user: newUser });
    });

    expect(result.current.user).toEqual(newUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('admin');
  });

  it('should handle SIGNED_OUT event', async () => {
    const mockUser = {
      id: 'uuid-123',
      email: 'admin@eneos.co.th',
      app_metadata: { role: 'admin' },
      user_metadata: {},
    };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    let authStateCallback: (event: string, session: unknown) => void;
    mockOnAuthStateChange.mockImplementation((callback: (event: string, session: unknown) => void) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Simulate sign out
    act(() => {
      authStateCallback!('SIGNED_OUT', null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should unsubscribe on unmount', async () => {
    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
