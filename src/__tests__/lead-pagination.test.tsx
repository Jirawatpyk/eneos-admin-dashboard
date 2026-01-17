/**
 * LeadPagination Component Tests
 * Story 4.2: Pagination - AC#1-8
 *
 * Tests for pagination UI component
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadPagination } from '@/components/leads/lead-pagination';

describe('LeadPagination', () => {
  const defaultProps = {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
    onPageChange: vi.fn(),
    onLimitChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#1: Pagination Controls Display', () => {
    it('renders pagination controls', () => {
      render(<LeadPagination {...defaultProps} />);

      expect(screen.getByTestId('lead-pagination')).toBeInTheDocument();
    });

    it('shows "Showing X-Y of Z leads" text', () => {
      render(<LeadPagination {...defaultProps} page={1} limit={20} total={100} />);

      expect(screen.getByTestId('pagination-range')).toHaveTextContent(
        'Showing 1-20 of 100 leads'
      );
    });

    it('shows correct range for second page', () => {
      render(<LeadPagination {...defaultProps} page={2} limit={20} total={100} />);

      expect(screen.getByTestId('pagination-range')).toHaveTextContent(
        'Showing 21-40 of 100 leads'
      );
    });

    it('shows correct range for last partial page', () => {
      render(
        <LeadPagination
          {...defaultProps}
          page={5}
          limit={20}
          total={95}
          totalPages={5}
        />
      );

      expect(screen.getByTestId('pagination-range')).toHaveTextContent(
        'Showing 81-95 of 95 leads'
      );
    });

    it('shows page size selector', () => {
      render(<LeadPagination {...defaultProps} />);

      expect(screen.getByTestId('pagination-limit-select')).toBeInTheDocument();
    });
  });

  describe('AC#2: Page Size Selection', () => {
    it('calls onLimitChange when page size changes', () => {
      const onLimitChange = vi.fn();
      render(<LeadPagination {...defaultProps} onLimitChange={onLimitChange} />);

      fireEvent.click(screen.getByTestId('pagination-limit-select'));
      fireEvent.click(screen.getByText('50'));

      expect(onLimitChange).toHaveBeenCalledWith(50);
    });

    it('shows current limit value in selector', () => {
      render(<LeadPagination {...defaultProps} limit={25} />);

      expect(screen.getByTestId('pagination-limit-select')).toHaveTextContent('25');
    });
  });

  describe('AC#3: Page Navigation', () => {
    it('calls onPageChange when clicking next', () => {
      const onPageChange = vi.fn();
      render(<LeadPagination {...defaultProps} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByTestId('pagination-next'));

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when clicking previous', () => {
      const onPageChange = vi.fn();
      render(
        <LeadPagination {...defaultProps} page={3} onPageChange={onPageChange} />
      );

      fireEvent.click(screen.getByTestId('pagination-previous'));

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when clicking a page number', () => {
      const onPageChange = vi.fn();
      render(<LeadPagination {...defaultProps} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByTestId('pagination-page-3'));

      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('disables Previous button on first page', () => {
      render(<LeadPagination {...defaultProps} page={1} />);

      const prevButton = screen.getByTestId('pagination-previous');
      expect(prevButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('disables Next button on last page', () => {
      render(<LeadPagination {...defaultProps} page={5} totalPages={5} />);

      const nextButton = screen.getByTestId('pagination-next');
      expect(nextButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('highlights current page', () => {
      render(<LeadPagination {...defaultProps} page={2} />);

      const page2Button = screen.getByTestId('pagination-page-2');
      expect(page2Button).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('AC#5: Loading state (isFetching)', () => {
    it('shows reduced opacity when fetching', () => {
      render(<LeadPagination {...defaultProps} isFetching={true} />);

      expect(screen.getByTestId('lead-pagination')).toHaveClass('opacity-70');
    });

    it('disables limit selector when fetching', () => {
      render(<LeadPagination {...defaultProps} isFetching={true} />);

      expect(screen.getByTestId('pagination-limit-select')).toBeDisabled();
    });
  });

  describe('AC#6: Empty & Edge States', () => {
    it('returns null when total is 0', () => {
      const { container } = render(
        <LeadPagination {...defaultProps} total={0} totalPages={0} />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('shows only page 1 when totalPages is 1', () => {
      render(
        <LeadPagination
          {...defaultProps}
          total={10}
          limit={10}
          totalPages={1}
        />
      );

      expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument();
      expect(screen.queryByTestId('pagination-page-2')).not.toBeInTheDocument();
    });
  });

  describe('AC#7: Keyboard Navigation', () => {
    it('navigates on Enter key for page button', () => {
      const onPageChange = vi.fn();
      render(
        <LeadPagination {...defaultProps} page={2} onPageChange={onPageChange} />
      );

      const page3Button = screen.getByTestId('pagination-page-3');
      fireEvent.keyDown(page3Button, { key: 'Enter' });

      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('navigates on Space key for page button', () => {
      const onPageChange = vi.fn();
      render(
        <LeadPagination {...defaultProps} page={2} onPageChange={onPageChange} />
      );

      const page3Button = screen.getByTestId('pagination-page-3');
      fireEvent.keyDown(page3Button, { key: ' ' });

      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('has proper tab index for disabled buttons', () => {
      render(<LeadPagination {...defaultProps} page={1} />);

      const prevButton = screen.getByTestId('pagination-previous');
      expect(prevButton).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('First/Last buttons', () => {
    it('calls onPageChange(1) when clicking First', () => {
      const onPageChange = vi.fn();
      render(
        <LeadPagination {...defaultProps} page={3} onPageChange={onPageChange} />
      );

      fireEvent.click(screen.getByTestId('pagination-first'));

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange(totalPages) when clicking Last', () => {
      const onPageChange = vi.fn();
      render(
        <LeadPagination {...defaultProps} page={2} onPageChange={onPageChange} />
      );

      fireEvent.click(screen.getByTestId('pagination-last'));

      expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it('disables First button on page 1', () => {
      render(<LeadPagination {...defaultProps} page={1} />);

      expect(screen.getByTestId('pagination-first')).toBeDisabled();
    });

    it('disables Last button on last page', () => {
      render(<LeadPagination {...defaultProps} page={5} totalPages={5} />);

      expect(screen.getByTestId('pagination-last')).toBeDisabled();
    });
  });
});
