/**
 * RoleGate Component Tests
 * Story 1.5 / Story 11-4: Migrated to useAuth
 * AC: #3 (Admin Access), #4 (Viewer Access)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoleGate, AdminOnly } from '../components/shared/role-gate';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock TooltipProvider for tooltip tests
vi.mock('@radix-ui/react-tooltip', async () => {
  const actual = await vi.importActual('@radix-ui/react-tooltip');
  return {
    ...actual,
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('RoleGate Component', () => {
  beforeEach(() => {
    cleanup();
    mockUseAuth.mockReset();
  });

  describe('Access control', () => {
    it('should render children when user has allowed role', () => {
      mockUseAuth.mockReturnValue({
        role: 'admin', isLoading: false, isAuthenticated: true, user: null,
      });

      render(
        <RoleGate allowedRoles={['admin']}>
          <button>Export Data</button>
        </RoleGate>
      );

      expect(screen.getByText('Export Data')).toBeInTheDocument();
    });

    it('should not render children when user does not have allowed role', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(
        <RoleGate allowedRoles={['admin']}>
          <button>Export Data</button>
        </RoleGate>
      );

      expect(screen.queryByText('Export Data')).not.toBeInTheDocument();
    });

    it('should render fallback when user does not have allowed role', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(
        <RoleGate
          allowedRoles={['admin']}
          fallback={<span>Access Denied</span>}
        >
          <button>Export Data</button>
        </RoleGate>
      );

      expect(screen.queryByText('Export Data')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should allow multiple roles', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(
        <RoleGate allowedRoles={['admin', 'viewer']}>
          <button>View Dashboard</button>
        </RoleGate>
      );

      expect(screen.getByText('View Dashboard')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should render nothing while auth is loading', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: true, isAuthenticated: false, user: null,
      });

      const { container } = render(
        <RoleGate allowedRoles={['admin']}>
          <button>Export Data</button>
        </RoleGate>
      );

      expect(container.innerHTML).toBe('');
      expect(screen.queryByText('Export Data')).not.toBeInTheDocument();
    });
  });

  describe('Default behavior', () => {
    it('should default to viewer role when unauthenticated', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: false, user: null,
      });

      render(
        <RoleGate allowedRoles={['admin']}>
          <button>Admin Only</button>
        </RoleGate>
      );

      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    });

    it('should default to viewer role when auth has no role', () => {
      mockUseAuth.mockReturnValue({
        role: undefined, isLoading: false, isAuthenticated: true, user: null,
      });

      render(
        <RoleGate allowedRoles={['admin']}>
          <button>Admin Only</button>
        </RoleGate>
      );

      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    });
  });

  describe('Tooltip with fallback', () => {
    it('should render fallback with disabled state', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(
        <RoleGate
          allowedRoles={['admin']}
          fallback={<button disabled data-testid="disabled-btn">Export (disabled)</button>}
        >
          <button>Export</button>
        </RoleGate>
      );

      expect(screen.getByTestId('disabled-btn')).toBeInTheDocument();
      expect(screen.getByTestId('disabled-btn')).toBeDisabled();
    });
  });

  describe('AdminOnly convenience component', () => {
    it('should render children for admin user', () => {
      mockUseAuth.mockReturnValue({
        role: 'admin', isLoading: false, isAuthenticated: true, user: null,
      });

      render(
        <AdminOnly>
          <button data-testid="admin-button">Admin Action</button>
        </AdminOnly>
      );

      expect(screen.getByTestId('admin-button')).toBeInTheDocument();
    });

    it('should not render children for viewer user', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(
        <AdminOnly>
          <button data-testid="admin-button">Admin Action</button>
        </AdminOnly>
      );

      expect(screen.queryByTestId('admin-button')).not.toBeInTheDocument();
    });

    it('should render fallback for viewer user', () => {
      mockUseAuth.mockReturnValue({
        role: 'viewer', isLoading: false, isAuthenticated: true, user: null,
      });

      render(
        <AdminOnly fallback={<span data-testid="fallback">No Access</span>}>
          <button>Admin Action</button>
        </AdminOnly>
      );

      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.getByText('No Access')).toBeInTheDocument();
    });
  });
});
