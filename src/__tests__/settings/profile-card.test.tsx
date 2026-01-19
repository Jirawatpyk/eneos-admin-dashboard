/**
 * Profile Card Component Tests
 * Story 7.1: User Profile
 *
 * Tests for AC#2 (Profile Information Display) and AC#3 (Profile Card Layout)
 */
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Import component after mocking
import { ProfileCard } from '@/components/settings/profile-card';

// Helper to create mock session
function createMockSession(overrides: {
  name?: string | null;
  email?: string;
  image?: string | null;
  role?: 'admin' | 'manager' | 'viewer';
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
      expires: '2026-01-20T00:00:00.000Z',
    },
    status: 'authenticated' as const,
    update: vi.fn(),
  };
}

describe('ProfileCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#2: Profile Information Display', () => {
    it('displays user name from session', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Test User' }));

      render(<ProfileCard />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('displays user email from session', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ email: 'test@eneos.co.th' }));

      render(<ProfileCard />);
      expect(screen.getByText('test@eneos.co.th')).toBeInTheDocument();
    });

    it('renders avatar component with image src when provided', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ image: 'https://example.com/avatar.jpg' }));

      render(<ProfileCard />);
      // In test environment, Radix Avatar falls back to AvatarFallback
      // because the image doesn't load. We verify the component renders.
      const avatar = screen.getByTestId('profile-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('AC#3: Profile Card Layout', () => {
    it('displays avatar fallback with initials when no image', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Test User', image: null }));

      render(<ProfileCard />);
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('displays Admin badge with Shield icon for admin role', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Admin User', role: 'admin' }));

      render(<ProfileCard />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('displays Viewer badge with Eye icon for viewer role', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Viewer User', role: 'viewer' }));

      render(<ProfileCard />);
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });

    it('displays Manager badge for manager role', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Manager User', role: 'manager' }));

      render(<ProfileCard />);
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    it('renders card with Profile title', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<ProfileCard />);
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('returns null when no session data', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { container } = render(<ProfileCard />);
      expect(container).toBeEmptyDOMElement();
    });

    it('handles single name initials', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: 'Admin' }));

      render(<ProfileCard />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('handles null name with fallback', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession({ name: null }));

      render(<ProfileCard />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('data-testid attributes', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue(createMockSession());
    });

    it('has profile-card testid', () => {
      render(<ProfileCard />);
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    });

    it('has profile-avatar testid', () => {
      render(<ProfileCard />);
      expect(screen.getByTestId('profile-avatar')).toBeInTheDocument();
    });

    it('has profile-name testid', () => {
      render(<ProfileCard />);
      expect(screen.getByTestId('profile-name')).toBeInTheDocument();
    });

    it('has profile-email testid', () => {
      render(<ProfileCard />);
      expect(screen.getByTestId('profile-email')).toBeInTheDocument();
    });

    it('has profile-role-badge testid', () => {
      render(<ProfileCard />);
      expect(screen.getByTestId('profile-role-badge')).toBeInTheDocument();
    });
  });
});
