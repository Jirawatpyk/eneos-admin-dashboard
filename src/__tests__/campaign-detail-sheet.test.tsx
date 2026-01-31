/**
 * Campaign Detail Sheet Tests
 * Story 5.7: Campaign Detail Sheet
 * AC#1: Sheet opens on row click with campaign name title
 * AC#2: Campaign summary in sheet header
 * AC#8: Empty state
 * AC#9: Close on X, outside click, Escape
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CampaignDetailSheet } from '../components/campaigns/campaign-detail-sheet';
import type { CampaignStatsItem } from '@/types/campaigns';

// Mock the useCampaignEvents hook
const mockUseCampaignEvents = vi.fn();
vi.mock('@/hooks/use-campaign-events', () => ({
  useCampaignEvents: (...args: unknown[]) => mockUseCampaignEvents(...args),
}));

// Mock child components that are complex
vi.mock('../components/campaigns/campaign-events-table', () => ({
  CampaignEventsTable: (props: { events: unknown[] }) => (
    <div data-testid="mock-events-table">Events: {props.events.length}</div>
  ),
}));

vi.mock('../components/campaigns/campaign-event-filter', () => ({
  CampaignEventFilter: () => <div data-testid="mock-event-filter" />,
}));

vi.mock('../components/campaigns/campaign-event-search', () => ({
  CampaignEventSearch: () => <div data-testid="mock-event-search" />,
}));

vi.mock('../components/campaigns/campaign-date-filter', () => ({
  CampaignDateFilter: () => <div data-testid="mock-date-filter" />,
}));

vi.mock('../components/campaigns/campaign-events-skeleton', () => ({
  CampaignEventsSkeleton: () => <div data-testid="mock-events-skeleton" />,
}));

vi.mock('../components/campaigns/campaigns-error', () => ({
  CampaignsError: () => <div data-testid="mock-campaigns-error" />,
}));

const mockCampaign: CampaignStatsItem = {
  campaignId: 42,
  campaignName: 'Test Campaign',
  delivered: 1000,
  opened: 500,
  clicked: 200,
  uniqueOpens: 450,
  uniqueClicks: 180,
  openRate: 45.0,
  clickRate: 18.0,
  hardBounce: 0,
  softBounce: 0,
  unsubscribe: 0,
  spam: 0,
  firstEvent: '2026-01-15T08:00:00Z',
  lastUpdated: '2026-01-30T10:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('CampaignDetailSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCampaignEvents.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('should return null when campaign is null', () => {
    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={null}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(container.innerHTML).toBe('');
  });

  it('should render campaign name as title (AC#1)', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={mockCampaign}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('sheet-campaign-name')).toHaveTextContent('Test Campaign');
  });

  it('should display campaign summary metrics (AC#2)', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={mockCampaign}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('summary-delivered')).toHaveTextContent('1,000');
    expect(screen.getByTestId('summary-opened')).toHaveTextContent('450');
    expect(screen.getByTestId('summary-opened')).toHaveTextContent('45.0%');
    expect(screen.getByTestId('summary-clicked')).toHaveTextContent('180');
    expect(screen.getByTestId('summary-clicked')).toHaveTextContent('18.0%');
    // Fix #2: First Event date
    expect(screen.getByTestId('summary-first-event')).toBeInTheDocument();
  });

  it('should display First Event date when available (AC#2 Fix #2)', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={mockCampaign}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    const firstEventEl = screen.getByTestId('summary-first-event');
    // Should show formatted date (locale-dependent)
    expect(firstEventEl.textContent).not.toBe('-');
  });

  it('should display dash for First Event when not available', () => {
    const campaignNoFirstEvent = { ...mockCampaign, firstEvent: '' };
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={campaignNoFirstEvent}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('summary-first-event')).toHaveTextContent('-');
  });

  it('should show loading skeleton when isLoading', () => {
    mockUseCampaignEvents.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={mockCampaign}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('mock-events-skeleton')).toBeInTheDocument();
  });

  it('should show error state when isError', () => {
    mockUseCampaignEvents.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('API Error'),
      refetch: vi.fn(),
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={mockCampaign}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('mock-campaigns-error')).toBeInTheDocument();
  });

  it('should show empty state when no events (AC#8)', () => {
    mockUseCampaignEvents.mockReturnValue({
      data: { data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={mockCampaign}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('events-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No events found')).toBeInTheDocument();
  });

  it('should render events table when data is available', () => {
    mockUseCampaignEvents.mockReturnValue({
      data: {
        data: {
          data: [
            { eventId: 1, email: 'test@example.com', event: 'click', eventAt: '2026-01-30T10:00:00Z', url: null },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={mockCampaign}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('mock-events-table')).toBeInTheDocument();
  });

  it('should render filter components', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={mockCampaign}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('mock-event-filter')).toBeInTheDocument();
    expect(screen.getByTestId('mock-event-search')).toBeInTheDocument();
    expect(screen.getByTestId('mock-date-filter')).toBeInTheDocument();
  });

  it('should call useCampaignEvents with campaignId', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={mockCampaign}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(mockUseCampaignEvents).toHaveBeenCalledWith(
      expect.objectContaining({ campaignId: 42 })
    );
  });

  it('should render sheet description', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CampaignDetailSheet
          campaign={mockCampaign}
          open={true}
          onOpenChange={vi.fn()}
        />
      </Wrapper>
    );

    expect(screen.getByText('Campaign event details and metrics')).toBeInTheDocument();
  });
});
