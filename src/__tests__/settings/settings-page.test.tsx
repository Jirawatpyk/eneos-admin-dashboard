/**
 * Settings Page Tests
 * Story 7.1: User Profile (Consolidated)
 * Story 7.5: System Health (Admin-only visibility)
 *
 * Tests for AC#1 (Settings Page Access), AC#6 (Responsive Design), AC#7 (Loading State)
 * Story 7.5 AC#7: Admin Only Access - System Health visible to admins only
 *
 * Note: ProfileCard + SessionCard consolidated into AccountCard
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

// Helper to create mock session (only admin can access Settings page)
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
    it('shows AccountCardSkeleton and SystemHealthCard during session loading', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn(),
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('account-card-skeleton')).toBeInTheDocument();
      // SystemHealthCard shows during loading (has its own internal skeleton via useSystemHealth)
      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
    });

    it('uses 2-column grid during loading to prevent layout shift', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn(),
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      const gridContainer = screen.getByTestId('settings-grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });

    it('shows actual cards when session is loaded', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('account-card')).toBeInTheDocument();
    });
  });

  describe('AC#6: Responsive Design', () => {
    it('renders with responsive grid classes', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />, { wrapper: createWrapper() });
      const gridContainer = screen.getByTestId('settings-grid');
      expect(gridContainer).toHaveClass('grid');
    });

    it('renders with 2-column grid for admin users (AccountCard + SystemHealth)', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />, { wrapper: createWrapper() });
      const gridContainer = screen.getByTestId('settings-grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });

    // Note: Viewer cannot access Settings page (blocked by middleware)
    // So grid is always 2 columns for admin users
  });

  describe('Story 7.5 AC#7: Admin Only Access - System Health', () => {
    it('shows System Health card for admin users', () => {
      vi.mocked(useSession).mockReturnValue(createMockSession());

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    // Note: Viewer cannot access Settings page (blocked by middleware)
    // So we don't need to test hiding System Health for viewer/manager

    it('shows System Health card during loading (has internal skeleton via useSystemHealth)', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn(),
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      // SystemHealthCard handles its own loading state internally via useSystemHealth hook
      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
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
