/**
 * Campaign Event Search Tests
 * Story 5.7: Campaign Detail Sheet
 * AC#11: Debounced email search (300ms) with case-insensitive partial match
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CampaignEventSearch } from '../components/campaigns/campaign-event-search';

describe('CampaignEventSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render search input with default placeholder', () => {
    render(<CampaignEventSearch value="" onChange={vi.fn()} />);

    const input = screen.getByTestId('event-search-input');
    expect(input).toHaveAttribute('placeholder', 'Search by email...');
  });

  it('should render with custom placeholder', () => {
    render(
      <CampaignEventSearch
        value=""
        onChange={vi.fn()}
        placeholder="Custom search..."
      />
    );

    const input = screen.getByTestId('event-search-input');
    expect(input).toHaveAttribute('placeholder', 'Custom search...');
  });

  it('should have accessible label', () => {
    render(<CampaignEventSearch value="" onChange={vi.fn()} />);

    expect(screen.getByLabelText('Search events by email')).toBeInTheDocument();
  });

  it('should debounce onChange by 300ms', () => {
    const onChange = vi.fn();
    render(<CampaignEventSearch value="" onChange={onChange} />);

    const input = screen.getByTestId('event-search-input');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    // Should NOT have called onChange yet
    expect(onChange).not.toHaveBeenCalledWith('test@example.com');

    // Advance timer past debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledWith('test@example.com');
  });

  it('should not call onChange before debounce period', () => {
    const onChange = vi.fn();
    render(<CampaignEventSearch value="" onChange={onChange} />);

    const input = screen.getByTestId('event-search-input');
    fireEvent.change(input, { target: { value: 'test' } });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // 200ms < 300ms debounce, should not have fired yet with 'test'
    expect(onChange).not.toHaveBeenCalledWith('test');
  });

  it('should show clear button when value is present', () => {
    render(<CampaignEventSearch value="test" onChange={vi.fn()} />);

    expect(screen.getByTestId('event-search-clear')).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    render(<CampaignEventSearch value="" onChange={vi.fn()} />);

    expect(screen.queryByTestId('event-search-clear')).not.toBeInTheDocument();
  });

  it('should call onChange with empty string when clear is clicked', () => {
    const onChange = vi.fn();
    render(<CampaignEventSearch value="test" onChange={onChange} />);

    fireEvent.click(screen.getByTestId('event-search-clear'));

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should sync local value when external value changes', () => {
    const { rerender } = render(
      <CampaignEventSearch value="initial" onChange={vi.fn()} />
    );

    const input = screen.getByTestId('event-search-input');
    expect(input).toHaveValue('initial');

    rerender(<CampaignEventSearch value="updated" onChange={vi.fn()} />);
    expect(input).toHaveValue('updated');
  });

  it('should have clear button with accessible label', () => {
    render(<CampaignEventSearch value="test" onChange={vi.fn()} />);

    expect(screen.getByTestId('event-search-clear')).toHaveAttribute(
      'aria-label',
      'Clear search'
    );
  });
});
