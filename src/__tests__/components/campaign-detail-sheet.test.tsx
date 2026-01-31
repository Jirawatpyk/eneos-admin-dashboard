/**
 * Campaign Detail Sheet Tests
 * Story 5.7: Campaign Detail Sheet
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock hooks
vi.mock('@/hooks/use-campaign-events', () => ({
  useCampaignEvents: vi.fn(),
}));

// Mock child components
vi.mock('@/components/campaigns/campaign-events-table', () => ({
  CampaignEventsTable: vi.fn(() => <div data-testid="mock-events-table" />),
}));

vi.mock('@/components/campaigns/campaign-event-filter', () => ({
  CampaignEventFilter: vi.fn(() => <div data-testid="mock-event-filter" />),
}));

vi.mock('@/components/campaigns/campaign-event-search', () => ({
  CampaignEventSearch: vi.fn(() => <div data-testid="mock-event-search" />),
}));

vi.mock('@/components/campaigns/campaign-date-filter', () => ({
  CampaignDateFilter: vi.fn(() => <div data-testid="mock-date-filter" />),
}));

vi.mock('@/components/campaigns/campaign-events-skeleton', () => ({
  CampaignEventsSkeleton: vi.fn(() => <div data-testid="mock-events-skeleton" />),
}));

vi.mock('@/components/campaigns/campaigns-error', () => ({
  CampaignsError: vi.fn(({ message }: { message?: string }) => (
    <div data-testid="mock-campaigns-error">{message}</div>
  )),
}));

vi.mock('@/components/campaigns/copy-email-button', () => ({
  CopyEmailButton: vi.fn(() => <div data-testid="mock-copy-email" />),
}));

import { CampaignDetailSheet } from '@/components/campaigns/campaign-detail-sheet';
import { useCampaignEvents } from '@/hooks/use-campaign-events';
import type { CampaignStatsItem } from '@/types/campaigns';

const mockUseCampaignEvents = useCampaignEvents as ReturnType<typeof vi.fn>;

const mockCampaign: CampaignStatsItem = {
  campaignId: 42,
  campaignName: 'Test Campaign Q1',
  delivered: 1000,
  opened: 500,
  clicked: 200,
  uniqueOpens: 400,
  uniqueClicks: 150,
  openRate: 40.0,
  clickRate: 15.0,
  hardBounce: 0,
  softBounce: 0,
  unsubscribe: 0,
  spam: 0,
  firstEvent: '2026-01-01T00:00:00Z',
  lastUpdated: '2026-01-30T12:00:00Z',
};

describe('CampaignDetailSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCampaignEvents.mockReturnValue({
      data: {
        data: {
          data: [
            { eventId: 1, email: 'a@test.com', event: 'click', eventAt: '2026-01-30T10:00:00Z', url: null },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  describe('[P1] Null campaign', () => {
    it('should render nothing when campaign is null', () => {
      const { container } = render(
        <CampaignDetailSheet campaign={null} open={true} onOpenChange={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('[P1] Open state with data', () => {
    it('should render sheet with testid', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('campaign-detail-sheet')).toBeInTheDocument();
    });

    it('should display campaign name as title (AC#1)', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('sheet-campaign-name')).toHaveTextContent('Test Campaign Q1');
    });

    it('should display campaign summary section (AC#2)', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('campaign-summary')).toBeInTheDocument();
    });

    it('should display delivered count', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('summary-delivered')).toHaveTextContent('1,000');
    });

    it('should display opened count with rate', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      const opened = screen.getByTestId('summary-opened');
      expect(opened).toHaveTextContent('400');
      expect(opened).toHaveTextContent('40.0%');
    });

    it('should display clicked count with rate', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      const clicked = screen.getByTestId('summary-clicked');
      expect(clicked).toHaveTextContent('150');
      expect(clicked).toHaveTextContent('15.0%');
    });

    it('should display first event date', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('summary-first-event')).toBeInTheDocument();
    });

    it('should display last updated date', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('summary-last-updated')).toBeInTheDocument();
    });
  });

  describe('[P1] Event filter and search components', () => {
    it('should render event filter', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('mock-event-filter')).toBeInTheDocument();
    });

    it('should render event search', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('mock-event-search')).toBeInTheDocument();
    });

    it('should render date filter', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('mock-date-filter')).toBeInTheDocument();
    });
  });

  describe('[P1] Loading state (AC#6)', () => {
    it('should show skeleton when loading', () => {
      mockUseCampaignEvents.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('mock-events-skeleton')).toBeInTheDocument();
    });
  });

  describe('[P1] Error state (AC#7)', () => {
    it('should show error when request fails', () => {
      mockUseCampaignEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: { message: 'Server error' },
        refetch: vi.fn(),
      });

      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('mock-campaigns-error')).toBeInTheDocument();
    });
  });

  describe('[P1] Empty state (AC#8)', () => {
    it('should show empty state when no events', () => {
      mockUseCampaignEvents.mockReturnValue({
        data: {
          data: {
            data: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          },
        },
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('events-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No events found')).toBeInTheDocument();
    });
  });

  describe('[P1] Events table (AC#3)', () => {
    it('should render events table when data available', () => {
      render(
        <CampaignDetailSheet campaign={mockCampaign} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('mock-events-table')).toBeInTheDocument();
    });
  });

  describe('[P1] First event display', () => {
    it('should show dash when firstEvent is null', () => {
      const campaignNoFirstEvent = { ...mockCampaign, firstEvent: null };
      render(
        <CampaignDetailSheet campaign={campaignNoFirstEvent} open={true} onOpenChange={vi.fn()} />
      );
      expect(screen.getByTestId('summary-first-event')).toHaveTextContent('-');
    });
  });
});
