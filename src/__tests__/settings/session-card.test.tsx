/**
 * Session Card Component Tests
 * Story 7.1 / Story 11-4: Migrated to Supabase Auth (useAuth + supabase.signOut)
 *
 * Tests for AC#4 (Session Information)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { User } from '@supabase/supabase-js';

// Mock useAuth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

// Mock Supabase client
const mockSignOut = vi.fn().mockResolvedValue({});
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
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

// Import component after mocking
import { SessionCard } from '@/components/settings/session-card';

// Helper to create mock auth state with Supabase User shape
function createMockAuth(overrides: { provider?: string } = {}) {
  const user = {
    id: 'user-123',
    email: 'test@eneos.co.th',
    user_metadata: { name: 'Test User', avatar_url: null },
    app_metadata: {
      role: 'admin',
      provider: overrides.provider ?? 'google',
    },
  } as unknown as User;

  return {
    user,
    role: 'admin' as const,
    isLoading: false,
    isAuthenticated: true,
  };
}

// Helper for unauthenticated state (user exists but marked unauthenticated)
function createExpiredAuth() {
  const user = {
    id: 'user-123',
    email: 'test@eneos.co.th',
    user_metadata: { name: 'Test User', avatar_url: null },
    app_metadata: { role: 'admin', provider: 'google' },
  } as unknown as User;

  return {
    user,
    role: 'admin' as const,
    isLoading: false,
    isAuthenticated: false,
  };
}

describe('SessionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#4: Session Information', () => {
    it('displays Google as login provider', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ provider: 'google' }));

      render(<SessionCard />);
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    it('displays Email as login provider when using email', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ provider: 'email' }));

      render(<SessionCard />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('displays Active status when authenticated (green)', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<SessionCard />);
      const statusElement = screen.getByTestId('session-status');
      expect(statusElement).toHaveTextContent('Active');
      expect(statusElement).toHaveClass('text-green-600');
    });

    it('displays Expired status when unauthenticated (red)', () => {
      vi.mocked(useAuth).mockReturnValue(createExpiredAuth());

      render(<SessionCard />);
      const statusElement = screen.getByTestId('session-status');
      expect(statusElement).toHaveTextContent('Expired');
      expect(statusElement).toHaveClass('text-red-600');
    });

    it('displays Sign Out button', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<SessionCard />);
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('calls supabase.auth.signOut when Sign Out button is clicked', async () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<SessionCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it('redirects to /login after sign out', async () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<SessionCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?signedOut=true');
      });
    });

    it('shows loading spinner when signing out', async () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());
      mockSignOut.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<SessionCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(screen.getByTestId('sign-out-spinner')).toBeInTheDocument();
        expect(screen.getByText('Signing out...')).toBeInTheDocument();
      });
    });

    it('disables Sign Out button while signing out', async () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());
      mockSignOut.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<SessionCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(signOutButton).toBeDisabled();
      });
    });

    it('renders card with Session title', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<SessionCard />);
      expect(screen.getByText('Session')).toBeInTheDocument();
    });

    it('displays Provider label', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<SessionCard />);
      expect(screen.getByText('Provider')).toBeInTheDocument();
    });

    it('displays Status label', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<SessionCard />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('returns null when no user', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        role: 'viewer',
        isLoading: false,
        isAuthenticated: false,
      });

      const { container } = render(<SessionCard />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('data-testid attributes', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());
    });

    it('has session-card testid', () => {
      render(<SessionCard />);
      expect(screen.getByTestId('session-card')).toBeInTheDocument();
    });

    it('has session-provider testid', () => {
      render(<SessionCard />);
      expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    });

    it('has session-status testid', () => {
      render(<SessionCard />);
      expect(screen.getByTestId('session-status')).toBeInTheDocument();
    });

    it('has btn-sign-out testid', () => {
      render(<SessionCard />);
      expect(screen.getByTestId('btn-sign-out')).toBeInTheDocument();
    });
  });
});
