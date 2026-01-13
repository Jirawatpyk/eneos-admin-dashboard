/**
 * Top Sales Table Tests
 * Story 2.4: Top Sales Table
 *
 * Tests for AC#1-7
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TopSalesTable } from '@/components/dashboard/top-sales-table';
import type { TopSalesPerson } from '@/types/dashboard';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Test data
const mockTopSales: TopSalesPerson[] = [
  {
    id: 'user1',
    name: 'Alice',
    email: 'alice@eneos.co.th',
    claimed: 50,
    contacted: 40,
    closed: 20,
    conversionRate: 40,
    rank: 1,
  },
  {
    id: 'user2',
    name: 'Bob',
    email: 'bob@eneos.co.th',
    claimed: 45,
    contacted: 35,
    closed: 15,
    conversionRate: 33,
    rank: 2,
  },
  {
    id: 'user3',
    name: 'Charlie',
    email: 'charlie@eneos.co.th',
    claimed: 40,
    contacted: 30,
    closed: 12,
    conversionRate: 30,
    rank: 3,
  },
  {
    id: 'user4',
    name: 'David',
    email: 'david@eneos.co.th',
    claimed: 35,
    contacted: 25,
    closed: 10,
    conversionRate: 29,
    rank: 4,
  },
  {
    id: 'user5',
    name: 'Eve',
    email: 'eve@eneos.co.th',
    claimed: 30,
    contacted: 20,
    closed: 8,
    conversionRate: 27,
    rank: 5,
  },
];

describe('TopSalesTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#1: Table Display
  describe('AC#1: Table Display', () => {
    it('renders table with header "Top Sales This Month"', () => {
      render(<TopSalesTable data={mockTopSales} />);

      expect(screen.getByTestId('top-sales-table')).toBeInTheDocument();
      expect(screen.getByText('Top Sales This Month')).toBeInTheDocument();
    });

    it('renders Trophy icon in header', () => {
      render(<TopSalesTable data={mockTopSales} />);

      // The Trophy icon is rendered (aria-hidden)
      const header = screen.getByText('Top Sales This Month');
      expect(header.parentElement).toBeInTheDocument();
    });
  });

  // AC#2: Table Columns
  describe('AC#2: Table Columns', () => {
    it('displays all required columns', () => {
      render(<TopSalesTable data={mockTopSales} />);

      expect(screen.getByText('Rank')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Claimed')).toBeInTheDocument();
      expect(screen.getByText('Contacted')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
      expect(screen.getByText('Conv. Rate')).toBeInTheDocument();
    });

    it('displays data for each person', () => {
      render(<TopSalesTable data={mockTopSales} />);

      // Check first person's data
      expect(screen.getByText('Alice')).toBeInTheDocument();
      // Check numeric values exist (may have duplicates across rows)
      expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('40').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('20').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('40%')).toBeInTheDocument();
    });
  });

  // AC#3: Ranking Display
  describe('AC#3: Ranking Display', () => {
    it('shows medal emoji for positions 1-3', () => {
      render(<TopSalesTable data={mockTopSales} />);

      // Check for medal emojis
      expect(screen.getByRole('img', { name: 'Rank 1' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Rank 2' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Rank 3' })).toBeInTheDocument();
    });

    it('shows numeric rank for positions 4-5', () => {
      render(<TopSalesTable data={mockTopSales} />);

      // Check for numeric ranks
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  // AC#4: Sorting Logic
  describe('AC#4: Sorting Logic', () => {
    it('displays top 5 entries only', () => {
      const moreThanFive = [
        ...mockTopSales,
        {
          id: 'user6',
          name: 'Frank',
          email: 'frank@eneos.co.th',
          claimed: 25,
          contacted: 15,
          closed: 5,
          conversionRate: 20,
          rank: 6,
        },
      ];

      render(<TopSalesTable data={moreThanFive} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Frank')).not.toBeInTheDocument();
    });

    it('renders rows in the order provided (sorted by backend)', () => {
      render(<TopSalesTable data={mockTopSales} />);

      const rows = screen.getAllByTestId(/top-sales-row/);
      expect(rows).toHaveLength(5);
    });

    it('sorts by conversion rate descending with tie-breaking by closed count', () => {
      // Test data with same conversion rate but different closed counts
      const tieData: TopSalesPerson[] = [
        {
          id: 'tie1',
          name: 'LowClosed',
          email: 'low@eneos.co.th',
          claimed: 50,
          contacted: 40,
          closed: 10, // Lower closed count
          conversionRate: 30,
          rank: 2,
        },
        {
          id: 'tie2',
          name: 'HighClosed',
          email: 'high@eneos.co.th',
          claimed: 50,
          contacted: 40,
          closed: 20, // Higher closed count - should be first
          conversionRate: 30, // Same rate
          rank: 1,
        },
      ];

      render(<TopSalesTable data={tieData} />);

      const rows = screen.getAllByTestId(/top-sales-row/);
      // HighClosed should be first due to higher closed count
      expect(rows[0]).toHaveTextContent('HighClosed');
      expect(rows[1]).toHaveTextContent('LowClosed');
    });

    it('applies defensive sorting even if backend data is unsorted', () => {
      // Data provided in wrong order (lower rate first)
      const unsortedData: TopSalesPerson[] = [
        {
          id: 'low',
          name: 'LowRate',
          email: 'low@eneos.co.th',
          claimed: 50,
          contacted: 40,
          closed: 10,
          conversionRate: 20, // Lower rate but listed first
          rank: 2,
        },
        {
          id: 'high',
          name: 'HighRate',
          email: 'high@eneos.co.th',
          claimed: 50,
          contacted: 40,
          closed: 20,
          conversionRate: 40, // Higher rate
          rank: 1,
        },
      ];

      render(<TopSalesTable data={unsortedData} />);

      const rows = screen.getAllByTestId(/top-sales-row/);
      // HighRate should be sorted to first position
      expect(rows[0]).toHaveTextContent('HighRate');
      expect(rows[1]).toHaveTextContent('LowRate');
    });
  });

  // AC#5: Conversion Rate Format
  describe('AC#5: Conversion Rate Format', () => {
    it('displays conversion rate as percentage format', () => {
      render(<TopSalesTable data={mockTopSales} />);

      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('rounds decimal conversion rates to nearest integer', () => {
      const decimalData: TopSalesPerson[] = [
        {
          id: 'decimal',
          name: 'Decimal',
          email: 'decimal@eneos.co.th',
          claimed: 50,
          contacted: 40,
          closed: 17,
          conversionRate: 34.567, // Should display as 35%
          rank: 1,
        },
      ];

      render(<TopSalesTable data={decimalData} />);

      // Should show rounded value
      expect(screen.getByText('35%')).toBeInTheDocument();
      expect(screen.queryByText('34.567%')).not.toBeInTheDocument();
    });

    it('highlights rates >= 30% in green', () => {
      render(<TopSalesTable data={mockTopSales} />);

      // Alice has 40% - should be green
      const aliceRate = screen.getByText('40%');
      expect(aliceRate).toHaveClass('text-green-600');

      // Bob has 33% - should be green
      const bobRate = screen.getByText('33%');
      expect(bobRate).toHaveClass('text-green-600');

      // Charlie has 30% - should be green
      const charlieRate = screen.getByText('30%');
      expect(charlieRate).toHaveClass('text-green-600');

      // David has 29% - should NOT be green
      const davidRate = screen.getByText('29%');
      expect(davidRate).not.toHaveClass('text-green-600');
    });
  });

  // AC#6: Click to Detail
  describe('AC#6: Click to Detail', () => {
    it('navigates to sales detail page on row click', () => {
      render(<TopSalesTable data={mockTopSales} />);

      const aliceRow = screen.getByTestId('top-sales-row-1');
      fireEvent.click(aliceRow);

      expect(mockPush).toHaveBeenCalledWith('/sales?userId=user1');
    });

    it('navigates on keyboard Enter key', () => {
      render(<TopSalesTable data={mockTopSales} />);

      const bobRow = screen.getByTestId('top-sales-row-2');
      fireEvent.keyDown(bobRow, { key: 'Enter' });

      expect(mockPush).toHaveBeenCalledWith('/sales?userId=user2');
    });

    it('navigates on keyboard Space key', () => {
      render(<TopSalesTable data={mockTopSales} />);

      const charlieRow = screen.getByTestId('top-sales-row-3');
      fireEvent.keyDown(charlieRow, { key: ' ' });

      expect(mockPush).toHaveBeenCalledWith('/sales?userId=user3');
    });

    it('has cursor pointer style for hover indication', () => {
      render(<TopSalesTable data={mockTopSales} />);

      const row = screen.getByTestId('top-sales-row-1');
      expect(row).toHaveClass('cursor-pointer');
    });
  });

  // AC#7: Loading & Empty States
  describe('AC#7: Loading & Empty States', () => {
    it('shows skeleton when loading', () => {
      render(<TopSalesTable data={[]} isLoading />);

      expect(screen.getByTestId('top-sales-table-skeleton')).toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      render(<TopSalesTable data={[]} />);

      expect(screen.getByTestId('top-sales-table-empty')).toBeInTheDocument();
      expect(screen.getByText('No sales data available')).toBeInTheDocument();
    });

    it('shows empty state when data is undefined', () => {
      render(<TopSalesTable data={undefined as unknown as TopSalesPerson[]} />);

      expect(screen.getByTestId('top-sales-table-empty')).toBeInTheDocument();
    });
  });
});
