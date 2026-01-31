/**
 * Activity Log Skeleton Tests
 * Story 7-7: Activity Log
 * AC#7: Loading state skeleton
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityLogSkeleton } from '@/components/settings/activity-log-skeleton';

describe('ActivityLogSkeleton', () => {
  describe('[P1] Rendering', () => {
    it('should render with data-testid', () => {
      render(<ActivityLogSkeleton />);
      expect(screen.getByTestId('activity-log-skeleton')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(<ActivityLogSkeleton />);
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Changed By')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    it('should render default 10 skeleton rows', () => {
      render(<ActivityLogSkeleton />);
      expect(screen.getByTestId('skeleton-row')).toBeInTheDocument();
    });

    it('should render custom number of rows', () => {
      const { container } = render(<ActivityLogSkeleton rows={5} />);
      // Table rows in tbody
      const tbody = container.querySelector('tbody');
      const rows = tbody?.querySelectorAll('tr');
      expect(rows).toHaveLength(5);
    });

    it('should render first row with skeleton-row testid', () => {
      const { container } = render(<ActivityLogSkeleton rows={3} />);
      const tbody = container.querySelector('tbody');
      const rows = tbody?.querySelectorAll('tr');
      // Only first row has data-testid
      expect(rows?.[0]).toHaveAttribute('data-testid', 'skeleton-row');
      expect(rows?.[1]).not.toHaveAttribute('data-testid');
    });
  });
});
