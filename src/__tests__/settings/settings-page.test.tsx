/**
 * Settings Page Tests
 * Story 7.1: User Profile
 * Story 7.5: System Health (Admin-only visibility)
 *
 * Tests for AC#1 (Settings Page Access), AC#6 (Responsive Design), AC#7 (Loading State)
 * Story 7.5 AC#7: Admin Only Access - System Health visible to admins only
 */
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

// Mock useSystemHealth for testing page integration
vi.mock('@/hooks/use-system-health', () => ({
  useSystemHealth: () => ({
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: 3600,
      services: {
        googleSheets: { status: 'up', latency: 45 },
        geminiAI: { status: 'up', latency: 120 },
        lineAPI: { status: 'up', latency: 30 },
      },
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isRefetching: false,
  }),
  formatUptime: (seconds: number) => `${Math.floor(seconds / 3600)}h`,
}));

// Import page after mocking
import SettingsPage from '@/app/(dashboard)/settings/page';

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Helper to create mock session
function createMockSession(role: 'admin' | 'manager' | 'viewer' = 'admin') {
  return {
    data: {
      user: {
        id: 'user-123',
        name: role === 'admin' ? 'Admin User' : role === 'viewer' ? 'Viewer User' : 'Manager User',
        email: `${role}@eneos.co.th`,
        image: null,
        role,
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

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
    });

    it('renders description text', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />, { wrapper: createWrapper() });
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

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('profile-card-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('session-card-skeleton')).toBeInTheDocument();
    });

    it('shows actual cards when session is loaded', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
      expect(screen.getByTestId('session-card')).toBeInTheDocument();
    });
  });

  describe('AC#6: Responsive Design', () => {
    it('renders with responsive grid classes', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />, { wrapper: createWrapper() });
      const gridContainer = screen.getByTestId('settings-grid');
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });

    it('renders with 3-column grid for admin users', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession('admin'));

      render(<SettingsPage />, { wrapper: createWrapper() });
      const gridContainer = screen.getByTestId('settings-grid');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('does not render 3-column grid for viewer users', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession('viewer'));

      render(<SettingsPage />, { wrapper: createWrapper() });
      const gridContainer = screen.getByTestId('settings-grid');
      expect(gridContainer).not.toHaveClass('lg:grid-cols-3');
    });
  });

  describe('Story 7.5 AC#7: Admin Only Access - System Health', () => {
    it('shows System Health card for admin users', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession('admin'));

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    it('hides System Health card for viewer users', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession('viewer'));

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.queryByTestId('system-health-card')).not.toBeInTheDocument();
      expect(screen.queryByText('System Health')).not.toBeInTheDocument();
    });

    it('hides System Health card for manager users', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession('manager'));

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.queryByTestId('system-health-card')).not.toBeInTheDocument();
    });

    it('does not show System Health skeleton during loading for unknown role', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn(),
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.queryByTestId('system-health-skeleton')).not.toBeInTheDocument();
    });
  });

  describe('data-testid attributes', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue(createMockSession());
    });

    it('has settings-page testid', () => {
      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    it('has settings-header testid', () => {
      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('settings-header')).toBeInTheDocument();
    });

    it('has settings-grid testid', () => {
      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('settings-grid')).toBeInTheDocument();
    });
  });
});
