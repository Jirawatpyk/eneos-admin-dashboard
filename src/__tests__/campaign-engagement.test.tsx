/**
 * Campaign Engagement Component Tests
 * Story 9.7: Campaign Engagement Timeline UI
 *
 * AC#1: Events grouped by campaignId
 * AC#2: Chronological events with type/timestamp/URL
 * AC#3: Returns null when no events
 * AC#4: Distinct visual indicators per event type
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CampaignEngagement } from '@/components/leads/campaign-engagement';
import type { LeadCampaignEvent } from '@/types/lead-detail';

describe('CampaignEngagement', () => {
  const mockEvents: LeadCampaignEvent[] = [
    {
      campaignId: 'camp-1',
      campaignName: 'Campaign A',
      event: 'delivered',
      eventAt: '2026-02-01T03:00:00.000Z',
      url: null,
    },
    {
      campaignId: 'camp-1',
      campaignName: 'Campaign A',
      event: 'opened',
      eventAt: '2026-02-01T07:30:00.000Z',
      url: null,
    },
    {
      campaignId: 'camp-1',
      campaignName: 'Campaign A',
      event: 'click',
      eventAt: '2026-02-01T07:32:00.000Z',
      url: 'https://example.com/promo',
    },
    {
      campaignId: 'camp-2',
      campaignName: 'Campaign B',
      event: 'delivered',
      eventAt: '2026-02-05T02:00:00.000Z',
      url: null,
    },
    {
      campaignId: 'camp-2',
      campaignName: 'Campaign B',
      event: 'opened',
      eventAt: '2026-02-05T04:15:00.000Z',
      url: null,
    },
  ];

  describe('AC#3: Empty state', () => {
    it('returns null when events array is empty', () => {
      const { container } = render(<CampaignEngagement events={[]} />);
      expect(container.innerHTML).toBe('');
    });

    it('returns null when events is undefined', () => {
      const { container } = render(
        <CampaignEngagement events={undefined as unknown as LeadCampaignEvent[]} />
      );
      expect(container.innerHTML).toBe('');
    });
  });

  describe('AC#1: Events grouped by campaign', () => {
    it('renders events grouped by campaignId', () => {
      render(<CampaignEngagement events={mockEvents} />);

      const groups = screen.getAllByTestId('campaign-group');
      expect(groups).toHaveLength(2);
    });

    it('displays campaign name as header for each group', () => {
      render(<CampaignEngagement events={mockEvents} />);

      expect(screen.getByText('Campaign A')).toBeInTheDocument();
      expect(screen.getByText('Campaign B')).toBeInTheDocument();
    });
  });

  describe('AC#2: Chronological events with details', () => {
    it('renders all events across campaign groups', () => {
      render(<CampaignEngagement events={mockEvents} />);

      const events = screen.getAllByTestId('campaign-event');
      expect(events).toHaveLength(5);
    });

    it('displays event labels for each type', () => {
      render(<CampaignEngagement events={mockEvents} />);

      expect(screen.getAllByText('Delivered')).toHaveLength(2);
      expect(screen.getAllByText('Opened')).toHaveLength(2);
      expect(screen.getByText('Clicked')).toBeInTheDocument();
    });

    it('displays formatted timestamps', () => {
      render(<CampaignEngagement events={[mockEvents[0]]} />);

      // formatLeadDateTime formats to "DD MMM YYYY HH:mm" in Bangkok timezone (UTC+7)
      // 2026-02-01T03:00:00.000Z → 01 Feb 2026 10:00 (Bangkok)
      expect(screen.getByText(/01 Feb 2026/)).toBeInTheDocument();
    });
  });

  describe('AC#4: Click event URL display', () => {
    it('renders clickable link for click events with URL', () => {
      render(<CampaignEngagement events={mockEvents} />);

      const link = screen.getByTestId('campaign-event-url');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com/promo');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('does not render link for non-click events', () => {
      const deliveredOnly: LeadCampaignEvent[] = [
        {
          campaignId: 'camp-1',
          campaignName: 'Test',
          event: 'delivered',
          eventAt: '2026-02-01T03:00:00.000Z',
          url: null,
        },
      ];

      render(<CampaignEngagement events={deliveredOnly} />);

      expect(screen.queryByTestId('campaign-event-url')).not.toBeInTheDocument();
    });

    it('does not render link for click events without URL', () => {
      const clickNoUrl: LeadCampaignEvent[] = [
        {
          campaignId: 'camp-1',
          campaignName: 'Test',
          event: 'click',
          eventAt: '2026-02-01T03:00:00.000Z',
          url: null,
        },
      ];

      render(<CampaignEngagement events={clickNoUrl} />);

      expect(screen.queryByTestId('campaign-event-url')).not.toBeInTheDocument();
    });

    it('does not render link for non-http URLs (XSS prevention)', () => {
      const xssEvent: LeadCampaignEvent[] = [
        {
          campaignId: 'camp-1',
          campaignName: 'Test',
          event: 'click',
          eventAt: '2026-02-01T03:00:00.000Z',
          url: 'javascript:alert(1)',
        },
      ];

      render(<CampaignEngagement events={xssEvent} />);

      expect(screen.queryByTestId('campaign-event-url')).not.toBeInTheDocument();
    });

    it('renders link with aria-label for accessibility', () => {
      render(<CampaignEngagement events={mockEvents} />);

      const link = screen.getByTestId('campaign-event-url');
      expect(link).toHaveAttribute('aria-label', 'Open link: https://example.com/promo');
    });
  });

  describe('Multiple campaigns display', () => {
    it('renders separate groups for each campaign', () => {
      render(<CampaignEngagement events={mockEvents} />);

      const groups = screen.getAllByTestId('campaign-group');
      expect(groups).toHaveLength(2);

      // First group: Campaign A with 3 events
      const firstGroupEvents = groups[0].querySelectorAll('[data-testid="campaign-event"]');
      expect(firstGroupEvents).toHaveLength(3);

      // Second group: Campaign B with 2 events
      const secondGroupEvents = groups[1].querySelectorAll('[data-testid="campaign-event"]');
      expect(secondGroupEvents).toHaveLength(2);
    });
  });

  describe('Event sorting', () => {
    it('sorts events chronologically within each group (oldest first)', () => {
      const unsortedEvents: LeadCampaignEvent[] = [
        {
          campaignId: 'camp-1',
          campaignName: 'Test',
          event: 'click',
          eventAt: '2026-02-01T10:00:00.000Z',
          url: 'https://example.com',
        },
        {
          campaignId: 'camp-1',
          campaignName: 'Test',
          event: 'delivered',
          eventAt: '2026-02-01T01:00:00.000Z',
          url: null,
        },
        {
          campaignId: 'camp-1',
          campaignName: 'Test',
          event: 'opened',
          eventAt: '2026-02-01T05:00:00.000Z',
          url: null,
        },
      ];

      render(<CampaignEngagement events={unsortedEvents} />);

      const events = screen.getAllByTestId('campaign-event');
      expect(events[0]).toHaveTextContent('Delivered');
      expect(events[1]).toHaveTextContent('Opened');
      expect(events[2]).toHaveTextContent('Clicked');
    });
  });

  describe('Invalid date edge case', () => {
    it('does not crash when eventAt contains invalid date string', () => {
      const invalidDateEvents: LeadCampaignEvent[] = [
        {
          campaignId: 'camp-1',
          campaignName: 'Test',
          event: 'delivered',
          eventAt: 'not-a-date',
          url: null,
        },
        {
          campaignId: 'camp-1',
          campaignName: 'Test',
          event: 'opened',
          eventAt: '2026-02-01T05:00:00.000Z',
          url: null,
        },
      ];

      // Should render without throwing
      render(<CampaignEngagement events={invalidDateEvents} />);

      const events = screen.getAllByTestId('campaign-event');
      expect(events).toHaveLength(2);
    });
  });

  describe('Unknown event type handling', () => {
    it('handles unknown event types gracefully', () => {
      const unknownEvent: LeadCampaignEvent[] = [
        {
          campaignId: 'camp-1',
          campaignName: 'Test',
          event: 'bounced',
          eventAt: '2026-02-01T03:00:00.000Z',
          url: null,
        },
      ];

      render(<CampaignEngagement events={unknownEvent} />);

      // Falls back to showing the raw event type
      expect(screen.getByText('bounced')).toBeInTheDocument();
    });
  });
});
