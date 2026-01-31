/**
 * Campaign Event Filter Tests
 * Story 5.7: Campaign Detail Sheet
 * AC#4: Event type filter tabs (Task 6)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignEventFilter } from '../components/campaigns/campaign-event-filter';

describe('CampaignEventFilter', () => {
  it('should render all filter options', () => {
    render(<CampaignEventFilter selected="all" onSelect={vi.fn()} />);

    expect(screen.getByText('All Events')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('Opened')).toBeInTheDocument();
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });

  it('should highlight selected filter', () => {
    render(<CampaignEventFilter selected="opened" onSelect={vi.fn()} />);

    const openedBtn = screen.getByTestId('filter-btn-opened');
    expect(openedBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onSelect when clicking a filter', () => {
    const onSelect = vi.fn();
    render(<CampaignEventFilter selected="all" onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Delivered'));

    expect(onSelect).toHaveBeenCalledWith('delivered');
  });

  it('should mark non-selected filters as not pressed', () => {
    render(<CampaignEventFilter selected="click" onSelect={vi.fn()} />);

    const allBtn = screen.getByTestId('filter-btn-all');
    expect(allBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('should have group role for accessibility', () => {
    render(<CampaignEventFilter selected="all" onSelect={vi.fn()} />);

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'Filter by event type');
  });
});
