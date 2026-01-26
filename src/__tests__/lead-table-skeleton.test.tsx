/**
 * Lead Table Skeleton Tests
 * Story 4.15: Display Grounding Fields - AC#6
 *
 * Tests for loading skeleton with updated column structure (9 columns + checkbox)
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LeadTableSkeleton } from '@/components/leads/lead-table-skeleton';

describe('LeadTableSkeleton', () => {
  // Story 4.15 AC#6: Loading skeleton has correct column count
  describe('Story 4.15 AC#6: Column Structure', () => {
    it('renders with correct aria-busy attribute', () => {
      render(<LeadTableSkeleton />);

      const skeletonCard = screen.getByTestId('lead-table-skeleton');
      expect(skeletonCard).toHaveAttribute('aria-busy', 'true');
    });

    it('displays "Lead List" header', () => {
      render(<LeadTableSkeleton />);

      expect(screen.getByText('Lead List')).toBeInTheDocument();
    });

    it('renders 9 column headers (Company, Capital, Location, Name, Email, Phone, Status, Owner, Date)', () => {
      render(<LeadTableSkeleton />);

      // Count all TableHead elements (skeleton placeholders)
      const table = screen.getByRole('table');
      const headerRow = table.querySelector('thead tr');
      const headers = headerRow?.querySelectorAll('th');

      // Expected: 9 columns
      expect(headers).toHaveLength(9);
    });

    it('renders 10 skeleton rows', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const rows = tbody?.querySelectorAll('tr');

      // Default SKELETON_ROWS = 10
      expect(rows).toHaveLength(10);
    });

    it('each row has 9 cells matching column count', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const firstRow = tbody?.querySelector('tr');
      const cells = firstRow?.querySelectorAll('td');

      // Each row should have 9 cells (matching header count)
      expect(cells).toHaveLength(9);
    });

    it('has sticky left column (Company)', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const headerRow = table.querySelector('thead tr');
      const firstHeader = headerRow?.querySelector('th');

      // First column (Company) should be sticky
      expect(firstHeader).toHaveClass('sticky', 'left-0', 'z-10', 'bg-background');
    });

    it('renders skeleton elements with proper styling', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const firstRow = tbody?.querySelector('tr');
      const firstCell = firstRow?.querySelector('td');

      // First cell should be sticky
      expect(firstCell).toHaveClass('sticky', 'left-0', 'z-10', 'bg-background');
    });
  });

  // AC#6: Column widths match actual table structure
  describe('AC#6: Column Widths', () => {
    it('uses appropriate widths for each column', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const firstRow = tbody?.querySelector('tr');
      const cells = firstRow?.querySelectorAll('td .h-4');

      // Verify skeleton placeholders exist (9 cells with h-4 class)
      expect(cells?.length).toBeGreaterThanOrEqual(9);
    });
  });

  // Story 4.1: Basic Skeleton Functionality
  describe('Story 4.1: Basic Skeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<LeadTableSkeleton />);
      expect(container).toBeTruthy();
    });

    it('has accessible loading state', () => {
      render(<LeadTableSkeleton />);

      const skeletonCard = screen.getByTestId('lead-table-skeleton');
      expect(skeletonCard).toHaveAttribute('aria-busy', 'true');
    });
  });
});
