/**
 * Campaign Date Filter Tests
 * Story 5.7: Campaign Detail Sheet
 * AC#13: Date range filter for event log (From/To date pickers)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignDateFilter } from '../components/campaigns/campaign-date-filter';

describe('CampaignDateFilter', () => {
  const defaultProps = {
    dateFrom: null,
    dateTo: null,
    onDateFromChange: vi.fn(),
    onDateToChange: vi.fn(),
  };

  it('should render From and To trigger buttons', () => {
    render(<CampaignDateFilter {...defaultProps} />);

    expect(screen.getByTestId('date-from-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('date-to-trigger')).toBeInTheDocument();
  });

  it('should display "From" text when no start date', () => {
    render(<CampaignDateFilter {...defaultProps} />);

    expect(screen.getByTestId('date-from-trigger')).toHaveTextContent('From');
  });

  it('should display "To" text when no end date', () => {
    render(<CampaignDateFilter {...defaultProps} />);

    expect(screen.getByTestId('date-to-trigger')).toHaveTextContent('To');
  });

  it('should display formatted date when dateFrom is set', () => {
    render(
      <CampaignDateFilter
        {...defaultProps}
        dateFrom={new Date('2026-01-15')}
      />
    );

    expect(screen.getByTestId('date-from-trigger')).toHaveTextContent('Jan 15');
  });

  it('should display formatted date when dateTo is set', () => {
    render(
      <CampaignDateFilter
        {...defaultProps}
        dateTo={new Date('2026-01-31')}
      />
    );

    expect(screen.getByTestId('date-to-trigger')).toHaveTextContent('Jan 31');
  });

  it('should not show clear button when no dates selected', () => {
    render(<CampaignDateFilter {...defaultProps} />);

    expect(screen.queryByTestId('date-filter-clear')).not.toBeInTheDocument();
  });

  it('should show clear button when dateFrom is set', () => {
    render(
      <CampaignDateFilter
        {...defaultProps}
        dateFrom={new Date('2026-01-15')}
      />
    );

    expect(screen.getByTestId('date-filter-clear')).toBeInTheDocument();
  });

  it('should show clear button when dateTo is set', () => {
    render(
      <CampaignDateFilter
        {...defaultProps}
        dateTo={new Date('2026-01-31')}
      />
    );

    expect(screen.getByTestId('date-filter-clear')).toBeInTheDocument();
  });

  it('should clear both dates when clear button is clicked', () => {
    const onDateFromChange = vi.fn();
    const onDateToChange = vi.fn();

    render(
      <CampaignDateFilter
        dateFrom={new Date('2026-01-15')}
        dateTo={new Date('2026-01-31')}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
      />
    );

    fireEvent.click(screen.getByTestId('date-filter-clear'));

    expect(onDateFromChange).toHaveBeenCalledWith(null);
    expect(onDateToChange).toHaveBeenCalledWith(null);
  });

  it('should have accessible label on clear button', () => {
    render(
      <CampaignDateFilter
        {...defaultProps}
        dateFrom={new Date('2026-01-15')}
      />
    );

    expect(screen.getByTestId('date-filter-clear')).toHaveAttribute(
      'aria-label',
      'Clear date filter'
    );
  });

  it('should render separator between From and To', () => {
    render(<CampaignDateFilter {...defaultProps} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
