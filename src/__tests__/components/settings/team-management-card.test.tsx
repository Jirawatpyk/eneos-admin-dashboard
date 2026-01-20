/**
 * TeamManagementCard Component Tests
 * Story 7.4: Admin User Management
 * AC#1: Table view with all members
 * AC#2, AC#3: Filter controls
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamManagementCard, TeamManagementCardSkeleton } from '@/components/settings/team-management-card';
import type { TeamMember } from '@/types/team';

// Mock team members data
const mockMembers: TeamMember[] = [
  {
    lineUserId: 'U123456',
    name: 'John Admin',
    email: 'john@eneos.co.th',
    phone: '0812345678',
    role: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'active',
  },
  {
    lineUserId: 'U789012',
    name: 'Jane Sales',
    email: 'jane@eneos.co.th',
    phone: '0898765432',
    role: 'sales',
    createdAt: '2024-02-20T14:30:00Z',
    status: 'active',
  },
];

// Mock useTeamList hook
const mockUseTeamList = vi.fn();
vi.mock('@/hooks/use-team-management', () => ({
  useTeamList: (filter: unknown) => mockUseTeamList(filter),
  useUpdateTeamMember: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('TeamManagementCard Component', () => {
  beforeEach(() => {
    cleanup();
    mockUseTeamList.mockReset();
    mockUseTeamList.mockReturnValue({
      data: { members: mockMembers },
      isLoading: false,
      error: null,
    });
  });

  describe('AC#1: Table with members', () => {
    it('should render team management card', () => {
      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(screen.getByTestId('team-management-card')).toBeInTheDocument();
    });

    it('should display card title', () => {
      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(screen.getByText('Team Management')).toBeInTheDocument();
    });

    it('should display card description', () => {
      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(screen.getByText(/manage sales team members/i)).toBeInTheDocument();
    });

    it('should display results count for multiple members', () => {
      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(screen.getByTestId('results-count')).toHaveTextContent('2 members');
    });

    it('should use singular form for 1 member', () => {
      mockUseTeamList.mockReturnValue({
        data: { members: [mockMembers[0]] },
        isLoading: false,
        error: null,
      });

      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(screen.getByTestId('results-count')).toHaveTextContent('1 member');
    });

    it('should render team member table', () => {
      render(<TeamManagementCard />, { wrapper: createWrapper() });

      // Should render member names
      expect(screen.getByText('John Admin')).toBeInTheDocument();
      expect(screen.getByText('Jane Sales')).toBeInTheDocument();
    });
  });

  describe('AC#2, AC#3: Filter controls', () => {
    it('should render filter component', () => {
      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(screen.getByTestId('team-member-filter')).toBeInTheDocument();
    });

    it('should call useTeamList with default filter', () => {
      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(mockUseTeamList).toHaveBeenCalledWith({
        status: 'active',
        role: 'all',
      });
    });
  });

  describe('Loading state', () => {
    it('should show skeleton table when loading', () => {
      mockUseTeamList.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
    });

    it('should not show results count when loading', () => {
      mockUseTeamList.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(screen.queryByTestId('results-count')).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should display error message when fetch fails', () => {
      mockUseTeamList.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error'),
      });

      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
    });
  });

  describe('Empty state', () => {
    it('should show empty message when no members match filter', () => {
      mockUseTeamList.mockReturnValue({
        data: { members: [] },
        isLoading: false,
        error: null,
      });

      render(<TeamManagementCard />, { wrapper: createWrapper() });

      expect(screen.getByText(/no team members found/i)).toBeInTheDocument();
    });
  });
});

describe('TeamManagementCardSkeleton Component', () => {
  it('should render skeleton', () => {
    render(<TeamManagementCardSkeleton />);

    expect(screen.getByTestId('team-management-skeleton')).toBeInTheDocument();
  });
});
