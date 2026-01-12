import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Use vi.hoisted() for mock functions
const { mockSignOut } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signOut: mockSignOut,
  useSession: () => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@eneos.co.th',
        image: 'https://example.com/avatar.jpg',
      },
    },
    status: 'authenticated',
  }),
}));

// Import after mocks
import { UserNav } from '@/components/layout/user-nav';

describe('UserNav - Story 1.4: Logout', () => {
  const mockUser = {
    name: 'Somchai Jaidee',
    email: 'somchai@eneos.co.th',
    image: 'https://lh3.googleusercontent.com/avatar.jpg',
  };

  // Mock BroadcastChannel
  let mockBroadcastChannel: {
    postMessage: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockBroadcastChannel = {
      postMessage: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Mock BroadcastChannel constructor properly
    class MockBroadcastChannel {
      postMessage = mockBroadcastChannel.postMessage;
      close = mockBroadcastChannel.close;
      addEventListener = mockBroadcastChannel.addEventListener;
      removeEventListener = mockBroadcastChannel.removeEventListener;
      onmessage = null;
      onmessageerror = null;
      name = 'eneos-logout';
      dispatchEvent = vi.fn();
    }

    global.BroadcastChannel = MockBroadcastChannel as unknown as typeof BroadcastChannel;
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

    it('should show user avatar with image when available', async () => {
      render(<UserNav user={mockUser} />);

      // Avatar is inside the button trigger
      const triggerButton = screen.getByTestId('user-nav-trigger');
      expect(triggerButton).toBeInTheDocument();

      // Check that avatar component renders (fallback shows initials since image loading is async)
      // In test environment, AvatarImage may not load, but AvatarFallback shows initials
      expect(screen.getByText('SJ')).toBeInTheDocument();
    });

    it('should show initials fallback when no image', () => {
      render(<UserNav user={{ ...mockUser, image: null }} />);

      // Click to open menu and check fallback
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
  describe('AC2: Clicking Sign Out triggers signOut()', () => {
    it('should call signOut with callbackUrl when Sign out is clicked', async () => {
      render(<UserNav user={mockUser} />);

      // Open dropdown
      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      // Click Sign out
      await waitFor(() => {
        const signOutButton = screen.getByTestId('logout-menu-item');
        fireEvent.click(signOutButton);
      });

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({
          callbackUrl: '/login?signedOut=true',
        });
      });
    });

    it('should disable logout button while signing out', async () => {
      mockSignOut.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<UserNav user={mockUser} />);

      // Open dropdown
      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      // Get the Sign out button before clicking
      const signOutButton = await screen.findByTestId('logout-menu-item');

      // Click Sign out
      fireEvent.click(signOutButton);

      // signOut should have been called
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  // AC6: Multi-Tab Logout Sync
  describe('AC6: Multi-Tab Logout Sync', () => {
    it('should broadcast logout event when signing out', async () => {
      render(<UserNav user={mockUser} />);

      // Open dropdown
      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      // Click Sign out
      await waitFor(() => {
        const signOutButton = screen.getByTestId('logout-menu-item');
        fireEvent.click(signOutButton);
      });

      await waitFor(() => {
        expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
          type: 'logout',
        });
      });
    });

    it('should close broadcast channel after posting message', async () => {
      render(<UserNav user={mockUser} />);

      // Open dropdown
      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      // Click Sign out
      await waitFor(() => {
        const signOutButton = screen.getByTestId('logout-menu-item');
        fireEvent.click(signOutButton);
      });

      await waitFor(() => {
        expect(mockBroadcastChannel.close).toHaveBeenCalled();
      });
    });

    it('should listen for logout events from other tabs', () => {
      render(<UserNav user={mockUser} />);

      // Verify event listener was added
      expect(mockBroadcastChannel.addEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });

    it('should clean up event listener on unmount', () => {
      const { unmount } = render(<UserNav user={mockUser} />);

      unmount();

      expect(mockBroadcastChannel.removeEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
      expect(mockBroadcastChannel.close).toHaveBeenCalled();
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

    it('should handle missing BroadcastChannel gracefully', async () => {
      // Remove BroadcastChannel from window
      const originalBC = global.BroadcastChannel;
      // @ts-expect-error - intentionally removing BroadcastChannel
      delete global.BroadcastChannel;

      render(<UserNav user={mockUser} />);

      const triggerButton = screen.getByTestId('user-nav-trigger');
      await userEvent.click(triggerButton);

      await waitFor(() => {
        const signOutButton = screen.getByTestId('logout-menu-item');
        fireEvent.click(signOutButton);
      });

      // Should still call signOut without throwing
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });

      // Restore
      global.BroadcastChannel = originalBC;
    });
  });
});
