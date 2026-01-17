/**
 * Lead Table Container Tests
 * Story 4.1: Lead List Table
 * Story 4.3: Search - Added search integration tests
 *
 * Tests for container component integration
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LeadTableContainer } from '@/components/leads/lead-table-container';
import type { Lead } from '@/types/lead';

// Mock data
const mockLeads: Lead[] = [
  {
    row: 1,
    date: '2026-01-15T10:30:00Z',
    customerName: 'John Doe',
    email: 'john@example.com',
    phone: '0812345678',
    company: 'ABC Corp',
    industryAI: 'Manufacturing',
    website: 'https://abc-corp.com',
    capital: '100M THB',
    status: 'new',
    salesOwnerId: null,
    salesOwnerName: null,
    campaignId: 'camp1',
    campaignName: 'Q1 Campaign',
    emailSubject: 'Test Subject',
    source: 'Brevo',
    leadId: 'lead1',
    eventId: 'event1',
    clickedAt: '2026-01-15T10:00:00Z',
    talkingPoint: 'Interested in lubricants',
    closedAt: null,
    lostAt: null,
    unreachableAt: null,
    version: 1,
    leadSource: 'Email',
    jobTitle: 'Purchasing Manager',
    city: 'Bangkok',
    leadUuid: 'lead_uuid_1',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: null,
  },
];

// Mock the hooks
const mockRefetch = vi.fn();
const mockSetSearch = vi.fn();
const mockClearSearch = vi.fn();
const mockSetPage = vi.fn();
const mockSetLimit = vi.fn();

vi.mock('@/hooks/use-leads', () => ({
  useLeads: vi.fn(() => ({
    data: mockLeads,
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: mockRefetch,
  })),
}));

// Story 4.3: Mock search-related hooks
vi.mock('@/hooks/use-search-params', () => ({
  useLeadSearchParams: vi.fn(() => ({
    search: '',
    setSearch: mockSetSearch,
    clearSearch: mockClearSearch,
  })),
}));

vi.mock('@/hooks/use-debounce', () => ({
  useDebounce: vi.fn((value: string) => value),
}));

vi.mock('@/hooks/use-pagination-params', () => ({
  usePaginationParams: vi.fn(() => ({
    page: 1,
    limit: 20,
    setPage: mockSetPage,
    setLimit: mockSetLimit,
  })),
}));

import { useLeads } from '@/hooks/use-leads';
import { LeadsApiError } from '@/lib/api/leads';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// Story 4.3: Added TooltipProvider for LeadSearch component
const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {ui}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

describe('LeadTableContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default state
    vi.mocked(useLeads).mockReturnValue({
      data: mockLeads,
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  describe('Loading state', () => {
    it('shows skeleton when loading', () => {
      vi.mocked(useLeads).mockReturnValue({
        data: undefined,
        pagination: undefined,
        isLoading: true,
        isFetching: true,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<LeadTableContainer />);

      expect(screen.getByTestId('lead-table-skeleton')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('shows error state with retry button', () => {
      const mockError = new LeadsApiError('Network error', 500);
      vi.mocked(useLeads).mockReturnValue({
        data: undefined,
        pagination: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: mockError,
        refetch: mockRefetch,
      });

      renderWithProviders(<LeadTableContainer />);

      expect(screen.getByTestId('lead-table-error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('calls refetch when retry button is clicked', () => {
      const mockError = new LeadsApiError('Network error', 500);
      vi.mocked(useLeads).mockReturnValue({
        data: undefined,
        pagination: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: mockError,
        refetch: mockRefetch,
      });

      renderWithProviders(<LeadTableContainer />);

      fireEvent.click(screen.getByTestId('lead-table-retry-button'));

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('shows empty state when no leads', () => {
      vi.mocked(useLeads).mockReturnValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<LeadTableContainer />);

      expect(screen.getByTestId('lead-table-empty')).toBeInTheDocument();
    });

    it('shows empty state when data is undefined', () => {
      vi.mocked(useLeads).mockReturnValue({
        data: undefined,
        pagination: undefined,
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<LeadTableContainer />);

      expect(screen.getByTestId('lead-table-empty')).toBeInTheDocument();
    });
  });

  describe('Data loaded state', () => {
    it('shows table when data is loaded', () => {
      renderWithProviders(<LeadTableContainer />);

      expect(screen.getByTestId('lead-table')).toBeInTheDocument();
    });

    it('opens detail sheet when row is clicked', async () => {
      renderWithProviders(<LeadTableContainer />);

      const row = screen.getByTestId('lead-row-1');
      fireEvent.click(row);

      await waitFor(() => {
        expect(screen.getByTestId('lead-detail-sheet')).toBeInTheDocument();
      });
    });

    it('displays lead details in sheet', async () => {
      renderWithProviders(<LeadTableContainer />);

      const row = screen.getByTestId('lead-row-1');
      fireEvent.click(row);

      // Sheet renders in a portal, check that it's in the document
      await waitFor(() => {
        expect(screen.getByTestId('lead-detail-sheet')).toBeInTheDocument();
      });
    });
  });

  describe('Default sorting', () => {
    it('uses createdAt DESC as default sort', () => {
      renderWithProviders(<LeadTableContainer />);

      // Verify useLeads is called with correct sort params
      expect(useLeads).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'createdAt',
          sortDir: 'desc',
        })
      );
    });
  });
});
