/**
 * Campaign Events Skeleton Tests
 * Story 5.7: Campaign Detail Sheet
 * AC#6: Loading spinner/skeleton while event data is being fetched
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignEventsSkeleton } from '../components/campaigns/campaign-events-skeleton';

describe('CampaignEventsSkeleton', () => {
  it('should render skeleton container with testid', () => {
    render(<CampaignEventsSkeleton />);

    expect(screen.getByTestId('events-skeleton')).toBeInTheDocument();
  });

  it('should have aria-busy attribute for accessibility', () => {
    render(<CampaignEventsSkeleton />);

    expect(screen.getByTestId('events-skeleton')).toHaveAttribute('aria-busy', 'true');
  });

  it('should have aria-label for screen readers', () => {
    render(<CampaignEventsSkeleton />);

    expect(screen.getByTestId('events-skeleton')).toHaveAttribute(
      'aria-label',
      'Loading events'
    );
  });

  it('should render table headers', () => {
    render(<CampaignEventsSkeleton />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
  });

  it('should render 5 skeleton rows', () => {
    render(<CampaignEventsSkeleton />);

    // Each skeleton row has a TableRow, we check for 5 data rows
    // The table has 1 header row + 5 body rows = 6 total
    const container = screen.getByTestId('events-skeleton');
    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(5);
  });
});
