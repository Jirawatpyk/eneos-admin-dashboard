/**
 * Campaign Table Skeleton Component Tests
 * Story 5.4: Campaign Table
 * AC#5: Loading State
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignTableSkeleton } from '../components/campaigns/campaign-table-skeleton';

describe('CampaignTableSkeleton', () => {
  describe('AC#5: Loading state shows skeleton rows', () => {
    it('should render skeleton component', () => {
      render(<CampaignTableSkeleton />);

      expect(screen.getByTestId('campaign-table-skeleton')).toBeInTheDocument();
    });

    it('should have aria-busy attribute for accessibility', () => {
      render(<CampaignTableSkeleton />);

      expect(screen.getByTestId('campaign-table-skeleton')).toHaveAttribute(
        'aria-busy',
        'true'
      );
    });

    it('should render correct number of skeleton rows (10)', () => {
      render(<CampaignTableSkeleton />);

      const rows = screen.getAllByRole('row');
      // 1 header row + 10 body rows = 11
      expect(rows.length).toBe(11);
    });

    it('should render 7 columns', () => {
      render(<CampaignTableSkeleton />);

      const headerCells = screen.getAllByRole('columnheader');
      expect(headerCells.length).toBe(7);
    });

    it('should show card title "All Campaigns"', () => {
      render(<CampaignTableSkeleton />);

      expect(screen.getByText('All Campaigns')).toBeInTheDocument();
    });
  });
});
