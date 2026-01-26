/**
 * System Health Card Component Tests
 * Story 7.5: System Health
 *
 * Tests for:
 * - AC#1: System Health Card displays on Settings page
 * - AC#2: Service Status Display with indicators
 * - AC#3: Last Check Timestamp with relative time
 * - AC#4: Refresh button triggers API call
 * - AC#5: System Metrics Summary (version, uptime, last check)
 * - AC#6: Error State with retry button
 * - AC#8: Loading skeleton displays
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the system health hook
const mockRefetch = vi.fn();
const mockUseSystemHealth = vi.fn();

vi.mock('@/hooks/use-system-health', () => ({
  useSystemHealth: () => mockUseSystemHealth(),
  formatUptime: (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
    return parts.join(' ');
  },
}));

// Import component after mocking
import { SystemHealthCard } from '@/components/settings/system-health-card';

// Mock health data
const mockHealthyData = {
  status: 'healthy' as const,
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  uptime: 90061, // 1d 1h 1m
  services: {
    googleSheets: { status: 'up' as const, latency: 45 },
    geminiAI: { status: 'up' as const, latency: 120 },
    lineAPI: { status: 'up' as const, latency: 30 },
  },
};

const mockDegradedData = {
  ...mockHealthyData,
  status: 'degraded' as const,
  services: {
    ...mockHealthyData.services,
    geminiAI: { status: 'down' as const, latency: 0 },
  },
};

const mockUnhealthyData = {
  ...mockHealthyData,
  status: 'unhealthy' as const,
  services: {
    googleSheets: { status: 'down' as const, latency: 0 },
    geminiAI: { status: 'down' as const, latency: 0 },
    lineAPI: { status: 'down' as const, latency: 0 },
  },
};

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

describe('SystemHealthCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('AC#8: Loading State', () => {
    it('shows skeleton when loading', () => {
      mockUseSystemHealth.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('system-health-skeleton')).toBeInTheDocument();
    });
  });

  describe('AC#1: System Health Card', () => {
    it('renders health card with title', () => {
      mockUseSystemHealth.mockReturnValue({
        data: mockHealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
    });

    it('displays overall healthy status badge', () => {
      mockUseSystemHealth.mockReturnValue({
        data: mockHealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('status-badge-healthy')).toBeInTheDocument();
      expect(screen.getByText('Healthy')).toBeInTheDocument();
    });

    it('displays degraded status badge with yellow color', () => {
      mockUseSystemHealth.mockReturnValue({
        data: mockDegradedData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('status-badge-degraded')).toBeInTheDocument();
      expect(screen.getByText('Degraded')).toBeInTheDocument();
    });

    it('displays unhealthy status badge', () => {
      mockUseSystemHealth.mockReturnValue({
        data: mockUnhealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('status-badge-unhealthy')).toBeInTheDocument();
      expect(screen.getByText('Unhealthy')).toBeInTheDocument();
    });
  });

  describe('AC#2: Service Status Display', () => {
    beforeEach(() => {
      mockUseSystemHealth.mockReturnValue({
        data: mockHealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });
    });

    it('displays Google Sheets status', () => {
      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByText('Google Sheets')).toBeInTheDocument();
      expect(screen.getByText('45ms')).toBeInTheDocument();
    });

    it('displays Gemini AI status', () => {
      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByText('Gemini AI')).toBeInTheDocument();
      expect(screen.getByText('120ms')).toBeInTheDocument();
    });

    it('displays LINE API status', () => {
      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByText('LINE API')).toBeInTheDocument();
      expect(screen.getByText('30ms')).toBeInTheDocument();
    });

    it('shows 3 Up badges for healthy services', () => {
      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getAllByText('Up')).toHaveLength(3);
    });

    it('shows green indicator icons for up services', () => {
      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getAllByTestId('status-icon-up')).toHaveLength(3);
    });

    it('shows Down badge for down service', () => {
      mockUseSystemHealth.mockReturnValue({
        data: mockDegradedData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByText('Down')).toBeInTheDocument();
      expect(screen.getByTestId('status-icon-down')).toBeInTheDocument();
    });

    it('shows unknown status for missing service data', () => {
      mockUseSystemHealth.mockReturnValue({
        data: {
          ...mockHealthyData,
          services: {
            googleSheets: { status: 'unknown' as const, latency: 0 },
            geminiAI: { status: 'up' as const, latency: 120 },
            lineAPI: { status: 'up' as const, latency: 30 },
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByTestId('status-icon-unknown')).toBeInTheDocument();
    });
  });

  describe('AC#4: Refresh Button', () => {
    it('renders refresh button', () => {
      mockUseSystemHealth.mockReturnValue({
        data: mockHealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('calls refetch when refresh button is clicked', async () => {
      mockRefetch.mockResolvedValue(undefined);
      mockUseSystemHealth.mockReturnValue({
        data: mockHealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('shows loading spinner while refreshing', () => {
      mockUseSystemHealth.mockReturnValue({
        data: mockHealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: true,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      const refreshButton = screen.getByTestId('refresh-button');
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('AC#5: System Metrics Summary', () => {
    it('displays API version', () => {
      mockUseSystemHealth.mockReturnValue({
        data: mockHealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('metric-version')).toBeInTheDocument();
      expect(screen.getByText('1.0.0')).toBeInTheDocument();
    });

    it('displays formatted uptime', () => {
      mockUseSystemHealth.mockReturnValue({
        data: mockHealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('metric-uptime')).toBeInTheDocument();
      // 90061 seconds = 1d 1h 1m
      expect(screen.getByText('1d 1h 1m')).toBeInTheDocument();
    });

    it('displays last check timestamp', () => {
      mockUseSystemHealth.mockReturnValue({
        data: mockHealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('metric-last-check')).toBeInTheDocument();
    });

    it('shows dash for missing version', () => {
      mockUseSystemHealth.mockReturnValue({
        data: { ...mockHealthyData, version: undefined },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      const versionElement = screen.getByTestId('metric-version');
      expect(versionElement).toHaveTextContent('-');
    });
  });

  describe('AC#6: Error State Handling', () => {
    it('shows error message when health check fails', () => {
      mockUseSystemHealth.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('system-health-card-error')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Unable to fetch health status')).toBeInTheDocument();
    });

    it('shows retry button in error state', () => {
      mockUseSystemHealth.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('calls refetch when retry button is clicked', async () => {
      mockRefetch.mockResolvedValue(undefined);
      mockUseSystemHealth.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('AC#3: Last Check Timestamp', () => {
    it('shows relative time format for last check', () => {
      // Set a specific timestamp 2 minutes ago
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      mockUseSystemHealth.mockReturnValue({
        data: { ...mockHealthyData, timestamp: twoMinutesAgo },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<SystemHealthCard />, { wrapper: createWrapper() });
      const lastCheckElement = screen.getByTestId('metric-last-check');
      // Should contain relative time text (e.g., "2 minutes ago" or "less than a minute ago")
      expect(lastCheckElement).toBeInTheDocument();
    });
  });

  describe('data-testid attributes', () => {
    beforeEach(() => {
      mockUseSystemHealth.mockReturnValue({
        data: mockHealthyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });
    });

    it('has system-health-card testid', () => {
      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
    });

    it('has refresh-button testid', () => {
      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('has service row testids', () => {
      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('service-row-google-sheets')).toBeInTheDocument();
      expect(screen.getByTestId('service-row-gemini-ai')).toBeInTheDocument();
      expect(screen.getByTestId('service-row-line-api')).toBeInTheDocument();
    });

    it('has metric testids', () => {
      render(<SystemHealthCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('metric-version')).toBeInTheDocument();
      expect(screen.getByTestId('metric-uptime')).toBeInTheDocument();
      expect(screen.getByTestId('metric-last-check')).toBeInTheDocument();
    });
  });
});
