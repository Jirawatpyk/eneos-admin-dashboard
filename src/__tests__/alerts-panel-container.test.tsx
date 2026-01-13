/**
 * Alerts Panel Container Tests
 * Story 2.6: Alerts Panel - Integration with Dashboard API
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertsPanelContainer } from '@/components/dashboard/alerts-panel-container';
import * as dashboardHook from '@/hooks/use-dashboard-data';

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
    {children}
  </QueryClientProvider>
);

// Custom render
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

// Mock API alerts data
const mockAlerts = [
  {
    id: 'unclaimed-24h',
    type: 'unclaimed' as const,
    message: '5 leads ไม่มีคนรับ >24h',
    count: 5,
    severity: 'warning' as const,
    link: '/leads?status=new&ageMin=1440',
  },
  {
    id: 'stale-contacted',
    type: 'stale_contacted' as const,
    message: '3 leads contacted >7 days',
    count: 3,
    severity: 'warning' as const,
    link: '/leads?status=contacted&ageMin=10080',
  },
  {
    id: 'campaign-ending',
    type: 'campaign_ending' as const,
    message: 'Campaign Q1 ends in 3 days',
    severity: 'info' as const,
  },
];

// Base mock dashboard data
const baseDashboardData = {
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
};

describe('AlertsPanelContainer', () => {
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

      renderWithProviders(<AlertsPanelContainer />);
      expect(screen.getByTestId('alerts-panel-skeleton')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should render alerts panel when data is available', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: {
          ...baseDashboardData,
          alerts: mockAlerts,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<AlertsPanelContainer />);
      expect(screen.getByTestId('alerts-panel')).toBeInTheDocument();
    });

    it('should display warning alerts correctly', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: {
          ...baseDashboardData,
          alerts: mockAlerts,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<AlertsPanelContainer />);
      expect(screen.getByText('5 leads ไม่มีคนรับ >24h')).toBeInTheDocument();
      expect(screen.getByText('3 leads contacted >7 days')).toBeInTheDocument();
    });

    it('should display info alerts correctly', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: {
          ...baseDashboardData,
          alerts: mockAlerts,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<AlertsPanelContainer />);
      expect(screen.getByText('Campaign Q1 ends in 3 days')).toBeInTheDocument();
    });

    it('should show alert count badge for warnings', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: {
          ...baseDashboardData,
          alerts: mockAlerts,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<AlertsPanelContainer />);
      const badge = screen.getByTestId('alert-count-badge');
      expect(badge).toHaveTextContent('2'); // 2 warning alerts
    });
  });

  describe('Empty State', () => {
    it('should show "All clear!" when no alerts', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: {
          ...baseDashboardData,
          alerts: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<AlertsPanelContainer />);
      expect(screen.getByText(/all clear/i)).toBeInTheDocument();
    });

    it('should handle undefined alerts gracefully', () => {
      vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: {
          ...baseDashboardData,
          // alerts is undefined
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<AlertsPanelContainer />);
      expect(screen.getByText(/all clear/i)).toBeInTheDocument();
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

      renderWithProviders(<AlertsPanelContainer />);
      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
    });
  });

  describe('Period Parameter', () => {
    it('should pass period to useDashboardData hook', () => {
      const spy = vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: { ...baseDashboardData, alerts: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<AlertsPanelContainer period="week" />);
      expect(spy).toHaveBeenCalledWith({ period: 'week' });
    });

    it('should default to month period', () => {
      const spy = vi.spyOn(dashboardHook, 'useDashboardData').mockReturnValue({
        data: { ...baseDashboardData, alerts: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<AlertsPanelContainer />);
      expect(spy).toHaveBeenCalledWith({ period: 'month' });
    });
  });
});
