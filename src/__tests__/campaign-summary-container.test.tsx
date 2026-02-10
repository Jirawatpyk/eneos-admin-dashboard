/**
 * Campaign Summary Container Tests
 * Story 2.9: Campaign Summary on Main Dashboard
 *
 * Tests container: loading skeleton, empty state, data pass-through
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CampaignSummaryContainer } from '@/components/dashboard/campaign-summary-container';

// Mock the useDashboardData hook
const mockUseDashboardData = vi.fn();
vi.mock('@/hooks/use-dashboard-data', () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('CampaignSummaryContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show skeleton while loading', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <CampaignSummaryContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-summary-skeleton')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when campaignSummary is null', () => {
      mockUseDashboardData.mockReturnValue({
        data: { campaignSummary: null },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <CampaignSummaryContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-summary-empty')).toBeInTheDocument();
    });

    it('should show empty state when data is undefined', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      render(
        <TestWrapper>
          <CampaignSummaryContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-summary-empty')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should render CampaignSummary when data is available', () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          campaignSummary: {
            totalCampaigns: 3,
            totalDelivered: 1500,
            avgOpenRate: 22.0,
            avgClickRate: 5.5,
            topCampaigns: [
              { campaignId: 1, campaignName: 'Test Campaign', clickRate: 7.0 },
            ],
          },
        },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <CampaignSummaryContainer />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-summary')).toBeInTheDocument();
      expect(screen.getByText('1,500')).toBeInTheDocument();
      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    });

    it('should call useDashboardData hook', () => {
      mockUseDashboardData.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <CampaignSummaryContainer />
        </TestWrapper>
      );

      expect(mockUseDashboardData).toHaveBeenCalled();
    });
  });
});
