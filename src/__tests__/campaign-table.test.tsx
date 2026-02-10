/**
 * Campaign Table Component Tests
 * Story 5.4: Campaign Table
 * Story 5.5: Open Rate & Click Rate Display
 * AC: #1-#8 (5.4), #3, #7 (5.5)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CampaignTable } from '../components/campaigns/campaign-table';
import type { ReactNode } from 'react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const mockCampaignsResponse = {
  success: true,
  data: {
    data: [
      {
        campaignId: 1,
        campaignName: 'January Promo Campaign',
        delivered: 1000,
        opened: 600,
        clicked: 250,
        uniqueOpens: 500,
        uniqueClicks: 200,
        openRate: 50.0,
        clickRate: 20.0,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-15T10:00:00Z',
        lastUpdated: '2026-01-20T10:00:00Z',
      },
      {
        campaignId: 2,
        campaignName: 'February Newsletter',
        delivered: 2000,
        opened: 800,
        clicked: 400,
        uniqueOpens: 700,
        uniqueClicks: 300,
        openRate: 35.0,
        clickRate: 15.0,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-18T10:00:00Z',
        lastUpdated: '2026-01-22T10:00:00Z',
      },
    ],
    pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
  },
};

const mockEmptyResponse = {
  success: true,
  data: {
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  },
};

describe('CampaignTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('AC#1: Campaign Table Display', () => {
    it('should render table with correct columns', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('campaign-table')).toBeInTheDocument();
      });

      // Check column headers
      expect(screen.getByText('Campaign Name')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
      expect(screen.getByText('Opened')).toBeInTheDocument();
      expect(screen.getByText('Clicked')).toBeInTheDocument();
      expect(screen.getByText('Open Rate')).toBeInTheDocument();
      expect(screen.getByText('Click Rate')).toBeInTheDocument();
      expect(screen.getByText('Last Updated')).toBeInTheDocument();
    });

    it('should render campaign rows', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('January Promo Campaign')).toBeInTheDocument();
      });

      expect(screen.getByText('February Newsletter')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-row-2')).toBeInTheDocument();
    });
  });

  describe('AC#2: Data Formatting', () => {
    it('should format numbers with locale separators', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument(); // delivered
      });

      expect(screen.getByText('2,000')).toBeInTheDocument();
    });

    it('should format rates as percentages with 1 decimal', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('50.0%')).toBeInTheDocument(); // openRate
      });

      expect(screen.getByText('20.0%')).toBeInTheDocument(); // clickRate
      expect(screen.getByText('35.0%')).toBeInTheDocument();
      expect(screen.getByText('15.0%')).toBeInTheDocument();
    });

    it('should display uniqueOpens as Opened column', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('500')).toBeInTheDocument(); // uniqueOpens
      });

      expect(screen.getByText('700')).toBeInTheDocument();
    });

    it('should format Last Updated as formatted date', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('campaign-table')).toBeInTheDocument();
      });

      // formatDateSafe formats as DD/MM/YYYY, HH:mm:ss in Bangkok timezone
      // '2026-01-20T10:00:00Z' → '20/01/2026, 17:00:00' (Bangkok UTC+7)
      const tableContent = screen.getByTestId('campaign-table').textContent;
      expect(tableContent).toMatch(/20\/01\/2026/);
    });
  });

  describe('AC#3: Pagination', () => {
    it('should render pagination controls', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('campaign-table-pagination')).toBeInTheDocument();
      });

      expect(screen.getByTestId('pagination-range')).toHaveTextContent('Showing 1 to 2 of 2 campaigns');
      expect(screen.getByTestId('pagination-info')).toHaveTextContent('Page 1 of 1');
    });

    it('should have page size selector showing current value', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('pagination-page-size-select')).toBeInTheDocument();
      });

      // Verify selector exists and shows default value (20)
      const selectTrigger = screen.getByTestId('pagination-page-size-select');
      expect(selectTrigger).toHaveTextContent('20');
    });

    // Note: Select interaction tests skipped due to Radix UI hasPointerCapture JSDOM issue
  });

  describe('AC#4: Sorting', () => {
    it('should have sortable column headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('sort-header-delivered')).toBeInTheDocument();
      });

      // All sortable column headers should be present
      expect(screen.getByTestId('sort-header-campaignName')).toBeInTheDocument();
      expect(screen.getByTestId('sort-header-uniqueOpens')).toBeInTheDocument();
      expect(screen.getByTestId('sort-header-uniqueClicks')).toBeInTheDocument();
      expect(screen.getByTestId('sort-header-openRate')).toBeInTheDocument();
      expect(screen.getByTestId('sort-header-clickRate')).toBeInTheDocument();
      expect(screen.getByTestId('sort-header-lastUpdated')).toBeInTheDocument();
    });

    it('should call API with sort params when clicking header', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('sort-header-delivered')).toBeInTheDocument();
      });

      // Click Delivered header to sort
      await userEvent.click(screen.getByTestId('sort-header-delivered'));

      await waitFor(() => {
        // Should have called with sortBy=Delivered
        const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0];
        expect(lastCall).toContain('sortBy=Delivered');
      });
    });

    it('should toggle sort order when clicking same column', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('sort-header-delivered')).toBeInTheDocument();
      });

      // First click - should sort desc
      await userEvent.click(screen.getByTestId('sort-header-delivered'));

      await waitFor(() => {
        const call = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0];
        expect(call).toContain('sortBy=Delivered');
        expect(call).toContain('sortOrder=desc');
      });

      // Second click - should toggle to asc
      await userEvent.click(screen.getByTestId('sort-header-delivered'));

      await waitFor(() => {
        const call = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0];
        expect(call).toContain('sortOrder=asc');
      });
    });
  });

  describe('AC#5: Loading State', () => {
    it('should show skeleton while loading', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<CampaignTable />, { wrapper: createWrapper() });

      expect(screen.getByTestId('campaign-table-skeleton')).toBeInTheDocument();
    });
  });

  describe('AC#6: Empty State', () => {
    it('should show empty state when no campaigns', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEmptyResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('campaign-table-empty')).toBeInTheDocument();
      });

      expect(screen.getByText('No campaigns yet')).toBeInTheDocument();
      expect(screen.getByText(/Campaign data will appear here once Brevo sends events/)).toBeInTheDocument();
    });
  });

  describe('AC#7: Error State', () => {
    it('should show error state with retry button', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(screen.getByTestId('campaigns-error')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(screen.getByText('Failed to load campaigns')).toBeInTheDocument();
      expect(screen.getByTestId('btn-campaigns-retry')).toBeInTheDocument();
    });

    it('should retry when clicking retry button', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCampaignsResponse),
        });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(screen.getByTestId('btn-campaigns-retry')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Click retry
      await userEvent.click(screen.getByTestId('btn-campaigns-retry'));

      await waitFor(() => {
        expect(screen.getByTestId('campaign-table')).toBeInTheDocument();
      });
    });
  });

  describe('AC#8: Responsive Layout', () => {
    it('should have sticky first column', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('campaign-table')).toBeInTheDocument();
      });

      // The first column should have sticky class
      const firstHeaderCell = screen.getAllByRole('columnheader')[0];
      expect(firstHeaderCell.className).toContain('sticky');
    });
  });

  // Story 5.5: Rate Performance Badges
  describe('Story 5.5 AC#3: Rate Performance Badges', () => {
    it('should render rate badges for open and click rates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('campaign-table')).toBeInTheDocument();
      });

      // Should have rate badges (one per row for each rate type)
      const openRateBadges = screen.getAllByTestId('rate-badge-open');
      const clickRateBadges = screen.getAllByTestId('rate-badge-click');

      expect(openRateBadges.length).toBe(2); // 2 campaigns
      expect(clickRateBadges.length).toBe(2);
    });

    it('should show correct performance level for excellent rates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignsResponse),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('campaign-table')).toBeInTheDocument();
      });

      // First campaign has openRate=50% (excellent) and clickRate=20% (excellent)
      const openRateBadges = screen.getAllByTestId('rate-badge-open');
      expect(openRateBadges[0]).toHaveAttribute('data-level', 'excellent');

      const clickRateBadges = screen.getAllByTestId('rate-badge-click');
      expect(clickRateBadges[0]).toHaveAttribute('data-level', 'excellent');
    });
  });

  describe('Story 5.5 AC#7: Empty Rate Handling', () => {
    const mockCampaignWithZeroDelivered = {
      success: true,
      data: {
        data: [
          {
            campaignId: 3,
            campaignName: 'Draft Campaign',
            delivered: 0,
            opened: 0,
            clicked: 0,
            uniqueOpens: 0,
            uniqueClicks: 0,
            openRate: 0,
            clickRate: 0,
            hardBounce: 0,
            softBounce: 0,
            unsubscribe: 0,
            spam: 0,
            firstEvent: null,
            lastUpdated: '2026-01-25T10:00:00Z',
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    };

    it('should show "-" for campaigns with 0 delivered', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaignWithZeroDelivered),
      });

      render(<CampaignTable />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('campaign-table')).toBeInTheDocument();
      });

      // Should show empty state badges
      expect(screen.getByTestId('rate-badge-open-empty')).toBeInTheDocument();
      expect(screen.getByTestId('rate-badge-click-empty')).toBeInTheDocument();
    });
  });
});
