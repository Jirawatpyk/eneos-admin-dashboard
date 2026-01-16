/**
 * Performance Table Container Tests
 * Story 3.1: Sales Team Performance Table
 * Story 3.2: Conversion Rate Analytics
 * Story 3.4: Response Time Analytics
 *
 * Tests for container component data fetching and state management
 * Including filter and highlight integration tests
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PerformanceTableContainer } from '@/components/sales/performance-table-container';
import type { SalesPerformanceData } from '@/types/sales';

// Mock the hook
const mockUseSalesPerformance = vi.fn();

vi.mock('@/hooks/use-sales-performance', () => ({
  useSalesPerformance: () => mockUseSalesPerformance(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

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

const mockSalesData: SalesPerformanceData = {
  teamPerformance: [
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
      avgResponseTime: 45,
    },
  ],
  summary: {
    totalClaimed: 50,
    totalContacted: 40,
    totalClosed: 20,
    avgConversionRate: 40,
    avgResponseTime: 45,
  },
};

describe('PerformanceTableContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Ensure timers are restored even if test fails
    vi.useRealTimers();
  });

  // AC#8: Loading state
  describe('Loading State', () => {
    it('renders skeleton when loading', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      expect(screen.getByTestId('performance-table-skeleton')).toBeInTheDocument();
    });
  });

  // AC#8: Error state
  describe('Error State', () => {
    it('renders error state when error occurs', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'API Error' },
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      expect(screen.getByTestId('performance-table-error')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    it('shows default error message when no specific message', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      expect(
        screen.getByText('Failed to load sales performance data')
      ).toBeInTheDocument();
    });
  });

  // AC#8: Empty state
  describe('Empty State', () => {
    it('renders empty state when data is undefined', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      expect(screen.getByTestId('performance-table-empty')).toBeInTheDocument();
    });

    it('renders empty state when teamPerformance is empty', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: {
          teamPerformance: [],
          summary: {
            totalClaimed: 0,
            totalContacted: 0,
            totalClosed: 0,
            avgConversionRate: 0,
            avgResponseTime: 0,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      expect(screen.getByTestId('performance-table-empty')).toBeInTheDocument();
    });

    it('renders empty state when teamPerformance is null', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: {
          teamPerformance: null,
          summary: null,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      expect(screen.getByTestId('performance-table-empty')).toBeInTheDocument();
    });
  });

  // Data state
  describe('Data State', () => {
    it('renders table with data when available', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: mockSalesData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      expect(screen.getByTestId('performance-table')).toBeInTheDocument();
      // Story 3.2: Alice appears in BestPerformerCard and table
      expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
      // Also check for summary cards
      expect(screen.getByTestId('conversion-summary-cards')).toBeInTheDocument();
    });
  });

  // Story 3.2: Filter integration tests
  describe('Filter Needs Improvement (Story 3.2)', () => {
    const mockDataWithLowPerformers: SalesPerformanceData = {
      teamPerformance: [
        {
          userId: 'user1',
          name: 'Alice',
          email: 'alice@eneos.co.th',
          claimed: 50,
          contacted: 40,
          closed: 20,
          lost: 5,
          unreachable: 5,
          conversionRate: 40, // Above threshold
          avgResponseTime: 45,
        },
        {
          userId: 'user2',
          name: 'Bob',
          email: 'bob@eneos.co.th',
          claimed: 100,
          contacted: 80,
          closed: 5,
          lost: 70,
          unreachable: 10,
          conversionRate: 5, // Below 10% threshold
          avgResponseTime: 200,
        },
      ],
      summary: {
        totalClaimed: 150,
        totalContacted: 120,
        totalClosed: 25,
        avgConversionRate: 22.5,
        avgResponseTime: 122.5,
      },
    };

    it('shows filter indicator when needs improvement card is clicked', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: mockDataWithLowPerformers,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // Click needs improvement card
      const needsImprovementCard = screen.getByTestId('needs-improvement-card');
      fireEvent.click(needsImprovementCard);

      // Filter indicator should appear
      expect(screen.getByTestId('filter-indicator')).toBeInTheDocument();
      expect(screen.getByText(/Showing 1 sales below 10% threshold/)).toBeInTheDocument();
    });

    it('clears filter when clear button is clicked', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: mockDataWithLowPerformers,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // Click needs improvement card to enable filter
      fireEvent.click(screen.getByTestId('needs-improvement-card'));
      expect(screen.getByTestId('filter-indicator')).toBeInTheDocument();

      // Click clear filter button
      fireEvent.click(screen.getByTestId('clear-filter-button'));

      // Filter indicator should be gone
      expect(screen.queryByTestId('filter-indicator')).not.toBeInTheDocument();
    });

    it('shows empty filter state when all performers are above threshold', () => {
      // Mock data where everyone is above 10%
      const allAboveThreshold: SalesPerformanceData = {
        teamPerformance: [
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
            avgResponseTime: 45,
          },
        ],
        summary: {
          totalClaimed: 50,
          totalContacted: 40,
          totalClosed: 20,
          avgConversionRate: 40,
          avgResponseTime: 45,
        },
      };

      mockUseSalesPerformance.mockReturnValue({
        data: allAboveThreshold,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // Needs improvement card should show 0 and not be clickable for filtering
      // Note: When count is 0, card shows positive message instead
      expect(screen.getByTestId('needs-improvement-card')).toBeInTheDocument();
      expect(screen.getByText('Everyone on track!')).toBeInTheDocument();
    });
  });

  // Story 3.2: Highlight best performer integration tests
  describe('Highlight Best Performer (Story 3.2)', () => {
    beforeEach(() => {
      // Mock scrollIntoView since it's not available in jsdom
      Element.prototype.scrollIntoView = vi.fn();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('highlights row when best performer card is clicked', async () => {
      mockUseSalesPerformance.mockReturnValue({
        data: mockSalesData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // Click best performer card
      const bestPerformerCard = screen.getByTestId('best-performer-card');
      fireEvent.click(bestPerformerCard);

      // Row should have highlight class
      const row = screen.getByTestId('performance-row-user1');
      expect(row).toHaveClass('bg-primary/20');
      expect(row).toHaveClass('ring-2');
    });

    it('scrolls to row when best performer card is clicked', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: mockSalesData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // Click best performer card
      fireEvent.click(screen.getByTestId('best-performer-card'));

      // scrollIntoView should have been called
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
    });

    it('clears highlight after 2 seconds', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: mockSalesData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // Click best performer card
      fireEvent.click(screen.getByTestId('best-performer-card'));

      // Row should be highlighted
      const row = screen.getByTestId('performance-row-user1');
      expect(row).toHaveClass('bg-primary/20');

      // Fast forward 2 seconds - use act to flush all state updates
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Highlight should be removed (synchronous check after timers advance)
      expect(row).not.toHaveClass('bg-primary/20');
    });
  });

  // Story 3.4: Slow Responder Filter integration tests
  describe('Filter Slow Responders (Story 3.4)', () => {
    const mockDataWithSlowResponders: SalesPerformanceData = {
      teamPerformance: [
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
          avgResponseTime: 25, // Fast (< 30 min)
        },
        {
          userId: 'user2',
          name: 'Bob',
          email: 'bob@eneos.co.th',
          claimed: 100,
          contacted: 80,
          closed: 30,
          lost: 40,
          unreachable: 10,
          conversionRate: 30,
          avgResponseTime: 90, // Slow (> 60 min)
        },
        {
          userId: 'user3',
          name: 'Charlie',
          email: 'charlie@eneos.co.th',
          claimed: 80,
          contacted: 60,
          closed: 25,
          lost: 30,
          unreachable: 5,
          conversionRate: 31,
          avgResponseTime: 120, // Slow (> 60 min)
        },
      ],
      summary: {
        totalClaimed: 230,
        totalContacted: 180,
        totalClosed: 75,
        avgConversionRate: 33.7,
        avgResponseTime: 78.3,
      },
    };

    it('shows slow responders filter indicator when slow badge is clicked', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: mockDataWithSlowResponders,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // Click slow responders badge
      const slowBadge = screen.getByTestId('slow-responders-badge');
      fireEvent.click(slowBadge);

      // Filter indicator should appear
      expect(screen.getByTestId('slow-responders-filter-indicator')).toBeInTheDocument();
      expect(screen.getByText(/Showing 2 slow responders/)).toBeInTheDocument();
    });

    it('clears slow responders filter when clear button is clicked', () => {
      mockUseSalesPerformance.mockReturnValue({
        data: mockDataWithSlowResponders,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // Click slow responders badge to enable filter
      fireEvent.click(screen.getByTestId('slow-responders-badge'));
      expect(screen.getByTestId('slow-responders-filter-indicator')).toBeInTheDocument();

      // Click clear filter button
      fireEvent.click(screen.getByTestId('clear-slow-filter-button'));

      // Filter indicator should be gone
      expect(screen.queryByTestId('slow-responders-filter-indicator')).not.toBeInTheDocument();
    });

    it('shows empty filter state when all responders are within 60 minutes', () => {
      // Mock data where everyone is below 60 min
      const allFastResponders: SalesPerformanceData = {
        teamPerformance: [
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
            avgResponseTime: 25, // Fast
          },
          {
            userId: 'user2',
            name: 'Bob',
            email: 'bob@eneos.co.th',
            claimed: 100,
            contacted: 80,
            closed: 30,
            lost: 40,
            unreachable: 10,
            conversionRate: 30,
            avgResponseTime: 45, // Acceptable
          },
        ],
        summary: {
          totalClaimed: 150,
          totalContacted: 120,
          totalClosed: 50,
          avgConversionRate: 35,
          avgResponseTime: 35,
        },
      };

      mockUseSalesPerformance.mockReturnValue({
        data: allFastResponders,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // Should show "All on track!" badge instead of slow responders badge
      expect(screen.getByTestId('all-on-track-badge')).toBeInTheDocument();
      expect(screen.queryByTestId('slow-responders-badge')).not.toBeInTheDocument();
    });

    it('treats exactly 60 minutes as acceptable (NOT slow)', () => {
      const exactlyAcceptable: SalesPerformanceData = {
        teamPerformance: [
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
            avgResponseTime: 60, // Exactly 60 = acceptable
          },
        ],
        summary: {
          totalClaimed: 50,
          totalContacted: 40,
          totalClosed: 20,
          avgConversionRate: 40,
          avgResponseTime: 60,
        },
      };

      mockUseSalesPerformance.mockReturnValue({
        data: exactlyAcceptable,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // Should show "All on track!" since 60 min is acceptable
      expect(screen.getByTestId('all-on-track-badge')).toBeInTheDocument();
    });

    it('clears conversion filter when slow responders filter is enabled', () => {
      const mixedData: SalesPerformanceData = {
        teamPerformance: [
          {
            userId: 'user1',
            name: 'Alice',
            email: 'alice@eneos.co.th',
            claimed: 100,
            contacted: 80,
            closed: 5,
            lost: 70,
            unreachable: 10,
            conversionRate: 5, // Below 10%
            avgResponseTime: 25,
          },
          {
            userId: 'user2',
            name: 'Bob',
            email: 'bob@eneos.co.th',
            claimed: 50,
            contacted: 40,
            closed: 20,
            lost: 5,
            unreachable: 5,
            conversionRate: 40,
            avgResponseTime: 90, // Slow
          },
        ],
        summary: {
          totalClaimed: 150,
          totalContacted: 120,
          totalClosed: 25,
          avgConversionRate: 22.5,
          avgResponseTime: 57.5,
        },
      };

      mockUseSalesPerformance.mockReturnValue({
        data: mixedData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<PerformanceTableContainer />);

      // First enable conversion rate filter
      fireEvent.click(screen.getByTestId('needs-improvement-card'));
      expect(screen.getByTestId('filter-indicator')).toBeInTheDocument();

      // Then enable slow responders filter
      fireEvent.click(screen.getByTestId('slow-responders-badge'));

      // Conversion filter should be cleared, slow filter should be active
      expect(screen.queryByTestId('filter-indicator')).not.toBeInTheDocument();
      expect(screen.getByTestId('slow-responders-filter-indicator')).toBeInTheDocument();
    });
  });
});
