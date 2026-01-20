/**
 * Account Card Component Tests
 * Story 7.1: User Profile (Consolidated)
 *
 * Tests for combined ProfileCard + SessionCard functionality
 * AC#2 (Profile Information Display), AC#3 (Profile Card Layout), AC#4 (Session Information)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signOut, useSession } from 'next-auth/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

// Import component after mocking
import { AccountCard } from '@/components/settings/account-card';

// Helper to create mock session (only admin/viewer roles exist in production)
function createMockSession(overrides: {
  name?: string | null;
  email?: string;
  image?: string | null;
  role?: 'admin' | 'viewer';
  expires?: string;
} = {}) {
  return {
    data: {
      user: {
        id: 'user-123',
        name: 'name' in overrides ? overrides.name : 'Test User',
        email: overrides.email ?? 'test@eneos.co.th',
        image: 'image' in overrides ? overrides.image : null,
        role: overrides.role ?? 'admin',
      },
      expires: overrides.expires ?? '2026-01-20T00:00:00.000Z',
    },
    status: 'authenticated' as const,
    update: vi.fn(),
  };
}

// Helper to create expired session for testing edge cases
function createExpiredSession() {
  return {
    data: {
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@eneos.co.th',
        image: null,
        role: 'admin' as const,
      },
      expires: '2026-01-20T00:00:00.000Z',
    },
    status: 'unauthenticated' as const,
    update: vi.fn(),
  } as unknown as ReturnType<typeof useSession>;
}

// Shared spy for BroadcastChannel postMessage
const mockPostMessage = vi.fn();
const mockClose = vi.fn();

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  private listeners: Map<string, Set<EventListener>> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  postMessage = mockPostMessage;
  close = mockClose;

  addEventListener(type: string, listener: EventListener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener);
  }
}

describe('AccountCard', () => {
  let originalBroadcastChannel: typeof BroadcastChannel | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPostMessage.mockClear();
    mockClose.mockClear();
    originalBroadcastChannel = globalThis.BroadcastChannel;
    globalThis.BroadcastChannel = MockBroadcastChannel as unknown as typeof BroadcastChannel;
  });

  afterEach(() => {
    if (originalBroadcastChannel) {
      globalThis.BroadcastChannel = originalBroadcastChannel;
    }
  });

  describe('AC#2: Profile Information Display', () => {
    it('displays user name from session', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Test User' }));

      render(<AccountCard />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('displays user email from session', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ email: 'test@eneos.co.th' }));

      render(<AccountCard />);
      expect(screen.getByText('test@eneos.co.th')).toBeInTheDocument();
    });

    it('renders avatar component with image src when provided', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ image: 'https://example.com/avatar.jpg' }));

      render(<AccountCard />);
      const avatar = screen.getByTestId('account-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('AC#3: Profile Card Layout', () => {
    it('displays avatar fallback with initials when no image', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Test User', image: null }));

      render(<AccountCard />);
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('displays Admin badge with Shield icon for admin role', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Admin User', role: 'admin' }));

      render(<AccountCard />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('displays Viewer badge with Eye icon for viewer role', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Viewer User', role: 'viewer' }));

      render(<AccountCard />);
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });

    // Note: Only admin and viewer roles exist in production

    it('renders card with Account title', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<AccountCard />);
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('returns null when no session data', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { container } = render(<AccountCard />);
      expect(container).toBeEmptyDOMElement();
    });

    it('handles single name initials', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Admin' }));

      render(<AccountCard />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('handles null name with fallback', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: null }));

      render(<AccountCard />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('AC#4: Session Information', () => {
    it('displays Google as login provider', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<AccountCard />);
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    it('displays Active status when authenticated (green)', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<AccountCard />);
      const statusElement = screen.getByTestId('account-status');
      expect(statusElement).toHaveTextContent('Active');
      expect(statusElement).toHaveClass('text-green-600');
    });

    it('displays Expired status when unauthenticated (red)', () => {
      vi.mocked(useSession).mockReturnValue(createExpiredSession());

      render(<AccountCard />);
      const statusElement = screen.getByTestId('account-status');
      expect(statusElement).toHaveTextContent('Expired');
      expect(statusElement).toHaveClass('text-red-600');
    });

    it('displays session expiry time', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ expires: '2026-01-20T10:30:00.000Z' }));

      render(<AccountCard />);
      expect(screen.getByTestId('account-expires')).toBeInTheDocument();
    });

    it('displays Sign Out button', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<AccountCard />);
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('triggers signOut with correct callback URL when Sign Out button is clicked', async () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<AccountCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login?signedOut=true' });
      });
    });

    it('shows loading spinner when signing out', async () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());
      vi.mocked(signOut).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<AccountCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(screen.getByTestId('sign-out-spinner')).toBeInTheDocument();
        expect(screen.getByText('Signing out...')).toBeInTheDocument();
      });
    });

    it('disables Sign Out button while signing out', async () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());
      vi.mocked(signOut).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<AccountCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(signOutButton).toBeDisabled();
      });
    });

    it('broadcasts logout event to other tabs when signing out', async () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<AccountCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockPostMessage).toHaveBeenCalledWith({ type: 'logout' });
      });
    });

    it('displays Provider label', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<AccountCard />);
      expect(screen.getByText('Provider')).toBeInTheDocument();
    });

    it('displays Status label', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<AccountCard />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('displays Expires label when session has expiry', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<AccountCard />);
      expect(screen.getByText('Expires')).toBeInTheDocument();
    });
  });

  describe('data-testid attributes', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue(createMockSession());
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
