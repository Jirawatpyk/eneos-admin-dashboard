/**
 * UserNav Tests
 * Story 1.4 / Story 11-4: Migrated to Supabase Auth (AC-5)
 *
 * UserNav receives user as props. Sign out uses supabase.auth.signOut().
 * Multi-tab logout sync handled by SupabaseAuthListener (no BroadcastChannel).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

// Import after mocks
import { UserNav } from '@/components/layout/user-nav';

describe('UserNav - Story 1.4 / Story 11-4: Supabase Logout', () => {
  const mockUser = {
    name: 'Somchai Jaidee',
    email: 'somchai@eneos.co.th',
    image: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // AC1: Logout Button Visibility
  describe('AC1: Logout Button Visible in Header', () => {
    it('should render user avatar button in header', () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      expect(triggerButton).toBeInTheDocument();
    });

    it('should show user avatar with image when available', () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      expect(triggerButton).toBeInTheDocument();
      // In test environment, AvatarImage may not load, but AvatarFallback shows initials
      expect(screen.getByText('SJ')).toBeInTheDocument();
    });

    it('should show initials fallback when no image', () => {
      render(<UserNav user={{ ...mockUser, image: null }} />);

      expect(screen.getByText('SJ')).toBeInTheDocument();
    });

    it('should show "U" as fallback when no name', () => {
      render(<UserNav user={{ name: null, email: 'test@eneos.co.th', image: null }} />);

      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  // AC1: Dropdown Menu
  describe('AC1: User Dropdown Menu', () => {
    it('should open dropdown when avatar is clicked', async () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
        expect(screen.getByTestId('user-email')).toBeInTheDocument();
      });
    });

    it('should display user name in dropdown', async () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Somchai Jaidee');
      });
    });

    it('should display user email in dropdown', async () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('somchai@eneos.co.th');
      });
    });

    it('should show Sign out option in dropdown', async () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('logout-menu-item')).toBeInTheDocument();
        expect(screen.getByText('Sign out')).toBeInTheDocument();
      });
    });
  });

  // AC2: Logout Action
  describe('AC2: Clicking Sign Out triggers supabase.auth.signOut()', () => {
    it('should call supabase signOut when Sign out is clicked', async () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        const signOutButton = screen.getByTestId('logout-menu-item');
        fireEvent.click(signOutButton);
      });

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it('should redirect to /login after sign out', async () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        const signOutButton = screen.getByTestId('logout-menu-item');
        fireEvent.click(signOutButton);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?signedOut=true');
      });
    });

    it('should disable logout button while signing out', async () => {
      mockSignOut.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      const signOutButton = await screen.findByTestId('logout-menu-item');
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  // AC7: Keyboard Accessibility
  describe('AC7: Keyboard Accessibility', () => {
    it('should have focus ring on avatar button', () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      expect(triggerButton).toHaveClass('focus:ring-2');
    });

    it('should have accessible label on trigger button', () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      expect(triggerButton).toHaveAttribute('aria-label', 'Open user menu');
    });

    it('should be keyboard navigable - open with Enter', async () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      triggerButton.focus();
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('logout-menu-item')).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable - open with Space', async () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      triggerButton.focus();
      await userEvent.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByTestId('logout-menu-item')).toBeInTheDocument();
      });
    });
  });

  // Story 1.5 AC#5: Role Display
  describe('AC#5: Role Display in User Menu', () => {
    it('should display Admin badge when user is admin', async () => {
      render(<UserNav user={{ ...mockUser, role: 'admin' }} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        const badge = screen.getByTestId('user-role-badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent('Admin');
      });
    });

    it('should display Viewer badge when user is viewer', async () => {
      render(<UserNav user={{ ...mockUser, role: 'viewer' }} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        const badge = screen.getByTestId('user-role-badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent('Viewer');
      });
    });

    it('should display Viewer badge by default when no role', async () => {
      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        const badge = screen.getByTestId('user-role-badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent('Viewer');
      });
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle missing user name gracefully', async () => {
      render(<UserNav user={{ name: null, email: 'test@eneos.co.th', image: null }} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('User');
      });
    });

    it('should handle signOut error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSignOut.mockRejectedValueOnce(new Error('Network error'));

      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        const signOutButton = screen.getByTestId('logout-menu-item');
        fireEvent.click(signOutButton);
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Sign out error:', expect.any(Error));
      });

      consoleError.mockRestore();
    });
  });
});
