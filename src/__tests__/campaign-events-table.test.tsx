/**
 * Campaign Events Table Tests
 * Story 5.7: Campaign Detail Sheet
 * AC#3: Event log table with Email, Event Type, Timestamp, URL columns
 * AC#5: Pagination controls (20 per page)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignEventsTable } from '../components/campaigns/campaign-events-table';
import type { CampaignEventItem } from '@/types/campaigns';

const mockEvents: CampaignEventItem[] = [
  {
    eventId: 1,
    email: 'john@example.com',
    event: 'click',
    eventAt: '2026-01-30T10:00:00Z',
    url: 'https://example.com/promo',
    firstname: 'John',
    lastname: 'Doe',
    company: 'Acme Corp',
  },
  {
    eventId: 2,
    email: 'jane@company.co.th',
    event: 'opened',
    eventAt: '2026-01-30T09:00:00Z',
    url: null,
    firstname: 'Jane',
    lastname: 'Smith',
    company: '',
  },
  {
    eventId: 3,
    email: 'admin@test.com',
    event: 'delivered',
    eventAt: '2026-01-30T08:00:00Z',
    url: null,
    firstname: '',
    lastname: '',
    company: '',
  },
];

describe('CampaignEventsTable', () => {
  const defaultProps = {
    events: mockEvents,
    page: 1,
    pageSize: 20,
    total: 3,
    totalPages: 1,
    onPageChange: vi.fn(),
  };

  it('should render the table with correct headers', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
  });

  it('should render all event rows', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    // Composite key: eventId-eventType (Story 5-10 fix)
    expect(screen.getByTestId('event-row-1-click')).toBeInTheDocument();
    expect(screen.getByTestId('event-row-2-opened')).toBeInTheDocument();
    expect(screen.getByTestId('event-row-3-delivered')).toBeInTheDocument();
  });

  it('should display email addresses', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@company.co.th')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
  });

  it('should render event badges with correct text', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    expect(screen.getByTestId('event-badge-click')).toHaveTextContent('click');
    expect(screen.getByTestId('event-badge-opened')).toHaveTextContent('opened');
    expect(screen.getByTestId('event-badge-delivered')).toHaveTextContent('delivered');
  });

  it('should format timestamps correctly', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    // date-fns format: yyyy-MM-dd HH:mm:ss (rendered in local timezone)
    // Check that timestamp cells contain date pattern instead of exact values
    const cells = screen.getAllByText(/^2026-01-30 \d{2}:\d{2}:\d{2}$/);
    expect(cells.length).toBeGreaterThanOrEqual(2);
  });

  it('should render URL as external link when present', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    const link = screen.getByText('https://example.com/promo');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/promo');
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
    expect(link.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should show dash when URL is null', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    // Two events have null URLs
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('should display pagination range text', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    expect(screen.getByTestId('events-pagination-range')).toHaveTextContent(
      'Showing 1 to 3 of 3 events'
    );
  });

  it('should display page info', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    expect(screen.getByTestId('events-pagination-info')).toHaveTextContent('Page 1 of 1');
  });

  it('should disable previous button on first page', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    const prevBtn = screen.getByTestId('events-pagination-previous');
    expect(prevBtn).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    const nextBtn = screen.getByTestId('events-pagination-next');
    expect(nextBtn).toBeDisabled();
  });

  it('should enable next button when more pages exist', () => {
    render(
      <CampaignEventsTable
        {...defaultProps}
        total={40}
        totalPages={2}
      />
    );

    const nextBtn = screen.getByTestId('events-pagination-next');
    expect(nextBtn).not.toBeDisabled();
  });

  it('should call onPageChange with next page', () => {
    const onPageChange = vi.fn();
    render(
      <CampaignEventsTable
        {...defaultProps}
        total={40}
        totalPages={2}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByTestId('events-pagination-next'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with previous page', () => {
    const onPageChange = vi.fn();
    render(
      <CampaignEventsTable
        {...defaultProps}
        page={2}
        total={40}
        totalPages={2}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByTestId('events-pagination-previous'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should calculate correct pagination range for page 2', () => {
    render(
      <CampaignEventsTable
        {...defaultProps}
        events={mockEvents.slice(0, 2)}
        page={2}
        total={22}
        totalPages={2}
      />
    );

    expect(screen.getByTestId('events-pagination-range')).toHaveTextContent(
      'Showing 21 to 22 of 22 events'
    );
  });

  it('should have correct accessibility labels on pagination buttons', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    expect(screen.getByTestId('events-pagination-previous')).toHaveAttribute(
      'aria-label',
      'Go to previous page'
    );
    expect(screen.getByTestId('events-pagination-next')).toHaveAttribute(
      'aria-label',
      'Go to next page'
    );
  });

  // Story 5-11: Contact data columns
  it('AC7: should display Name column with firstname + lastname', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    // John Doe
    expect(screen.getByTestId('event-name-1-click')).toHaveTextContent('John Doe');
    // Jane Smith
    expect(screen.getByTestId('event-name-2-opened')).toHaveTextContent('Jane Smith');
  });

  it('AC7: should show dash for Name when no contact data', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    // admin@test.com has no contact data
    expect(screen.getByTestId('event-name-3-delivered')).toHaveTextContent('-');
  });

  it('AC7: should display Company column', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    // Acme Corp
    expect(screen.getByTestId('event-company-1-click')).toHaveTextContent('Acme Corp');
  });

  it('AC7: should show dash for Company when empty', () => {
    render(<CampaignEventsTable {...defaultProps} />);

    // jane has no company
    expect(screen.getByTestId('event-company-2-opened')).toHaveTextContent('-');
    // admin has no company
    expect(screen.getByTestId('event-company-3-delivered')).toHaveTextContent('-');
  });
});
