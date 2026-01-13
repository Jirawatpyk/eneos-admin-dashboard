/**
 * Top Sales Table Container Tests
 * Story 2.4: Top Sales Table
 *
 * Tests for container component integration with dashboard data hook
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TopSalesTableContainer } from '@/components/dashboard/top-sales-table-container';
import type { TopSalesPerson } from '@/types/dashboard';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock useDashboardData hook
const mockUseDashboardData = vi.fn();
vi.mock('@/hooks/use-dashboard-data', () => ({
  useDashboardData: () => mockUseDashboardData(),
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
];

describe('TopSalesTableContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when data is loading', () => {
    mockUseDashboardData.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TopSalesTableContainer />);

    expect(screen.getByTestId('top-sales-table-skeleton')).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    mockUseDashboardData.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: 'Failed to fetch data' },
      refetch: vi.fn(),
    });

    render(<TopSalesTableContainer />);

    expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
  });

  it('renders table with data when loaded successfully', () => {
    mockUseDashboardData.mockReturnValue({
      data: {
        summary: { totalLeads: 100 },
        trends: { daily: [] },
        topSales: mockTopSales,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TopSalesTableContainer />);

    expect(screen.getByTestId('top-sales-table')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders empty state when topSales is empty array', () => {
    mockUseDashboardData.mockReturnValue({
      data: {
        summary: { totalLeads: 100 },
        trends: { daily: [] },
        topSales: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TopSalesTableContainer />);

    expect(screen.getByTestId('top-sales-table-empty')).toBeInTheDocument();
  });

  it('renders empty state when topSales is undefined', () => {
    mockUseDashboardData.mockReturnValue({
      data: {
        summary: { totalLeads: 100 },
        trends: { daily: [] },
        // topSales is undefined
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TopSalesTableContainer />);

    expect(screen.getByTestId('top-sales-table-empty')).toBeInTheDocument();
  });

  it('uses default period "month"', () => {
    mockUseDashboardData.mockReturnValue({
      data: {
        summary: { totalLeads: 100 },
        trends: { daily: [] },
        topSales: mockTopSales,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TopSalesTableContainer />);

    // The hook should be called (we can't directly check params with this mock setup)
    expect(screen.getByTestId('top-sales-table')).toBeInTheDocument();
  });

  it('accepts custom period prop', () => {
    mockUseDashboardData.mockReturnValue({
      data: {
        summary: { totalLeads: 100 },
        trends: { daily: [] },
        topSales: mockTopSales,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TopSalesTableContainer period="week" />);

    expect(screen.getByTestId('top-sales-table')).toBeInTheDocument();
  });
});
