/**
 * RoleGate Component Tests
 * Story 1.5: Role-based Access Control
 * AC: #3 (Admin Access), #4 (Viewer Access)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
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
    vi.resetModules();
    mockUseSession.mockReset();
  });

  describe('Access control', () => {
    it('should render children when user has allowed role', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Admin', email: 'admin@eneos.co.th', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { RoleGate } = await import('../components/shared/role-gate');

      render(
        <RoleGate allowedRoles={['admin']}>
          <button>Export Data</button>
        </RoleGate>
      );

      expect(screen.getByText('Export Data')).toBeInTheDocument();
    });

    it('should not render children when user does not have allowed role', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { RoleGate } = await import('../components/shared/role-gate');

      render(
        <RoleGate allowedRoles={['admin']}>
          <button>Export Data</button>
        </RoleGate>
      );

      expect(screen.queryByText('Export Data')).not.toBeInTheDocument();
    });

    it('should render fallback when user does not have allowed role', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { RoleGate } = await import('../components/shared/role-gate');

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

    it('should allow multiple roles', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { RoleGate } = await import('../components/shared/role-gate');

      render(
        <RoleGate allowedRoles={['admin', 'viewer']}>
          <button>View Dashboard</button>
        </RoleGate>
      );

      expect(screen.getByText('View Dashboard')).toBeInTheDocument();
    });
  });

  describe('Default behavior', () => {
    it('should default to viewer role when no session', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { RoleGate } = await import('../components/shared/role-gate');

      render(
        <RoleGate allowedRoles={['admin']}>
          <button>Admin Only</button>
        </RoleGate>
      );

      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    });

    it('should default to viewer role when session has no role', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'User', email: 'user@eneos.co.th' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { RoleGate } = await import('../components/shared/role-gate');

      render(
        <RoleGate allowedRoles={['admin']}>
          <button>Admin Only</button>
        </RoleGate>
      );

      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    });
  });

  describe('Tooltip with fallback', () => {
    it('should render fallback with disabled state', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { RoleGate } = await import('../components/shared/role-gate');

      // Test without tooltip to avoid provider issues
      render(
        <RoleGate
          allowedRoles={['admin']}
          fallback={<button disabled data-testid="disabled-btn">Export (disabled)</button>}
        >
          <button>Export</button>
        </RoleGate>
      );

      // The disabled button should be rendered as fallback
      expect(screen.getByTestId('disabled-btn')).toBeInTheDocument();
      expect(screen.getByTestId('disabled-btn')).toBeDisabled();
    });
  });

  describe('AdminOnly convenience component', () => {
    it('should render children for admin user', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Admin', email: 'admin@eneos.co.th', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { AdminOnly } = await import('../components/shared/role-gate');

      render(
        <AdminOnly>
          <button data-testid="admin-button">Admin Action</button>
        </AdminOnly>
      );

      expect(screen.getByTestId('admin-button')).toBeInTheDocument();
    });

    it('should not render children for viewer user', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { AdminOnly } = await import('../components/shared/role-gate');

      render(
        <AdminOnly>
          <button data-testid="admin-button">Admin Action</button>
        </AdminOnly>
      );

      expect(screen.queryByTestId('admin-button')).not.toBeInTheDocument();
    });

    it('should render fallback for viewer user', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Viewer', email: 'viewer@eneos.co.th', role: 'viewer' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      const { AdminOnly } = await import('../components/shared/role-gate');

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
