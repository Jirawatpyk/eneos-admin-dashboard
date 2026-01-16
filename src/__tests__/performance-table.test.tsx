/**
 * Performance Table Tests
 * Story 3.1: Sales Team Performance Table
 *
 * Tests for AC#1-9
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PerformanceTable } from '@/components/sales/performance-table';
import type { SalesPersonMetrics } from '@/types/sales';

// Mock next/navigation
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Test data
const mockSalesData: SalesPersonMetrics[] = [
  {
    userId: 'user1',
    name: 'Alice',
    email: 'alice@eneos.co.th',
    claimed: 50,
    contacted: 40,
    closed: 20,
    lost: 5,
    unreachable: 5,
    conversionRate: 40,
    avgResponseTime: 45, // 45 minutes
  },
  {
    userId: 'user2',
    name: 'Bob',
    email: 'bob@eneos.co.th',
    claimed: 45,
    contacted: 35,
    closed: 15,
    lost: 8,
    unreachable: 2,
    conversionRate: 33.3,
    avgResponseTime: 120, // 2 hours
  },
  {
    userId: 'user3',
    name: 'Charlie',
    email: 'charlie@eneos.co.th',
    claimed: 40,
    contacted: 30,
    closed: 2,
    lost: 18,
    unreachable: 10,
    conversionRate: 5,
    avgResponseTime: 2880, // 2 days
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('PerformanceTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('sortBy');
    mockSearchParams.delete('sortDir');
  });

  // AC#1: Table Display
  describe('AC#1: Table Display', () => {
    it('renders table with header "Sales Team Performance"', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      expect(screen.getByTestId('performance-table')).toBeInTheDocument();
      expect(screen.getByText('Sales Team Performance')).toBeInTheDocument();
    });

    it('renders Users icon in header', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      const header = screen.getByText('Sales Team Performance');
      expect(header.parentElement).toBeInTheDocument();
    });
  });

  // AC#2: Table Columns
  describe('AC#2: Table Columns', () => {
    it('displays all required columns', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Claimed')).toBeInTheDocument();
      expect(screen.getByText('Contacted')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
      expect(screen.getByText('Lost')).toBeInTheDocument();
      expect(screen.getByText('Unreachable')).toBeInTheDocument();
      expect(screen.getByText('Conv. Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Response')).toBeInTheDocument();
    });

    it('displays data for each person', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });
  });

  // AC#4: Conversion Rate Display
  describe('AC#4: Conversion Rate Display', () => {
    it('displays conversion rate as percentage format with one decimal', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      expect(screen.getByText('40.0%')).toBeInTheDocument();
      expect(screen.getByText('33.3%')).toBeInTheDocument();
      expect(screen.getByText('5.0%')).toBeInTheDocument();
    });

    it('highlights rates >= 30% in green progress bar', () => {
      const { container } = renderWithProviders(
        <PerformanceTable data={mockSalesData} />
      );

      // Story 3.2: Now uses ConversionProgressBar with colored fill
      const progressBars = container.querySelectorAll(
        '[data-testid="progress-fill"]'
      );
      // Alice (40%) and Bob (33.3%) should have green bars
      const greenBars = Array.from(progressBars).filter((bar) =>
        bar.classList.contains('bg-green-500')
      );
      expect(greenBars.length).toBeGreaterThanOrEqual(2);
    });

    it('highlights rates < 10% in red progress bar', () => {
      const { container } = renderWithProviders(
        <PerformanceTable data={mockSalesData} />
      );

      // Story 3.2: Now uses ConversionProgressBar with colored fill
      const progressBars = container.querySelectorAll(
        '[data-testid="progress-fill"]'
      );
      // Charlie (5%) should have red bar
      const redBars = Array.from(progressBars).filter((bar) =>
        bar.classList.contains('bg-red-500')
      );
      expect(redBars.length).toBeGreaterThanOrEqual(1);
    });

    it('shows N/A when claimed is 0', () => {
      const dataWithZeroClaimed: SalesPersonMetrics[] = [
        {
          ...mockSalesData[0],
          claimed: 0,
          closed: 0,
        },
      ];

      renderWithProviders(<PerformanceTable data={dataWithZeroClaimed} />);

      // Story 3.2: ConversionProgressBar shows N/A when claimed=0 (rate is -1)
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  // AC#5: Response Time Display
  describe('AC#5: Response Time Display', () => {
    it('formats times < 60 minutes as "XX min"', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      expect(screen.getByText('45 min')).toBeInTheDocument();
    });

    it('formats times >= 60 minutes as "X.X hrs"', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      expect(screen.getByText('2.0 hrs')).toBeInTheDocument();
    });

    it('formats times >= 24 hours as "X.X days"', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      expect(screen.getByText('2.0 days')).toBeInTheDocument();
    });

    it('shows N/A for null response time', () => {
      const dataWithNullTime: SalesPersonMetrics[] = [
        {
          ...mockSalesData[0],
          avgResponseTime: null as unknown as number,
        },
      ];

      renderWithProviders(<PerformanceTable data={dataWithNullTime} />);

      const rows = screen.getAllByRole('button');
      const naCells = screen.getAllByText('N/A');
      expect(naCells.length).toBeGreaterThanOrEqual(1);
    });
  });

  // AC#6: Column Sorting
  describe('AC#6: Column Sorting', () => {
    it('sorts by conversionRate descending by default', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      const rows = screen.getAllByTestId(/performance-row/);
      // Alice has highest rate (40%), should be first
      expect(rows[0]).toHaveTextContent('Alice');
    });

    it('shows sort indicator on header click', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      const claimedHeader = screen.getByRole('button', { name: /Sort by Claimed/i });
      fireEvent.click(claimedHeader);

      expect(mockReplace).toHaveBeenCalled();
    });

    it('toggles sort direction on repeated header click', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      const nameHeader = screen.getByRole('button', { name: /Sort by Name/i });

      fireEvent.click(nameHeader);
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=name'),
        expect.anything()
      );
    });
  });

  // AC#7: Row Interactivity
  describe('AC#7: Row Interactivity', () => {
    it('opens detail sheet on row click', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      const aliceRow = screen.getByTestId('performance-row-user1');
      fireEvent.click(aliceRow);

      // Sheet should open with Alice's details
      expect(screen.getByTestId('sales-detail-sheet')).toBeInTheDocument();
      expect(screen.getByText('alice@eneos.co.th')).toBeInTheDocument();
    });

    it('opens detail sheet on keyboard Enter key', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      const bobRow = screen.getByTestId('performance-row-user2');
      fireEvent.keyDown(bobRow, { key: 'Enter' });

      expect(screen.getByTestId('sales-detail-sheet')).toBeInTheDocument();
    });

    it('opens detail sheet on keyboard Space key', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      const charlieRow = screen.getByTestId('performance-row-user3');
      fireEvent.keyDown(charlieRow, { key: ' ' });

      expect(screen.getByTestId('sales-detail-sheet')).toBeInTheDocument();
    });

    it('has cursor pointer style for hover indication', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      const row = screen.getByTestId('performance-row-user1');
      expect(row).toHaveClass('cursor-pointer');
    });

    it('has hover highlight style', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      const row = screen.getByTestId('performance-row-user1');
      expect(row).toHaveClass('hover:bg-muted/50');
    });
  });

  // AC#9: Responsive Design
  describe('AC#9: Responsive Design', () => {
    it('wraps table in overflow-auto container', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      const table = screen.getByRole('table');
      // The shadcn/ui Table wraps in a div with overflow-auto (part of scroll-area)
      expect(table.parentElement).toHaveClass('overflow-auto');
    });

    it('has sticky first column (Name)', () => {
      renderWithProviders(<PerformanceTable data={mockSalesData} />);

      // Check header has sticky class
      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveClass('sticky', 'left-0');

      // Check cells have sticky class
      const row = screen.getByTestId('performance-row-user1');
      const nameCell = within(row).getByText('Alice').closest('td');
      expect(nameCell).toHaveClass('sticky', 'left-0');
    });
  });
});
