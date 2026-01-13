/**
 * Recent Activity Container Tests
 * Story 2.5: Recent Activity Feed - Integration with Dashboard API
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecentActivityContainer } from '@/components/dashboard/recent-activity-container';
import * as dashboardHook from '@/hooks/use-dashboard-data';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Create QueryClient for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </QueryClientProvider>
);

// Custom render
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

// Mock API activity data
const mockApiActivities = [
  {
    id: 'act_1',
    type: 'claimed' as const,
    salesId: 'user-1',
    salesName: 'สมชาย',
    leadId: 101,
    company: 'ABC Corp',
    customerName: 'John',
    timestamp: '2026-01-13T12:00:00Z',
  },
  {
    id: 'act_2',
    type: 'closed' as const,
    salesId: 'user-2',
    salesName: 'สมหญิง',
    leadId: 102,
    company: 'XYZ Ltd',
    customerName: 'Jane',
    timestamp: '2026-01-13T11:00:00Z',
  },
  {
    id: 'act_3',
    type: 'new' as const,
    salesId: '',
    salesName: '',
    leadId: 103,
    company: 'Tech Inc',
    customerName: 'Bob',
    timestamp: '2026-01-13T10:00:00Z',
  },
];

describe('RecentActivityContainer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should show skeleton when loading', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<RecentActivityContainer />);
      expect(screen.getByTestId('recent-activity-skeleton')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should render activities when data is available', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 20,
            lost: 5,
            unreachable: 5,
            conversionRate: 20,
          },
          trends: { daily: [] },
          recentActivity: mockApiActivities,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<RecentActivityContainer />);
      expect(screen.getByTestId('recent-activity-panel')).toBeInTheDocument();
    });

    it('should transform claimed activity correctly', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 20,
            lost: 5,
            unreachable: 5,
            conversionRate: 20,
          },
          trends: { daily: [] },
          recentActivity: [mockApiActivities[0]],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<RecentActivityContainer />);
      // Should show "สมชาย claimed ABC Corp"
      expect(screen.getByText('สมชาย claimed ABC Corp')).toBeInTheDocument();
    });

    it('should transform new lead activity correctly', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: {
          summary: {
            totalLeads: 100,
            claimed: 50,
            contacted: 30,
            closed: 20,
            lost: 5,
            unreachable: 5,
            conversionRate: 20,
          },
          trends: { daily: [] },
          recentActivity: [mockApiActivities[2]],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<RecentActivityContainer />);
      // Should show "New lead from Tech Inc"
      expect(screen.getByText('New lead from Tech Inc')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no activities', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: {
          summary: {
            totalLeads: 0,
            claimed: 0,
            contacted: 0,
            closed: 0,
            lost: 0,
            unreachable: 0,
            conversionRate: 0,
          },
          trends: { daily: [] },
          recentActivity: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<RecentActivityContainer />);
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error when API fails', () => {
      const mockError = {
        message: 'Failed to load data',
        statusCode: 500,
      };

      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: mockError as dashboardHook.UseDashboardDataReturn['error'],
        refetch: vi.fn(),
      });

      renderWithProviders(<RecentActivityContainer />);
      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
    });
  });
});
