/**
 * Account Card Component Tests
 * Story 7.1 / Story 11-4: Migrated to Supabase Auth (useAuth + supabase.signOut)
 *
 * Tests for combined ProfileCard + SessionCard functionality
 * AC#2 (Profile Information Display), AC#3 (Profile Card Layout), AC#4 (Session Information)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import type { Role } from '@/config/roles';
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
import { AccountCard } from '@/components/settings/account-card';

// Helper to create mock auth state with Supabase User shape
function createMockAuth(overrides: {
  name?: string | null;
  email?: string;
  image?: string | null;
  role?: 'admin' | 'viewer';
  provider?: string;
} = {}) {
  const user = {
    id: 'user-123',
    email: overrides.email ?? 'test@eneos.co.th',
    user_metadata: {
      name: 'name' in overrides ? overrides.name : 'Test User',
      avatar_url: 'image' in overrides ? overrides.image : null,
    },
    app_metadata: {
      role: overrides.role ?? 'admin',
      provider: overrides.provider ?? 'google',
    },
  } as unknown as User;

  return {
    user,
    role: (overrides.role ?? 'admin') as Role,
    isLoading: false,
    isAuthenticated: true,
  };
}

// Helper to create unauthenticated state (user exists but marked unauthenticated)
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

describe('AccountCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#2: Profile Information Display', () => {
    it('displays user name from auth', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: 'Test User' }));

      render(<AccountCard />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('displays user email from auth', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ email: 'test@eneos.co.th' }));

      render(<AccountCard />);
      expect(screen.getByText('test@eneos.co.th')).toBeInTheDocument();
    });

    it('renders avatar component with image src when provided', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ image: 'https://example.com/avatar.jpg' }));

      render(<AccountCard />);
      const avatar = screen.getByTestId('account-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('AC#3: Profile Card Layout', () => {
    it('displays avatar fallback with initials when no image', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: 'Test User', image: null }));

      render(<AccountCard />);
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('displays Admin badge with Shield icon for admin role', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: 'Admin User', role: 'admin' }));

      render(<AccountCard />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('displays Viewer badge with Eye icon for viewer role', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: 'Viewer User', role: 'viewer' }));

      render(<AccountCard />);
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });

    it('renders card with Account title', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<AccountCard />);
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('renders skeleton when no user (prevents layout shift)', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        role: 'viewer',
        isLoading: false,
        isAuthenticated: false,
      });

      render(<AccountCard />);
      expect(screen.getByTestId('account-card-skeleton')).toBeInTheDocument();
    });

    it('handles single name initials', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: 'Admin' }));

      render(<AccountCard />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('handles null name with fallback to email initial', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: null }));

      render(<AccountCard />);
      // Component falls back: name = user.user_metadata?.name || user.email
      // getInitials('test@eneos.co.th') → 'T'
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  describe('AC#4: Session Information', () => {
    it('displays Google as login provider when using Google', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ provider: 'google' }));

      render(<AccountCard />);
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    it('displays Email as login provider when using email', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ provider: 'email' }));

      render(<AccountCard />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('displays Active status when authenticated (green)', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<AccountCard />);
      const statusElement = screen.getByTestId('account-status');
      expect(statusElement).toHaveTextContent('Active');
      expect(statusElement).toHaveClass('text-green-600');
    });

    it('displays Expired status when unauthenticated (red)', () => {
      vi.mocked(useAuth).mockReturnValue(createExpiredAuth());

      render(<AccountCard />);
      const statusElement = screen.getByTestId('account-status');
      expect(statusElement).toHaveTextContent('Expired');
      expect(statusElement).toHaveClass('text-red-600');
    });

    it('displays Sign Out button', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<AccountCard />);
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('calls supabase.auth.signOut when Sign Out button is clicked', async () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<AccountCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it('redirects to /login after sign out', async () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<AccountCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?signedOut=true');
      });
    });

    it('shows loading spinner when signing out', async () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());
      mockSignOut.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<AccountCard />);
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

      render(<AccountCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(signOutButton).toBeDisabled();
      });
    });

    it('displays Provider label', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<AccountCard />);
      expect(screen.getByText('Provider')).toBeInTheDocument();
    });

    it('displays Status label', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<AccountCard />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('data-testid attributes', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());
    });

    it('has account-card testid', () => {
      render(<AccountCard />);
      expect(screen.getByTestId('account-card')).toBeInTheDocument();
    });

    it('has account-avatar testid', () => {
      render(<AccountCard />);
      expect(screen.getByTestId('account-avatar')).toBeInTheDocument();
    });

    it('has account-name testid', () => {
      render(<AccountCard />);
      expect(screen.getByTestId('account-name')).toBeInTheDocument();
    });

    it('has account-email testid', () => {
      render(<AccountCard />);
      expect(screen.getByTestId('account-email')).toBeInTheDocument();
    });

    it('has account-role-badge testid', () => {
      render(<AccountCard />);
      expect(screen.getByTestId('account-role-badge')).toBeInTheDocument();
    });

    it('has account-provider testid', () => {
      render(<AccountCard />);
      expect(screen.getByTestId('account-provider')).toBeInTheDocument();
    });

    it('has account-status testid', () => {
      render(<AccountCard />);
      expect(screen.getByTestId('account-status')).toBeInTheDocument();
    });

    it('has btn-sign-out testid', () => {
      render(<AccountCard />);
      expect(screen.getByTestId('btn-sign-out')).toBeInTheDocument();
    });
  });
});
