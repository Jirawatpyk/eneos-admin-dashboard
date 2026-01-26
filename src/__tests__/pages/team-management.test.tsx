/**
 * Team Management Page Tests
 * Story 7.4: Admin User Management
 * AC#1: Admin can view all sales team members
 * AC#10: Viewers are redirected to dashboard with toast
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeamManagementPage from '@/app/(dashboard)/settings/team/page';

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

// Mock Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock team management components
vi.mock('@/components/settings', () => ({
  TeamManagementCard: () => <div data-testid="team-management-card">Team Card</div>,
  TeamManagementCardSkeleton: () => <div data-testid="team-management-skeleton">Loading...</div>,
}));

// Mock roles config
vi.mock('@/config/roles', () => ({
  isAdmin: (role: string) => role === 'admin',
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryWrapper';
  return Wrapper;
};

describe('Team Management Page', () => {
  beforeEach(() => {
    cleanup();
    mockUseSession.mockReset();
    mockReplace.mockReset();
    mockToast.mockReset();
  });

  describe('AC#1: Admin access', () => {
    it('should render team management page for admin', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Admin', email: 'admin@eneos.co.th', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<TeamManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('team-page')).toBeInTheDocument();
    });

    it('should display page title', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Admin', email: 'admin@eneos.co.th', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<TeamManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Team Management')).toBeInTheDocument();
    });

    it('should render TeamManagementCard for admin', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Admin', email: 'admin@eneos.co.th', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<TeamManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('team-management-card')).toBeInTheDocument();
    });

    it('should display back link to settings', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Admin', email: 'admin@eneos.co.th', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<TeamManagementPage />, { wrapper: createWrapper() });

      const backLink = screen.getByText('Back to Settings');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/settings');
    });
  });

  describe('AC#10: Viewer restriction with redirect', () => {
    it('should redirect viewer to dashboard', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<TeamManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/');
      });
    });

    it('should show toast when redirecting viewer', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<TeamManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Admin access required',
            variant: 'destructive',
          })
        );
      });
    });

    it('should show redirecting state for viewer', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<TeamManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('team-page-redirecting')).toBeInTheDocument();
    });

    it('should not render TeamManagementCard for viewer', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<TeamManagementPage />, { wrapper: createWrapper() });

      expect(screen.queryByTestId('team-management-card')).not.toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should show loading skeleton while session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<TeamManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('team-page-loading')).toBeInTheDocument();
      expect(screen.getByTestId('team-management-skeleton')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated state', () => {
    it('should redirect unauthenticated users to dashboard', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<TeamManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/');
      });
    });
  });
});
