/**
 * Activity Log Container Tests
 * Story 7-7: Activity Log
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/settings/activity-log',
}));

// Mock hooks
vi.mock('@/hooks/use-activity-log', () => ({
  useActivityLog: vi.fn(),
}));

vi.mock('@/hooks/use-pagination-params', () => ({
  usePaginationParams: vi.fn(() => ({
    page: 1,
    limit: 25,
    setPage: vi.fn(),
    setLimit: vi.fn(),
  })),
}));

// Mock child components
vi.mock('@/components/settings/activity-log-table', () => ({
  ActivityLogTable: vi.fn(() => <div data-testid="mock-activity-table" />),
}));

vi.mock('@/components/settings/activity-log-skeleton', () => ({
  ActivityLogSkeleton: vi.fn(() => <div data-testid="mock-activity-skeleton" />),
}));

vi.mock('@/components/settings/activity-log-empty', () => ({
  ActivityLogEmpty: vi.fn(() => <div data-testid="mock-activity-empty" />),
}));

vi.mock('@/components/settings/activity-log-filters', () => ({
  ActivityLogFilters: vi.fn(() => <div data-testid="mock-activity-filters" />),
}));

vi.mock('@/components/leads/lead-pagination', () => ({
  LeadPagination: vi.fn(() => <div data-testid="mock-lead-pagination" />),
}));

vi.mock('@/components/leads/lead-detail-sheet', () => ({
  LeadDetailSheet: vi.fn(() => <div data-testid="mock-lead-detail-sheet" />),
}));

import { ActivityLogContainer } from '@/components/settings/activity-log-container';
import { useActivityLog } from '@/hooks/use-activity-log';

const mockUseActivityLog = useActivityLog as ReturnType<typeof vi.fn>;

describe('ActivityLogContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('[P1] Loading state', () => {
    it('should render loading state', () => {
      mockUseActivityLog.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: true,
        isError: false,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('activity-log-loading')).toBeInTheDocument();
    });

    it('should render skeleton during loading', () => {
      mockUseActivityLog.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: true,
        isError: false,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('mock-activity-skeleton')).toBeInTheDocument();
    });

    it('should render filters during loading', () => {
      mockUseActivityLog.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: true,
        isError: false,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('mock-activity-filters')).toBeInTheDocument();
    });
  });

  describe('[P1] Error state', () => {
    it('should render error state', () => {
      mockUseActivityLog.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('activity-log-error')).toBeInTheDocument();
    });

    it('should show error title', () => {
      mockUseActivityLog.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByText('Error loading activity log')).toBeInTheDocument();
    });

    it('should show retry button', () => {
      mockUseActivityLog.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  describe('[P1] Empty state', () => {
    it('should render empty state when no entries', () => {
      mockUseActivityLog.mockReturnValue({
        data: { entries: [], pagination: { total: 0, totalPages: 0 }, changedByOptions: [] },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('activity-log-empty-state')).toBeInTheDocument();
    });

    it('should render empty component', () => {
      mockUseActivityLog.mockReturnValue({
        data: { entries: [], pagination: { total: 0, totalPages: 0 }, changedByOptions: [] },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('mock-activity-empty')).toBeInTheDocument();
    });
  });

  describe('[P1] Success state with data', () => {
    const mockData = {
      entries: [
        {
          rowNumber: 1,
          timestamp: '2026-01-30T10:00:00Z',
          lead: { company: 'Test Corp', status: 'contacted', createdAt: '2026-01-01' },
          status: 'contacted',
          changedBy: 'Admin',
          notes: 'Called customer',
        },
      ],
      pagination: { total: 1, totalPages: 1, page: 1, limit: 25 },
      changedByOptions: ['Admin', 'Sales Rep'],
    };

    it('should render container with testid', () => {
      mockUseActivityLog.mockReturnValue({
        data: mockData,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('activity-log-container')).toBeInTheDocument();
    });

    it('should render activity table', () => {
      mockUseActivityLog.mockReturnValue({
        data: mockData,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('mock-activity-table')).toBeInTheDocument();
    });

    it('should render pagination', () => {
      mockUseActivityLog.mockReturnValue({
        data: mockData,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('mock-lead-pagination')).toBeInTheDocument();
    });

    it('should render filters', () => {
      mockUseActivityLog.mockReturnValue({
        data: mockData,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('mock-activity-filters')).toBeInTheDocument();
    });

    it('should render lead detail sheet', () => {
      mockUseActivityLog.mockReturnValue({
        data: mockData,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(<ActivityLogContainer />);
      expect(screen.getByTestId('mock-lead-detail-sheet')).toBeInTheDocument();
    });
  });
});
