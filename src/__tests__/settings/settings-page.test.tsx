/**
 * Settings Page Tests
 * Story 7.1 / Story 11-4: Migrated to useAuth
 * Story 7.5: System Health (Admin-only visibility)
 *
 * Tests for AC#1 (Settings Page Access), AC#6 (Responsive Design), AC#7 (Loading State)
 */
import { render, screen } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useAuth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

// Mock Supabase client (used by AccountCard)
const mockSignOut = vi.fn().mockResolvedValue({});
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
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
        supabase: { status: 'up', latency: 45 },
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

// Mock next/navigation (used by AccountCard signOut redirect)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/settings',
}));

// Import page after mocking
import SettingsPage from '@/app/(dashboard)/settings/page';
import type { User } from '@supabase/supabase-js';

// Reusable mock admin user (Supabase shape)
const mockAdminUser = {
  id: 'user-123',
  email: 'admin@eneos.co.th',
  user_metadata: { name: 'Admin User', avatar_url: null },
  app_metadata: { role: 'admin', provider: 'google' },
} as unknown as User;

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryWrapper';
  return Wrapper;
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#1: Settings Page Access', () => {
    it('renders Settings page with header', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockAdminUser, role: 'admin', isLoading: false, isAuthenticated: true,
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
    });

    it('renders description text', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockAdminUser, role: 'admin', isLoading: false, isAuthenticated: true,
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByText(/manage your account settings/i)).toBeInTheDocument();
    });
  });

  describe('AC#7: Loading State', () => {
    it('shows AccountCardSkeleton and SystemHealthCard during loading', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null, role: 'viewer', isLoading: true, isAuthenticated: false,
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('account-card-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
    });

    it('uses multi-column grid during loading to prevent layout shift', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null, role: 'viewer', isLoading: true, isAuthenticated: false,
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      const gridContainer = screen.getByTestId('settings-grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });

    it('shows actual cards when loaded', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockAdminUser, role: 'admin', isLoading: false, isAuthenticated: true,
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('account-card')).toBeInTheDocument();
    });
  });

  describe('AC#6: Responsive Design', () => {
    it('renders with responsive grid classes', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockAdminUser, role: 'admin', isLoading: false, isAuthenticated: true,
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      const gridContainer = screen.getByTestId('settings-grid');
      expect(gridContainer).toHaveClass('grid');
    });

    it('renders with multi-column grid for admin users', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockAdminUser, role: 'admin', isLoading: false, isAuthenticated: true,
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      const gridContainer = screen.getByTestId('settings-grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });
  });

  describe('Story 7.5 AC#7: Admin Only Access - System Health', () => {
    it('shows System Health card for admin users', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockAdminUser, role: 'admin', isLoading: false, isAuthenticated: true,
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    it('shows System Health card during loading', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null, role: 'viewer', isLoading: true, isAuthenticated: false,
      });

      render(<SettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
    });
  });

  describe('data-testid attributes', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockAdminUser, role: 'admin', isLoading: false, isAuthenticated: true,
      });
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
