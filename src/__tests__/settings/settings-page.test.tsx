/**
 * Settings Page Tests
 * Story 7.1: User Profile
 *
 * Tests for AC#1 (Settings Page Access), AC#6 (Responsive Design), AC#7 (Loading State)
 */
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

// Import page after mocking
import SettingsPage from '@/app/(dashboard)/settings/page';

// Helper to create mock session
function createMockSession() {
  return {
    data: {
      user: {
        id: 'user-123',
        name: 'Admin User',
        email: 'admin@eneos.co.th',
        image: null,
        role: 'admin' as const,
      },
      expires: '2026-01-20T00:00:00.000Z',
    },
    status: 'authenticated' as const,
    update: vi.fn(),
  };
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#1: Settings Page Access', () => {
    it('renders Settings page with header', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />);
      expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
    });

    it('renders description text', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />);
      expect(screen.getByText(/manage your account settings/i)).toBeInTheDocument();
    });
  });

  describe('AC#7: Loading State', () => {
    it('shows skeleton components when session is loading', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn(),
      });

      render(<SettingsPage />);
      expect(screen.getByTestId('profile-card-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('session-card-skeleton')).toBeInTheDocument();
    });

    it('shows actual cards when session is loaded', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />);
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
      expect(screen.getByTestId('session-card')).toBeInTheDocument();
    });
  });

  describe('AC#6: Responsive Design', () => {
    it('renders with responsive grid classes', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />);
      const gridContainer = screen.getByTestId('settings-grid');
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });
  });

  describe('data-testid attributes', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue(createMockSession());
    });

    it('has settings-page testid', () => {
      render(<SettingsPage />);
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    it('has settings-header testid', () => {
      render(<SettingsPage />);
      expect(screen.getByTestId('settings-header')).toBeInTheDocument();
    });

    it('has settings-grid testid', () => {
      render(<SettingsPage />);
      expect(screen.getByTestId('settings-grid')).toBeInTheDocument();
    });
  });
});
