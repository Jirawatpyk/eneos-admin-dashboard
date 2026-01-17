/**
 * Lead Table States Tests
 * Story 4.1: Lead List Table
 * Story 4.3: Search - AC#6 Empty Search Results
 *
 * Tests for AC#6: Loading, Empty, and Error states
 * Story 4.3 tests: Empty state with search term
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadTableSkeleton } from '@/components/leads/lead-table-skeleton';
import { LeadTableEmpty } from '@/components/leads/lead-table-empty';
import { LeadTableError } from '@/components/leads/lead-table-error';

describe('LeadTableSkeleton', () => {
  // AC#6: Loading shows skeleton table rows (8 columns structure)
  it('renders skeleton component', () => {
    render(<LeadTableSkeleton />);

    expect(screen.getByTestId('lead-table-skeleton')).toBeInTheDocument();
  });

  it('shows card header with Lead List title', () => {
    render(<LeadTableSkeleton />);

    expect(screen.getByText('Lead List')).toBeInTheDocument();
  });

  it('renders 10 skeleton rows', () => {
    render(<LeadTableSkeleton />);

    const rows = screen.getAllByRole('row');
    // 1 header row + 10 body rows = 11 total
    expect(rows.length).toBe(11);
  });

  it('has aria-busy attribute for accessibility', () => {
    render(<LeadTableSkeleton />);

    expect(screen.getByTestId('lead-table-skeleton')).toHaveAttribute(
      'aria-busy',
      'true'
    );
  });
});

describe('LeadTableEmpty', () => {
  // AC#6: Empty shows "No leads found" with helpful message
  it('renders empty state component', () => {
    render(<LeadTableEmpty />);

    expect(screen.getByTestId('lead-table-empty')).toBeInTheDocument();
  });

  it('displays "No Leads Found" heading', () => {
    render(<LeadTableEmpty />);

    expect(screen.getByText('No Leads Found')).toBeInTheDocument();
  });

  it('displays default message', () => {
    render(<LeadTableEmpty />);

    expect(
      screen.getByText('No leads found in the system')
    ).toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    render(<LeadTableEmpty message="Custom empty message" />);

    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('displays helpful description about campaigns', () => {
    render(<LeadTableEmpty />);

    expect(
      screen.getByText(/Leads will appear here once they are created from campaigns/i)
    ).toBeInTheDocument();
  });

  // ==========================================================================
  // Story 4.3 AC#6: Empty Search Results
  // ==========================================================================
  describe('Story 4.3 AC#6: Empty Search Results', () => {
    it('displays search term in message when provided', () => {
      render(<LeadTableEmpty searchTerm="xyznonexistent123" />);

      expect(
        screen.getByTestId('empty-search-title')
      ).toHaveTextContent('No leads found for "xyznonexistent123"');
    });

    it('shows suggestion to try different keywords', () => {
      render(<LeadTableEmpty searchTerm="test" />);

      expect(
        screen.getByText(/Try a different search term or clear the search/i)
      ).toBeInTheDocument();
    });

    it('shows clear search button when onClearSearch is provided', () => {
      const mockClearSearch = vi.fn();
      render(
        <LeadTableEmpty searchTerm="test" onClearSearch={mockClearSearch} />
      );

      expect(screen.getByTestId('clear-search-button')).toBeInTheDocument();
      expect(screen.getByText('Clear search')).toBeInTheDocument();
    });

    it('calls onClearSearch when clear button is clicked', () => {
      const mockClearSearch = vi.fn();
      render(
        <LeadTableEmpty searchTerm="test" onClearSearch={mockClearSearch} />
      );

      fireEvent.click(screen.getByTestId('clear-search-button'));

      expect(mockClearSearch).toHaveBeenCalledTimes(1);
    });

    it('does not show clear button when onClearSearch is not provided', () => {
      render(<LeadTableEmpty searchTerm="test" />);

      expect(
        screen.queryByTestId('clear-search-button')
      ).not.toBeInTheDocument();
    });

    it('uses SearchX icon instead of Inbox when search term is provided', () => {
      render(<LeadTableEmpty searchTerm="test" />);

      // Should NOT show the campaign description when searching
      expect(
        screen.queryByText(/Leads will appear here once they are created from campaigns/i)
      ).not.toBeInTheDocument();
    });
  });
});

describe('LeadTableError', () => {
  const mockRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#6: Error shows retry button with error message
  it('renders error state component', () => {
    render(<LeadTableError message="Test error" onRetry={mockRetry} />);

    expect(screen.getByTestId('lead-table-error')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <LeadTableError
        message="Failed to fetch leads data"
        onRetry={mockRetry}
      />
    );

    expect(screen.getByText('Failed to fetch leads data')).toBeInTheDocument();
  });

  it('displays "Error Loading Leads" heading', () => {
    render(<LeadTableError message="Test error" onRetry={mockRetry} />);

    expect(screen.getByText('Error Loading Leads')).toBeInTheDocument();
  });

  it('renders retry button', () => {
    render(<LeadTableError message="Test error" onRetry={mockRetry} />);

    expect(screen.getByTestId('lead-table-retry-button')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(<LeadTableError message="Test error" onRetry={mockRetry} />);

    fireEvent.click(screen.getByTestId('lead-table-retry-button'));

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});
