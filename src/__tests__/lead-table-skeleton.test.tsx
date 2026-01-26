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

    it('renders 10 column headers (Checkbox, Company, Capital, Location, Name, Email, Phone, Status, Owner, Date)', () => {
      render(<LeadTableSkeleton />);

      // Count all TableHead elements (skeleton placeholders)
      const table = screen.getByRole('table');
      const headerRow = table.querySelector('thead tr');
      const headers = headerRow?.querySelectorAll('th');

      // Expected: 10 columns (Story 4.9 added checkbox column)
      expect(headers).toHaveLength(10);
    });

    it('renders 10 skeleton rows', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const rows = tbody?.querySelectorAll('tr');

      // Default SKELETON_ROWS = 10
      expect(rows).toHaveLength(10);
    });

    it('each row has 10 cells matching column count', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const firstRow = tbody?.querySelector('tr');
      const cells = firstRow?.querySelectorAll('td');

      // Each row should have 10 cells (matching header count)
      expect(cells).toHaveLength(10);
    });

    it('has sticky left columns (Checkbox and Company)', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const headerRow = table.querySelector('thead tr');
      const firstHeader = headerRow?.querySelector('th');
      const secondHeader = headerRow?.querySelectorAll('th')[1];

      // First column (Checkbox) should be sticky at left-0
      expect(firstHeader).toHaveClass('sticky', 'left-0', 'z-10', 'bg-background');
      // Second column (Company) should be sticky at left-10
      expect(secondHeader).toHaveClass('sticky', 'left-10', 'z-10', 'bg-background');
    });

    it('renders skeleton elements with proper styling', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const firstRow = tbody?.querySelector('tr');
      const firstCell = firstRow?.querySelector('td');
      const secondCell = firstRow?.querySelectorAll('td')[1];

      // First cell (Checkbox) should be sticky with bg-card
      expect(firstCell).toHaveClass('sticky', 'left-0', 'z-10', 'bg-card');
      // Second cell (Company) should be sticky at left-10
      expect(secondCell).toHaveClass('sticky', 'left-10', 'z-10', 'bg-card');
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

      // Verify skeleton placeholders exist (10 cells with h-4 class)
      expect(cells?.length).toBeGreaterThanOrEqual(10);
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

  // Story 4.16: Mobile Column Visibility
  describe('Story 4.16: Mobile Responsive Skeleton', () => {
    it('mobile-hidden columns have hidden md:table-cell classes', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const headerRow = table.querySelector('thead tr');
      const headers = headerRow?.querySelectorAll('th');

      // Capital (index 2), Location (3), Contact (4), Email (5), Phone (6), Date (9) should have mobile-hidden
      const capitalHeader = headers?.[2];
      const locationHeader = headers?.[3];
      const dateHeader = headers?.[9];

      expect(capitalHeader).toHaveClass('hidden', 'md:table-cell');
      expect(locationHeader).toHaveClass('hidden', 'md:table-cell');
      expect(dateHeader).toHaveClass('hidden', 'md:table-cell');
    });

    it('mobile-visible columns do NOT have hidden class', () => {
      render(<LeadTableSkeleton />);

      const table = screen.getByRole('table');
      const headerRow = table.querySelector('thead tr');
      const headers = headerRow?.querySelectorAll('th');

      // Checkbox (0), Company (1), Status (7), Owner (8) should NOT have hidden
      const checkboxHeader = headers?.[0];
      const companyHeader = headers?.[1];
      const statusHeader = headers?.[7];
      const ownerHeader = headers?.[8];

      expect(checkboxHeader).not.toHaveClass('hidden');
      expect(companyHeader).not.toHaveClass('hidden');
      expect(statusHeader).not.toHaveClass('hidden');
      expect(ownerHeader).not.toHaveClass('hidden');
    });
  });
});
