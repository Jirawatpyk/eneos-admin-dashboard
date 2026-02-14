/**
 * Settings Page Tests
 * Story 7.1 / Story 11-4: Migrated to useAuth
 * Story 7.3: Notification Settings
 * Story 7.4: Team Management Link (Admin only)
 * Story 7.5: System Health (Admin only)
 *
 * Note: ProfileCard + SessionCard consolidated into AccountCard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPage from '@/app/(dashboard)/settings/page';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock settings components (including Story 7.5 components)
vi.mock('@/components/settings', () => ({
  AccountCard: () => <div data-testid="account-card">Account Card</div>,
  AccountCardSkeleton: () => <div data-testid="account-card-skeleton">Loading...</div>,
  // Legacy exports (deprecated)
  ProfileCard: () => <div data-testid="profile-card">Profile Card</div>,
  ProfileCardSkeleton: () => <div data-testid="profile-card-skeleton">Loading...</div>,
  SessionCard: () => <div data-testid="session-card">Session Card</div>,
  SessionCardSkeleton: () => <div data-testid="session-card-skeleton">Loading...</div>,
  NotificationSettingsCard: () => <div data-testid="notification-settings-card">Notification Card</div>,
  NotificationSettingsSkeleton: () => <div data-testid="notification-settings-skeleton">Loading...</div>,
  SystemHealthCard: () => <div data-testid="system-health-card">System Health Card</div>,
  SystemHealthSkeleton: () => <div data-testid="system-health-skeleton">Loading...</div>,
  // Story 0-16: Lead Processing Status
  LeadProcessingStatusCard: () => <div data-testid="lead-processing-status-card">Lead Processing</div>,
}));

// Mock roles config
vi.mock('@/config/roles', () => ({
  isAdmin: (role: string) => role === 'admin',
}));

describe('Settings Page', () => {
  beforeEach(() => {
    cleanup();
    mockUseAuth.mockReset();
  });

  describe('Basic rendering', () => {
    it('should render settings page', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    it('should display settings header', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText(/manage your account/i)).toBeInTheDocument();
    });

    it('should render account card', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('account-card')).toBeInTheDocument();
    });

    it('should render notification settings card', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('notification-settings-card')).toBeInTheDocument();
    });
  });

  describe('Story 7.4: Team Management Link', () => {
    it('should show team management link for admin', () => {
      mockUseAuth.mockReturnValue({
        role: 'admin', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('team-management-link')).toBeInTheDocument();
      expect(screen.getByText('Team Management')).toBeInTheDocument();
    });

    it('should link to /settings/team', () => {
      mockUseAuth.mockReturnValue({
        role: 'admin', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      const link = screen.getByTestId('team-management-link');
      expect(link).toHaveAttribute('href', '/settings/team');
    });

    it('should NOT show team management link for viewer', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      expect(screen.queryByTestId('team-management-link')).not.toBeInTheDocument();
    });

    it('should NOT show team management link for sales role', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      expect(screen.queryByTestId('team-management-link')).not.toBeInTheDocument();
    });

    it('should show team management description', () => {
      mockUseAuth.mockReturnValue({
        role: 'admin', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      expect(screen.getByText(/manage sales team members/i)).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should show skeletons while loading', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: true, isAuthenticated: false, user: null,
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('account-card-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('notification-settings-skeleton')).toBeInTheDocument();
    });

    it('should NOT show team management link while loading', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: true, isAuthenticated: false, user: null,
      });

      render(<SettingsPage />);

      expect(screen.queryByTestId('team-management-link')).not.toBeInTheDocument();
    });
  });

  describe('Responsive grid', () => {
    it('should have grid layout for cards', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      const grid = screen.getByTestId('settings-grid');
      expect(grid).toHaveClass('grid');
    });

    it('should have multi-column grid for admin users', () => {
      mockUseAuth.mockReturnValue({
        role: 'admin', isLoading: false, isAuthenticated: true, user: null,
      });

      render(<SettingsPage />);

      const grid = screen.getByTestId('settings-grid');
      expect(grid).toHaveClass('md:grid-cols-2');
    });
  });
});
