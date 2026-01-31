/**
 * Campaign Table Pagination Component Tests
 * Story 5.4: Campaign Table
 * AC#3: Pagination
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignTablePagination } from '../components/campaigns/campaign-table-pagination';

describe('CampaignTablePagination', () => {
  const defaultProps = {
    page: 1,
    pageSize: 20,
    total: 50,
    totalPages: 3,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  describe('Display', () => {
    it('should show correct range information', () => {
      render(<CampaignTablePagination {...defaultProps} />);

      expect(screen.getByTestId('pagination-range')).toHaveTextContent(
        'Showing 1 to 20 of 50 campaigns'
      );
    });

    it('should show correct page info', () => {
      render(<CampaignTablePagination {...defaultProps} page={2} />);

      expect(screen.getByTestId('pagination-info')).toHaveTextContent('Page 2 of 3');
    });

    it('should handle last page range correctly', () => {
      render(
        <CampaignTablePagination
          {...defaultProps}
          page={3}
          total={45}
          totalPages={3}
        />
      );

      // Page 3: items 41-45 of 45
      expect(screen.getByTestId('pagination-range')).toHaveTextContent(
        'Showing 41 to 45 of 45 campaigns'
      );
    });
  });

  describe('Navigation', () => {
    it('should disable Previous on first page', () => {
      render(<CampaignTablePagination {...defaultProps} page={1} />);

      expect(screen.getByTestId('pagination-previous')).toBeDisabled();
    });

    it('should disable Next on last page', () => {
      render(<CampaignTablePagination {...defaultProps} page={3} totalPages={3} />);

      expect(screen.getByTestId('pagination-next')).toBeDisabled();
    });

    it('should call onPageChange when clicking Previous', async () => {
      const onPageChange = vi.fn();
      render(
        <CampaignTablePagination {...defaultProps} page={2} onPageChange={onPageChange} />
      );

      await userEvent.click(screen.getByTestId('pagination-previous'));

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange when clicking Next', async () => {
      const onPageChange = vi.fn();
      render(
        <CampaignTablePagination {...defaultProps} page={1} onPageChange={onPageChange} />
      );

      await userEvent.click(screen.getByTestId('pagination-next'));

      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Page Size Selector', () => {
    it('should render page size selector with current value', () => {
      render(<CampaignTablePagination {...defaultProps} pageSize={20} />);

      // Verify selector exists and shows current value
      const selector = screen.getByTestId('pagination-page-size-select');
      expect(selector).toBeInTheDocument();
      expect(selector).toHaveTextContent('20');
    });

    it('should render "Rows per page" label', () => {
      render(<CampaignTablePagination {...defaultProps} />);

      expect(screen.getByText('Rows per page')).toBeInTheDocument();
    });

    // Note: Select interaction tests skipped due to Radix UI hasPointerCapture JSDOM issue
    // These are tested via E2E tests or manual testing
  });

  describe('Empty State', () => {
    it('should hide pagination when total is 0', () => {
      render(<CampaignTablePagination {...defaultProps} total={0} totalPages={0} />);

      expect(screen.queryByTestId('campaign-table-pagination')).not.toBeInTheDocument();
    });
  });

  describe('Fetching State', () => {
    it('should show reduced opacity when fetching', () => {
      render(<CampaignTablePagination {...defaultProps} isFetching={true} />);

      const pagination = screen.getByTestId('campaign-table-pagination');
      expect(pagination.className).toContain('opacity-70');
    });

    it('should disable buttons when fetching', () => {
      render(
        <CampaignTablePagination {...defaultProps} page={2} isFetching={true} />
      );

      expect(screen.getByTestId('pagination-previous')).toBeDisabled();
      expect(screen.getByTestId('pagination-next')).toBeDisabled();
    });
  });
});
