/**
 * Settings Page Tests
 * Story 7.1: User Profile (Consolidated)
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

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
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
    mockUseSession.mockReset();
  });

  describe('Basic rendering', () => {
    it('should render settings page', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'User', email: 'user@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    it('should display settings header', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'User', email: 'user@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText(/manage your account/i)).toBeInTheDocument();
    });

    it('should render account card', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'User', email: 'user@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('account-card')).toBeInTheDocument();
    });

    it('should render notification settings card', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'User', email: 'user@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('notification-settings-card')).toBeInTheDocument();
    });
  });

  describe('Story 7.4: Team Management Link', () => {
    it('should show team management link for admin', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Admin', email: 'admin@eneos.co.th', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('team-management-link')).toBeInTheDocument();
      expect(screen.getByText('Team Management')).toBeInTheDocument();
    });

    it('should link to /settings/team', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Admin', email: 'admin@eneos.co.th', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      const link = screen.getByTestId('team-management-link');
      expect(link).toHaveAttribute('href', '/settings/team');
    });

    it('should NOT show team management link for viewer', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      expect(screen.queryByTestId('team-management-link')).not.toBeInTheDocument();
    });

    it('should NOT show team management link for sales role', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Sales', email: 'sales@eneos.co.th', role: 'sales' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      expect(screen.queryByTestId('team-management-link')).not.toBeInTheDocument();
    });

    it('should show team management description', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Admin', email: 'admin@eneos.co.th', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      expect(screen.getByText(/manage sales team members/i)).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should show skeletons while loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('account-card-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('notification-settings-skeleton')).toBeInTheDocument();
    });

    it('should NOT show team management link while loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<SettingsPage />);

      expect(screen.queryByTestId('team-management-link')).not.toBeInTheDocument();
    });
  });

  describe('Responsive grid', () => {
    it('should have grid layout for cards', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'User', email: 'user@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      const grid = screen.getByTestId('settings-grid');
      expect(grid).toHaveClass('grid');
      // Note: Viewer only has AccountCard (1 column), Admin has AccountCard + SystemHealth (2 columns)
    });

    it('should have 2-column grid for admin users', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Admin', email: 'admin@eneos.co.th', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<SettingsPage />);

      const grid = screen.getByTestId('settings-grid');
      expect(grid).toHaveClass('md:grid-cols-2');
    });
  });
});
