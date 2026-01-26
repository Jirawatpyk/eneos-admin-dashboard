/**
 * Lead Table Container Tests
 * Story 4.1: Lead List Table
 * Story 4.3: Search - Added search integration tests
 * Story 4.9: Bulk Select - Added selection integration tests (AC#7)
 * Story 4.10: Quick Export - Added export mock
 *
 * Tests for container component integration
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LeadTableContainer } from '@/components/leads/lead-table-container';
import type { Lead } from '@/types/lead';

// Story 4.16: Mock useToast for MobileFilterSheet (must be hoisted)
const { mockToast } = vi.hoisted(() => ({
  mockToast: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Story 4.10: Mock LeadExportDropdown to avoid hook issues in tests
vi.mock('@/components/leads/lead-export-dropdown', () => ({
  LeadExportDropdown: ({ leads }: { leads: Lead[] }) => (
    <button data-testid="lead-export-dropdown-mock">Export ({leads.length})</button>
  ),
}));

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
    juristicId: null,
    dbdSector: null,
    province: null,
    fullAddress: null,
  },
];

// Mock the hooks
const mockRefetch = vi.fn();
const mockSetSearch = vi.fn();
const mockClearSearch = vi.fn();
const mockSetPage = vi.fn();
const mockSetLimit = vi.fn();

// Story 4.9: Mock selection hooks
const mockClearSelection = vi.fn();
const mockToggleSelection = vi.fn();
const mockSelectAll = vi.fn();

// Story 4.9: Mock lead selection hook
const mockIsSelected = vi.fn(() => false);
vi.mock('@/hooks/use-lead-selection', () => ({
  useLeadSelection: vi.fn(() => ({
    selectedIds: new Set<number>(),
    selectedCount: 0,
    isSelected: mockIsSelected,
    toggleSelection: mockToggleSelection,
    selectAll: mockSelectAll,
    clearSelection: mockClearSelection,
    isAllSelected: () => false,
    isSomeSelected: () => false,
  })),
}));

vi.mock('@/hooks/use-leads', () => ({
  useLeads: vi.fn(() => ({
    data: mockLeads,
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    availableFilters: { statuses: [], owners: [], campaigns: [], leadSources: ['Email', 'Website', 'Referral'] },
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

// Story 4.9: Mock filter hooks for filter change tests
const mockSetStatuses = vi.fn();
const mockClearStatuses = vi.fn();
const mockSetOwners = vi.fn();
const mockClearOwners = vi.fn();
const mockSetDateRange = vi.fn();
const mockClearDateRange = vi.fn();

vi.mock('@/hooks/use-status-filter-params', () => ({
  useStatusFilterParams: vi.fn(() => ({
    statuses: [],
    setStatuses: mockSetStatuses,
    clearStatuses: mockClearStatuses,
    hasStatusFilter: false,
  })),
}));

vi.mock('@/hooks/use-owner-filter-params', () => ({
  useOwnerFilterParams: vi.fn(() => ({
    owners: [],
    setOwners: mockSetOwners,
    clearOwners: mockClearOwners,
    hasOwnerFilter: false,
  })),
  UNASSIGNED_VALUE: 'unassigned',
}));

vi.mock('@/hooks/use-date-filter-params', () => ({
  useDateFilterParams: vi.fn(() => ({
    dateRange: null,
    setDateRange: mockSetDateRange,
    clearDateRange: mockClearDateRange,
    hasDateFilter: false,
  })),
}));

vi.mock('@/hooks/use-sort-params', () => ({
  useSortParams: vi.fn(() => ({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    toggleSort: vi.fn(),
  })),
}));

// Story 4.14: Mock lead source filter hook
const mockSetLeadSource = vi.fn();
const mockClearLeadSource = vi.fn();
vi.mock('@/hooks/use-lead-source-filter-params', () => ({
  useLeadSourceFilterParams: vi.fn(() => ({
    leadSource: null,
    setLeadSource: mockSetLeadSource,
    clearLeadSource: mockClearLeadSource,
    hasLeadSourceFilter: false,
  })),
  UNKNOWN_SOURCE: '__unknown__',
}));

import { useLeads } from '@/hooks/use-leads';
import { useLeadSelection } from '@/hooks/use-lead-selection';
import { useStatusFilterParams } from '@/hooks/use-status-filter-params';
import { useOwnerFilterParams } from '@/hooks/use-owner-filter-params';
import { useDateFilterParams } from '@/hooks/use-date-filter-params';
import { useLeadSourceFilterParams } from '@/hooks/use-lead-source-filter-params';
import { useLeadSearchParams } from '@/hooks/use-search-params';
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
      availableFilters: { statuses: [], owners: [], campaigns: [], leadSources: ['Email', 'Website', 'Referral'] },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });
    // Story 4.9: Reset selection hook mock
    vi.mocked(useLeadSelection).mockReturnValue({
      selectedIds: new Set<number>(),
      selectedCount: 0,
      isSelected: mockIsSelected,
      toggleSelection: mockToggleSelection,
      selectAll: mockSelectAll,
      clearSelection: mockClearSelection,
      isAllSelected: () => false,
      isSomeSelected: () => false,
    });
    // Reset filter hooks
    vi.mocked(useStatusFilterParams).mockReturnValue({
      statuses: [],
      setStatuses: mockSetStatuses,
      clearStatuses: mockClearStatuses,
      hasStatusFilter: false,
    });
    vi.mocked(useOwnerFilterParams).mockReturnValue({
      owners: [],
      setOwners: mockSetOwners,
      clearOwners: mockClearOwners,
      hasOwnerFilter: false,
    });
    vi.mocked(useDateFilterParams).mockReturnValue({
      dateRange: null,
      setDateRange: mockSetDateRange,
      clearDateRange: mockClearDateRange,
      hasDateFilter: false,
    });
    vi.mocked(useLeadSearchParams).mockReturnValue({
      search: '',
      setSearch: mockSetSearch,
      clearSearch: mockClearSearch,
    });
  });

  describe('Loading state', () => {
    it('shows skeleton when loading', () => {
      vi.mocked(useLeads).mockReturnValue({
        data: undefined,
        pagination: undefined,
        availableFilters: undefined,
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
        availableFilters: undefined,
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
        availableFilters: undefined,
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
        availableFilters: { statuses: [], owners: [], campaigns: [], leadSources: [] },
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
        availableFilters: undefined,
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

  // ===========================================
  // Story 4.9: Bulk Select Tests
  // ===========================================
  describe('Story 4.9: Bulk Select', () => {
    // Task 7.10: Test checkbox click doesn't open detail sheet
    describe('checkbox click isolation', () => {
      it('does not open detail sheet when checkbox is clicked', async () => {
        renderWithProviders(<LeadTableContainer />);

        // Find the checkbox for row 1
        const checkbox = screen.getByTestId('select-checkbox-1');
        fireEvent.click(checkbox);

        // Wait a tick to ensure any async operations complete
        await waitFor(() => {
          // Detail sheet should NOT be present
          expect(screen.queryByTestId('lead-detail-sheet')).not.toBeInTheDocument();
        });
      });

      it('calls toggleSelection when checkbox is clicked', () => {
        renderWithProviders(<LeadTableContainer />);

        const checkbox = screen.getByTestId('select-checkbox-1');
        fireEvent.click(checkbox);

        expect(mockToggleSelection).toHaveBeenCalledWith(1);
      });
    });

    // Task 8.2: Test filter change clears selection
    describe('AC#7: filter change clears selection', () => {
      it('clears selection when status filter changes', async () => {
        // Start with some selections
        vi.mocked(useLeadSelection).mockReturnValue({
          selectedIds: new Set([1]),
          selectedCount: 1,
          isSelected: mockIsSelected,
          toggleSelection: mockToggleSelection,
          selectAll: mockSelectAll,
          clearSelection: mockClearSelection,
          isAllSelected: () => false,
          isSomeSelected: () => false,
        });

        const { rerender } = renderWithProviders(<LeadTableContainer />);

        // Now simulate status filter change
        vi.mocked(useStatusFilterParams).mockReturnValue({
          statuses: ['contacted'],
          setStatuses: mockSetStatuses,
          clearStatuses: mockClearStatuses,
          hasStatusFilter: true,
        });

        // Rerender to trigger the useEffect
        rerender(
          <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <TooltipProvider>
              <LeadTableContainer />
            </TooltipProvider>
          </QueryClientProvider>
        );

        await waitFor(() => {
          expect(mockClearSelection).toHaveBeenCalled();
        });
      });

      it('clears selection when owner filter changes', async () => {
        vi.mocked(useLeadSelection).mockReturnValue({
          selectedIds: new Set([1, 2]),
          selectedCount: 2,
          isSelected: mockIsSelected,
          toggleSelection: mockToggleSelection,
          selectAll: mockSelectAll,
          clearSelection: mockClearSelection,
          isAllSelected: () => false,
          isSomeSelected: () => false,
        });

        const { rerender } = renderWithProviders(<LeadTableContainer />);

        vi.mocked(useOwnerFilterParams).mockReturnValue({
          owners: ['John'],
          setOwners: mockSetOwners,
          clearOwners: mockClearOwners,
          hasOwnerFilter: true,
        });

        rerender(
          <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <TooltipProvider>
              <LeadTableContainer />
            </TooltipProvider>
          </QueryClientProvider>
        );

        await waitFor(() => {
          expect(mockClearSelection).toHaveBeenCalled();
        });
      });

      it('shows toast notification when selection is cleared due to filter change', async () => {
        vi.mocked(useLeadSelection).mockReturnValue({
          selectedIds: new Set([1]),
          selectedCount: 1,
          isSelected: mockIsSelected,
          toggleSelection: mockToggleSelection,
          selectAll: mockSelectAll,
          clearSelection: mockClearSelection,
          isAllSelected: () => false,
          isSomeSelected: () => false,
        });

        const { rerender } = renderWithProviders(<LeadTableContainer />);

        vi.mocked(useStatusFilterParams).mockReturnValue({
          statuses: ['new'],
          setStatuses: mockSetStatuses,
          clearStatuses: mockClearStatuses,
          hasStatusFilter: true,
        });

        rerender(
          <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <TooltipProvider>
              <LeadTableContainer />
            </TooltipProvider>
          </QueryClientProvider>
        );

        await waitFor(() => {
          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              description: 'Selection cleared due to filter change',
            })
          );
        });
      });
    });

    // Task 8.3: Test search change clears selection
    describe('AC#7: search change clears selection', () => {
      it('clears selection when search term changes', async () => {
        vi.mocked(useLeadSelection).mockReturnValue({
          selectedIds: new Set([1]),
          selectedCount: 1,
          isSelected: mockIsSelected,
          toggleSelection: mockToggleSelection,
          selectAll: mockSelectAll,
          clearSelection: mockClearSelection,
          isAllSelected: () => false,
          isSomeSelected: () => false,
        });

        const { rerender } = renderWithProviders(<LeadTableContainer />);

        // Simulate search change via debounced value
        vi.mocked(useLeadSearchParams).mockReturnValue({
          search: 'test search',
          setSearch: mockSetSearch,
          clearSearch: mockClearSearch,
        });

        rerender(
          <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <TooltipProvider>
              <LeadTableContainer />
            </TooltipProvider>
          </QueryClientProvider>
        );

        await waitFor(() => {
          expect(mockClearSelection).toHaveBeenCalled();
        });
      });
    });

    // Selection toolbar rendering
    describe('selection toolbar', () => {
      it('renders selection toolbar when items are selected', () => {
        vi.mocked(useLeadSelection).mockReturnValue({
          selectedIds: new Set([1, 2]),
          selectedCount: 2,
          isSelected: mockIsSelected,
          toggleSelection: mockToggleSelection,
          selectAll: mockSelectAll,
          clearSelection: mockClearSelection,
          isAllSelected: () => false,
          isSomeSelected: () => true,
        });

        renderWithProviders(<LeadTableContainer />);

        expect(screen.getByTestId('selection-toolbar')).toBeInTheDocument();
        expect(screen.getByText('2 leads selected')).toBeInTheDocument();
      });

      it('does not render selection toolbar when no items are selected', () => {
        renderWithProviders(<LeadTableContainer />);

        expect(screen.queryByTestId('selection-toolbar')).not.toBeInTheDocument();
      });

      it('calls clearSelection when clear button is clicked', () => {
        vi.mocked(useLeadSelection).mockReturnValue({
          selectedIds: new Set([1]),
          selectedCount: 1,
          isSelected: mockIsSelected,
          toggleSelection: mockToggleSelection,
          selectAll: mockSelectAll,
          clearSelection: mockClearSelection,
          isAllSelected: () => false,
          isSomeSelected: () => false,
        });

        renderWithProviders(<LeadTableContainer />);

        const clearButton = screen.getByTestId('clear-selection-button');
        fireEvent.click(clearButton);

        expect(mockClearSelection).toHaveBeenCalled();
      });
    });
  });

  // Story 4.16 Task 8: URL State Sync
  describe('Task 8: URL State Sync on Mobile', () => {
    beforeEach(() => {
      // Reset all mocks
      mockSetStatuses.mockClear();
      mockSetOwners.mockClear();
      mockSetDateRange.mockClear();
      mockSetLeadSource.mockClear();
    });

    // AC#12, Task 8.1: Verify URL param hooks work on mobile
    it('8.1: URL param hooks work correctly on mobile', () => {
      renderWithProviders(<LeadTableContainer />);

      // Verify all URL hooks are called on mount
      expect(useStatusFilterParams).toHaveBeenCalled();
      expect(useOwnerFilterParams).toHaveBeenCalled();
      expect(useDateFilterParams).toHaveBeenCalled();
      expect(useLeadSourceFilterParams).toHaveBeenCalled();
    });

    // AC#12, Task 8.2: Apply filters → URL updates
    it('8.2: applying filters through mobile sheet updates URL params', async () => {
      renderWithProviders(<LeadTableContainer />);

      // Open mobile filter sheet
      const filterButton = screen.getByRole('button', { name: /filters/i });
      fireEvent.click(filterButton);

      // Wait for sheet to open
      await waitFor(() => {
        expect(screen.getByTestId('mobile-filter-sheet')).toBeInTheDocument();
      });

      // Get mobile filter sheet container
      const mobileSheet = screen.getByTestId('mobile-filter-sheet');

      // Change status filter inside mobile sheet
      const statusFilters = screen.getAllByTestId('status-filter-trigger');
      const mobileStatusFilter = statusFilters.find((el) =>
        mobileSheet.contains(el)
      );
      expect(mobileStatusFilter).toBeDefined();
      fireEvent.click(mobileStatusFilter!);

      // Select "New" status (using test id)
      await waitFor(() => {
        const newOption = screen.getByTestId('status-option-new');
        fireEvent.click(newOption);
      });

      // Apply filters
      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      // Verify URL hook was called with new status
      await waitFor(() => {
        expect(mockSetStatuses).toHaveBeenCalled();
      });
    });

    // AC#12, Task 8.3: Direct URL navigation → filters restored
    it('8.3: loading with URL params restores filters correctly', () => {
      // Mock URL params as if user navigated to filtered URL
      vi.mocked(useStatusFilterParams).mockReturnValue({
        statuses: ['new', 'contacted'],
        setStatuses: mockSetStatuses,
        clearStatuses: vi.fn(),
        hasStatusFilter: true,
      });

      vi.mocked(useOwnerFilterParams).mockReturnValue({
        owners: ['owner1'],
        setOwners: mockSetOwners,
        clearOwners: vi.fn(),
        hasOwnerFilter: true,
      });

      renderWithProviders(<LeadTableContainer />);

      // Verify filter chips are displayed with restored values
      expect(screen.getByText(/status:/i)).toBeInTheDocument();
      expect(screen.getByText(/owner:/i)).toBeInTheDocument();
    });

    // AC#12, Task 8.5: Bottom sheet closed by default when loading from URL
    it('8.5: bottom sheet is closed by default when loading from URL with filters', () => {
      // Mock URL params with active filters
      vi.mocked(useStatusFilterParams).mockReturnValue({
        statuses: ['new'],
        setStatuses: mockSetStatuses,
        clearStatuses: vi.fn(),
        hasStatusFilter: true,
      });

      renderWithProviders(<LeadTableContainer />);

      // Verify filter chips are shown
      expect(screen.getByText(/status:/i)).toBeInTheDocument();

      // Verify bottom sheet is NOT open
      expect(screen.queryByTestId('mobile-filter-sheet')).not.toBeInTheDocument();
    });

    // Task 8: Verify filter state persists when closing/reopening sheet
    it('preserves filter state when opening bottom sheet after URL load', async () => {
      // Mock URL params
      vi.mocked(useStatusFilterParams).mockReturnValue({
        statuses: ['new'],
        setStatuses: mockSetStatuses,
        clearStatuses: vi.fn(),
        hasStatusFilter: true,
      });

      renderWithProviders(<LeadTableContainer />);

      // Open mobile filter sheet
      const filterButton = screen.getByRole('button', { name: /filters/i });
      fireEvent.click(filterButton);

      // Wait for sheet to open
      await waitFor(() => {
        expect(screen.getByTestId('mobile-filter-sheet')).toBeInTheDocument();
      });

      // Get mobile filter sheet container
      const mobileSheet = screen.getByTestId('mobile-filter-sheet');

      // Verify the filter shows pre-selected value from URL
      // The status filter button exists and has content (showing "ใหม่" in Thai)
      const statusFilters = screen.getAllByTestId('status-filter-trigger');
      const mobileStatusFilter = statusFilters.find((el) =>
        mobileSheet.contains(el)
      );
      expect(mobileStatusFilter).toBeDefined();
      // Filter shows "ใหม่" (New in Thai) because status=['new'] from URL
      expect(mobileStatusFilter).toHaveTextContent(/ใหม่/i);
    });
  });
});
