/**
 * Campaign KPI Cards Grid Component Tests
 * Story 5.3: Campaign Summary Cards
 * AC: #1, #2, #3, #4, #5, #6, #7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CampaignKPICardsGrid } from '../components/campaigns/campaign-kpi-cards-grid';

// Mock the useCampaignStats hook
const mockUseCampaignStats = vi.fn();
vi.mock('@/hooks/use-campaign-stats', () => ({
  useCampaignStats: () => mockUseCampaignStats(),
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
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('CampaignKPICardsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#4: Loading state
  describe('AC#4: Loading State', () => {
    it('should show skeleton grid while loading', () => {
      mockUseCampaignStats.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-kpi-cards-skeleton')).toBeInTheDocument();
    });
  });

  // AC#5: Error state
  describe('AC#5: Error State', () => {
    it('should show error state when API fails', () => {
      mockUseCampaignStats.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Network error' },
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaigns-error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', async () => {
      const mockRefetch = vi.fn();
      mockUseCampaignStats.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Failed' },
        refetch: mockRefetch,
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      screen.getByTestId('btn-campaigns-retry').click();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  // AC#1: Four Campaign KPI cards display
  describe('AC#1: Four Campaign KPI Cards Display', () => {
    it('should render 4 KPI cards with data', () => {
      mockUseCampaignStats.mockReturnValue({
        data: {
          totalCampaigns: 10,
          delivered: 5000,
          opened: 2500,
          clicked: 1000,
          uniqueOpens: 2000,
          uniqueClicks: 800,
          openRate: 40.0,
          clickRate: 16.0,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-kpi-cards-grid')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-kpi-card-campaigns')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-kpi-card-delivered')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-kpi-card-opened')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-kpi-card-clicked')).toBeInTheDocument();
    });

    it('should display correct card titles', () => {
      mockUseCampaignStats.mockReturnValue({
        data: {
          totalCampaigns: 10,
          delivered: 5000,
          opened: 2500,
          clicked: 1000,
          uniqueOpens: 2000,
          uniqueClicks: 800,
          openRate: 40.0,
          clickRate: 16.0,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByText('Total Campaigns')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
      expect(screen.getByText('Opened')).toBeInTheDocument();
      expect(screen.getByText('Clicked')).toBeInTheDocument();
    });
  });

  // AC#2: Accurate data from API
  describe('AC#2: Accurate Data', () => {
    it('should display correct numeric values', () => {
      mockUseCampaignStats.mockReturnValue({
        data: {
          totalCampaigns: 25,
          delivered: 12345,
          opened: 6789,
          clicked: 2345,
          uniqueOpens: 5000,
          uniqueClicks: 2000,
          openRate: 40.5,
          clickRate: 16.2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-kpi-value-campaigns')).toHaveTextContent('25');
      expect(screen.getByTestId('campaign-kpi-value-delivered')).toHaveTextContent('12,345');
      // Opened card shows uniqueOpens (aggregated unique)
      expect(screen.getByTestId('campaign-kpi-value-opened')).toHaveTextContent('5,000');
      // Clicked card shows uniqueClicks (aggregated unique)
      expect(screen.getByTestId('campaign-kpi-value-clicked')).toHaveTextContent('2,000');
    });
  });

  // AC#3: Rate Display for Opened/Clicked
  describe('AC#3: Rate Display', () => {
    it('should display open rate', () => {
      mockUseCampaignStats.mockReturnValue({
        data: {
          totalCampaigns: 10,
          delivered: 5000,
          opened: 2500,
          clicked: 1000,
          uniqueOpens: 2000,
          uniqueClicks: 800,
          openRate: 40.0,
          clickRate: 16.0,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-kpi-rate-opened')).toHaveTextContent('40.0%');
      expect(screen.getByTestId('campaign-kpi-rate-opened')).toHaveTextContent('open rate');
    });

    it('should display click rate', () => {
      mockUseCampaignStats.mockReturnValue({
        data: {
          totalCampaigns: 10,
          delivered: 5000,
          opened: 2500,
          clicked: 1000,
          uniqueOpens: 2000,
          uniqueClicks: 800,
          openRate: 40.0,
          clickRate: 16.0,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-kpi-rate-clicked')).toHaveTextContent('16.0%');
      expect(screen.getByTestId('campaign-kpi-rate-clicked')).toHaveTextContent('click rate');
    });

    it('should not show rate for Total Campaigns and Delivered', () => {
      mockUseCampaignStats.mockReturnValue({
        data: {
          totalCampaigns: 10,
          delivered: 5000,
          opened: 2500,
          clicked: 1000,
          uniqueOpens: 2000,
          uniqueClicks: 800,
          openRate: 40.0,
          clickRate: 16.0,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.queryByTestId('campaign-kpi-rate-campaigns')).not.toBeInTheDocument();
      expect(screen.queryByTestId('campaign-kpi-rate-delivered')).not.toBeInTheDocument();
    });
  });

  // AC#6: Empty state
  describe('AC#6: Empty State', () => {
    it('should show empty state message when 0 campaigns', () => {
      mockUseCampaignStats.mockReturnValue({
        data: {
          totalCampaigns: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          uniqueOpens: 0,
          uniqueClicks: 0,
          openRate: 0,
          clickRate: 0,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-empty-message')).toBeInTheDocument();
      expect(
        screen.getByText(/No campaign data available yet/i)
      ).toBeInTheDocument();
    });

    it('should still show cards with 0 values in empty state', () => {
      mockUseCampaignStats.mockReturnValue({
        data: {
          totalCampaigns: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          uniqueOpens: 0,
          uniqueClicks: 0,
          openRate: 0,
          clickRate: 0,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.getByTestId('campaign-kpi-cards-grid')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-kpi-value-campaigns')).toHaveTextContent('0');
      expect(screen.getByTestId('campaign-kpi-value-delivered')).toHaveTextContent('0');
    });

    it('should not show empty message when campaigns exist', () => {
      mockUseCampaignStats.mockReturnValue({
        data: {
          totalCampaigns: 5,
          delivered: 1000,
          opened: 500,
          clicked: 200,
          uniqueOpens: 400,
          uniqueClicks: 150,
          openRate: 40.0,
          clickRate: 15.0,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      expect(screen.queryByTestId('campaign-empty-message')).not.toBeInTheDocument();
    });
  });

  // AC#7: Responsive layout
  describe('AC#7: Responsive Layout', () => {
    it('should have responsive grid classes', () => {
      mockUseCampaignStats.mockReturnValue({
        data: {
          totalCampaigns: 10,
          delivered: 5000,
          opened: 2500,
          clicked: 1000,
          uniqueOpens: 2000,
          uniqueClicks: 800,
          openRate: 40.0,
          clickRate: 16.0,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <CampaignKPICardsGrid />
        </TestWrapper>
      );

      const grid = screen.getByTestId('campaign-kpi-cards-grid');
      // lg:grid-cols-4 = 4 columns on desktop (≥1024px)
      expect(grid).toHaveClass('lg:grid-cols-4');
      // md:grid-cols-2 = 2x2 grid on tablet (768-1023px)
      expect(grid).toHaveClass('md:grid-cols-2');
      // grid-cols-1 = stack vertically on mobile (<768px)
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('grid');
    });
  });

  it('should return null when no data', () => {
    mockUseCampaignStats.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(
      <TestWrapper>
        <CampaignKPICardsGrid />
      </TestWrapper>
    );

    expect(container.firstChild).toBeNull();
  });
});
