/**
 * Profile Card Component Tests
 * Story 7.1 / Story 11-4: Migrated to useAuth
 *
 * Tests for AC#2 (Profile Information Display) and AC#3 (Profile Card Layout)
 */
import { render, screen } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { User } from '@supabase/supabase-js';

// Mock useAuth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

// Import component after mocking
import { ProfileCard } from '@/components/settings/profile-card';

// Helper to create mock auth state with Supabase User shape
function createMockAuth(overrides: {
  name?: string | null;
  email?: string;
  image?: string | null;
  role?: 'admin' | 'viewer';
} = {}) {
  const user = {
    id: 'user-123',
    email: overrides.email ?? 'test@eneos.co.th',
    user_metadata: {
      name: 'name' in overrides ? overrides.name : 'Test User',
      avatar_url: 'image' in overrides ? overrides.image : null,
    },
    app_metadata: { role: overrides.role ?? 'admin' },
  } as unknown as User;

  return {
    user,
    role: overrides.role ?? 'admin',
    isLoading: false,
    isAuthenticated: true,
  };
}

describe('ProfileCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#2: Profile Information Display', () => {
    it('displays user name from auth', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: 'Test User' }));

      render(<ProfileCard />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('displays user email from auth', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ email: 'test@eneos.co.th' }));

      render(<ProfileCard />);
      expect(screen.getByText('test@eneos.co.th')).toBeInTheDocument();
    });

    it('renders avatar component with image src when provided', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ image: 'https://example.com/avatar.jpg' }));

      render(<ProfileCard />);
      const avatar = screen.getByTestId('profile-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('AC#3: Profile Card Layout', () => {
    it('displays avatar fallback with initials when no image', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: 'Test User', image: null }));

      render(<ProfileCard />);
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('displays Admin badge with Shield icon for admin role', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: 'Admin User', role: 'admin' }));

      render(<ProfileCard />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('displays Viewer badge with Eye icon for viewer role', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: 'Viewer User', role: 'viewer' }));

      render(<ProfileCard />);
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });

    it('renders card with Profile title', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());

      render(<ProfileCard />);
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('returns null when no user', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        role: 'viewer',
        isLoading: false,
        isAuthenticated: false,
      });

      const { container } = render(<ProfileCard />);
      expect(container).toBeEmptyDOMElement();
    });

    it('handles single name initials', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: 'Admin' }));

      render(<ProfileCard />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('handles null name with fallback to email initial', () => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth({ name: null }));

      render(<ProfileCard />);
      // Component falls back: name = user.user_metadata?.name || user.email
      // getInitials('test@eneos.co.th') → 'T'
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  describe('data-testid attributes', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue(createMockAuth());
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
