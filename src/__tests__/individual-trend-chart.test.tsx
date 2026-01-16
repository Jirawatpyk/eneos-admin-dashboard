/**
 * Individual Trend Chart Component Tests
 * Story 3.5: Individual Performance Trend
 *
 * AC#1: Trend Chart in Detail Sheet
 * AC#2: Multi-Metric Display (Claimed, Closed)
 * AC#3: Time Period Selection
 * AC#4: Team Average Comparison
 * AC#5: Data Points and Tooltip
 * AC#6: Trend Indicator
 * AC#7: Empty/Insufficient Data
 * AC#8: Loading State
 * AC#9: Responsive Design
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IndividualTrendChart } from '@/components/sales/individual-trend-chart';
import type { SalesTrendData, DailyMetric } from '@/types/sales';

// ===========================================
// Mock Setup
// ===========================================

// Mock the hook
vi.mock('@/hooks/use-sales-trend', () => ({
  useSalesTrend: vi.fn(),
}));

import { useSalesTrend } from '@/hooks/use-sales-trend';

// Mock ResizeObserver for Recharts
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

beforeEach(() => {
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  // Mock container dimensions for Recharts
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 500,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 500,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
});

// ===========================================
// Test Utilities
// ===========================================

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function generateMockDailyData(days: number): DailyMetric[] {
  const data: DailyMetric[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      claimed: 3 + Math.floor(Math.random() * 3),
      contacted: 2 + Math.floor(Math.random() * 2),
      closed: 1 + Math.floor(Math.random() * 2),
      conversionRate: 30 + Math.floor(Math.random() * 20),
    });
  }

  return data;
}

function createMockTrendData(days: number = 30): SalesTrendData {
  return {
    userId: 'user-1',
    name: 'Test User',
    period: days,
    dailyData: generateMockDailyData(days),
    teamAverage: generateMockDailyData(days),
  };
}

// ===========================================
// Tests
// ===========================================

describe('IndividualTrendChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#8: Loading State
  describe('Loading State', () => {
    it('shows skeleton while loading', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Test User" />, {
        wrapper: createQueryWrapper(),
      });

      expect(screen.getByTestId('trend-chart-skeleton')).toBeInTheDocument();
    });
  });

  // AC#7: Empty/Insufficient Data
  describe('Empty States', () => {
    it('shows insufficient data message when < 7 data points', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: {
          userId: 'user-1',
          name: 'Test User',
          period: 30,
          dailyData: generateMockDailyData(5), // Only 5 days
          teamAverage: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Test User" />, {
        wrapper: createQueryWrapper(),
      });

      expect(screen.getByTestId('trend-chart-empty')).toBeInTheDocument();
      expect(screen.getByTestId('trend-empty-insufficient')).toBeInTheDocument();
    });

    it('shows error state when API fails', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('API Error'),
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Test User" />, {
        wrapper: createQueryWrapper(),
      });

      expect(screen.getByTestId('trend-chart-empty')).toBeInTheDocument();
      expect(screen.getByTestId('trend-empty-error')).toBeInTheDocument();
    });
  });

  // AC#1: Trend Chart in Detail Sheet
  describe('Chart Display', () => {
    it('renders chart with title including user name', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: createMockTrendData(30),
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Alice" />, {
        wrapper: createQueryWrapper(),
      });

      expect(screen.getByTestId('individual-trend-chart')).toBeInTheDocument();
      expect(screen.getByText("Alice's Trend")).toBeInTheDocument();
    });

    it('has aria-label for accessibility', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: createMockTrendData(30),
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Alice" />, {
        wrapper: createQueryWrapper(),
      });

      expect(
        screen.getByRole('img', {
          name: /line chart showing alice's performance trend/i,
        })
      ).toBeInTheDocument();
    });
  });

  // AC#3: Time Period Selection
  describe('Period Selector', () => {
    it('renders period buttons (7, 30, 90 days)', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: createMockTrendData(30),
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Alice" />, {
        wrapper: createQueryWrapper(),
      });

      expect(screen.getByRole('button', { name: '7 Days' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '30 Days' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '90 Days' })).toBeInTheDocument();
    });

    it('defaults to 30 Days selected', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: createMockTrendData(30),
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Alice" />, {
        wrapper: createQueryWrapper(),
      });

      const button30Days = screen.getByRole('button', { name: '30 Days' });
      expect(button30Days).toHaveAttribute('aria-pressed', 'true');
    });

    it('changes period when button clicked', async () => {
      const mockUseSalesTrend = vi.mocked(useSalesTrend);
      mockUseSalesTrend.mockReturnValue({
        data: createMockTrendData(30),
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Alice" />, {
        wrapper: createQueryWrapper(),
      });

      const button7Days = screen.getByRole('button', { name: '7 Days' });
      fireEvent.click(button7Days);

      // Hook should be called with new period
      await waitFor(() => {
        expect(mockUseSalesTrend).toHaveBeenCalledWith('user-1', 7);
      });
    });
  });

  // AC#6: Trend Indicator
  describe('Trend Indicator', () => {
    it('shows trend indicator in chart header', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: createMockTrendData(30),
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Alice" />, {
        wrapper: createQueryWrapper(),
      });

      expect(screen.getByTestId('trend-indicator')).toBeInTheDocument();
    });
  });

  // AC#2: Multi-Metric Display with Legend Toggle
  describe('Legend Toggle', () => {
    it('renders legend with Claimed, Closed, and Team Avg', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: createMockTrendData(30),
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Alice" />, {
        wrapper: createQueryWrapper(),
      });

      expect(screen.getByRole('button', { name: /claimed/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /closed/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /team avg/i })).toBeInTheDocument();
    });

    it('toggles metric visibility when legend item clicked', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: createMockTrendData(30),
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Alice" />, {
        wrapper: createQueryWrapper(),
      });

      const claimedButton = screen.getByRole('button', { name: /hide claimed/i });

      // Initially visible (aria-pressed=true)
      expect(claimedButton).toHaveAttribute('aria-pressed', 'true');

      // Click to toggle
      fireEvent.click(claimedButton);

      // Now hidden (aria-pressed=false)
      expect(claimedButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('prevents hiding last visible metric (guard logic)', () => {
      vi.mocked(useSalesTrend).mockReturnValue({
        data: createMockTrendData(30),
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<IndividualTrendChart userId="user-1" userName="Alice" />, {
        wrapper: createQueryWrapper(),
      });

      const claimedBtn = screen.getByRole('button', { name: /claimed/i });
      const closedBtn = screen.getByRole('button', { name: /closed/i });
      const teamAvgBtn = screen.getByRole('button', { name: /team avg/i });

      // Hide 2 of 3 metrics
      fireEvent.click(claimedBtn);
      fireEvent.click(closedBtn);

      // Now only Team Avg is visible - try to hide it
      fireEvent.click(teamAvgBtn);

      // Should still be visible (guard prevents hiding last)
      expect(teamAvgBtn).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
