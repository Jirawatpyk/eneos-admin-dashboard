/**
 * Session Card Component Tests
 * Story 7.1: User Profile
 *
 * Tests for AC#4 (Session Information)
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
import { SessionCard } from '@/components/settings/session-card';

// Helper to create authenticated mock session
function createMockSession(overrides: { expires?: string } = {}) {
  return {
    data: {
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@eneos.co.th',
        image: null,
        role: 'admin' as const,
      },
      expires: overrides.expires ?? '2026-01-20T00:00:00.000Z',
    },
    status: 'authenticated' as const,
    update: vi.fn(),
  };
}

// Helper to create expired session for testing edge cases
// Note: In NextAuth, when status is 'unauthenticated', data should be null.
// However, we test this edge case to ensure the component handles it gracefully.
function createExpiredSession() {
  // Type assertion to bypass NextAuth's discriminated union for edge case testing
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

describe('SessionCard', () => {
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

  describe('AC#4: Session Information', () => {
    it('displays Google as login provider', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SessionCard />);
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    it('displays Active status when authenticated (green)', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SessionCard />);
      const statusElement = screen.getByTestId('session-status');
      expect(statusElement).toHaveTextContent('Active');
      expect(statusElement).toHaveClass('text-green-600');
    });

    // L1 fix: Test for Expired status color
    it('displays Expired status when unauthenticated (red)', () => {
      vi.mocked(useSession).mockReturnValue(createExpiredSession());

      render(<SessionCard />);
      const statusElement = screen.getByTestId('session-status');
      expect(statusElement).toHaveTextContent('Expired');
      expect(statusElement).toHaveClass('text-red-600');
    });

    it('displays session expiry time', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ expires: '2026-01-20T10:30:00.000Z' }));

      render(<SessionCard />);
      expect(screen.getByTestId('session-expires')).toBeInTheDocument();
    });

    it('displays Sign Out button', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SessionCard />);
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    // M3 fix: Updated expected callback URL
    it('triggers signOut with correct callback URL when Sign Out button is clicked', async () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SessionCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login?signedOut=true' });
      });
    });

    // M1 fix: Test for loading state
    it('shows loading spinner when signing out', async () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());
      vi.mocked(signOut).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<SessionCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(screen.getByTestId('sign-out-spinner')).toBeInTheDocument();
        expect(screen.getByText('Signing out...')).toBeInTheDocument();
      });
    });

    // M1 fix: Test button is disabled while loading
    it('disables Sign Out button while signing out', async () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());
      vi.mocked(signOut).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<SessionCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(signOutButton).toBeDisabled();
      });
    });

    // M4 fix: Test for multi-tab logout broadcast
    it('broadcasts logout event to other tabs when signing out', async () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SessionCard />);
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockPostMessage).toHaveBeenCalledWith({ type: 'logout' });
      });
    });

    it('renders card with Session title', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SessionCard />);
      expect(screen.getByText('Session')).toBeInTheDocument();
    });

    it('displays Provider label', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SessionCard />);
      expect(screen.getByText('Provider')).toBeInTheDocument();
    });

    it('displays Status label', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SessionCard />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('displays Expires label when session has expiry', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SessionCard />);
      expect(screen.getByText('Expires')).toBeInTheDocument();
    });

    // M2 fix: Test that component returns null when no session
    it('returns null when no session data', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { container } = render(<SessionCard />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('data-testid attributes', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue(createMockSession());
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
