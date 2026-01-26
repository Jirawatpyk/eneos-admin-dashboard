/**
 * Lead Table Container Component
 * Story 4.1: Lead List Table
 * Story 4.2: Pagination - Added pagination support
 * Story 4.3: Search - Added search functionality (AC#1-7)
 * Story 4.4: Filter by Status - Added status filter (AC#1-9)
 * Story 4.5: Filter by Owner - Added owner filter (AC#1-9)
 * Story 4.6: Filter by Date - Added date filter (AC#1-9)
 * Story 4.7: Sort Columns - Added URL-synced sorting (AC#1-9)
 * Story 4.9: Bulk Select - Added selection state management (AC#4, AC#7)
 * Story 4.10: Quick Export - Added export functionality (AC#1-10)
 * Story 4.14: Lead Source Filter - Added lead source filter (AC#1-9)
 *
 * Container component that handles:
 * - Data fetching with useLeads hook
 * - Pagination with URL state sync (AC#4)
 * - Search with debounce and URL sync (Story 4.3)
 * - Status filter with URL sync (Story 4.4 AC#7)
 * - Owner filter with URL sync (Story 4.5 AC#8)
 * - Date filter with URL sync (Story 4.6 AC#8)
 * - Sort with URL sync (Story 4.7 AC#5)
 * - Loading/error/empty states
 * - Passing data to presentation component
 * - Detail sheet open/close state
 *
 * @note This component uses usePaginationParams, useLeadSearchParams, useStatusFilterParams,
 *       useOwnerFilterParams, useDateFilterParams, and useSortParams which require useSearchParams.
 *       Parent page MUST wrap this component in a Suspense boundary.
 *       See: project-context.md → Hydration Safety
 */
'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { type SortingState } from '@tanstack/react-table';
import { useLeads } from '@/hooks/use-leads';
import { useLeadSelection } from '@/hooks/use-lead-selection';
import { toast } from '@/hooks/use-toast';
import { usePaginationParams, type ValidLimit } from '@/hooks/use-pagination-params';
import { useLeadSearchParams } from '@/hooks/use-search-params';
import { useStatusFilterParams } from '@/hooks/use-status-filter-params';
import { useOwnerFilterParams } from '@/hooks/use-owner-filter-params';
import { useDateFilterParams } from '@/hooks/use-date-filter-params';
import { useLeadSourceFilterParams } from '@/hooks/use-lead-source-filter-params';
import { useSortParams } from '@/hooks/use-sort-params';
import { useDebounce } from '@/hooks/use-debounce';
import { LeadTable } from './lead-table';
import { LeadTableSkeleton } from './lead-table-skeleton';
import { LeadTableEmpty } from './lead-table-empty';
import { LeadTableError } from './lead-table-error';
import { LeadDetailSheet } from './lead-detail-sheet';
import { MobileFilterSheet } from './mobile-filter-sheet';
import { MobileFilterToolbar } from './mobile-filter-toolbar';
import { ActiveFilterChips } from './active-filter-chips';
import { LeadPagination } from './lead-pagination';
import type { Lead, LeadStatus } from '@/types/lead';
import { LeadSearch } from './lead-search';
import { LeadStatusFilter } from './lead-status-filter';
import { LeadOwnerFilter } from './lead-owner-filter';
import { LeadDateFilter } from './lead-date-filter';
import { LeadSourceFilter } from './lead-source-filter';
import { SelectionToolbar } from './selection-toolbar';
import { ExportAllButton } from './export-all-button';
import { ColumnVisibilityDropdown } from './column-visibility-dropdown';
import { formatDateForApi } from '@/lib/date-presets';
import { useColumnVisibility } from '@/hooks/use-column-visibility';
import type { Lead, LeadsQueryParams } from '@/types/lead';
import { cn } from '@/lib/utils';

export function LeadTableContainer() {
  // Story 4.2 AC#4: URL state sync for pagination
  const { page, limit, setPage, setLimit } = usePaginationParams();

  // Story 4.3 AC#7: URL state sync for search
  const { search: urlSearch, setSearch: setUrlSearch, clearSearch } = useLeadSearchParams();

  // Story 4.4 AC#7: URL state sync for status filter
  const { statuses, setStatuses, hasStatusFilter } = useStatusFilterParams();

  // Story 4.5 AC#8: URL state sync for owner filter
  const { owners, setOwners, hasOwnerFilter } = useOwnerFilterParams();

  // Story 4.6 AC#8: URL state sync for date filter
  const { dateRange, setDateRange, hasDateFilter } = useDateFilterParams();

  // Story 4.14 AC#5: URL state sync for lead source filter
  const { leadSource, setLeadSource, hasLeadSourceFilter } = useLeadSourceFilterParams();

  // Story 4.7 AC#5: URL state sync for sorting
  const { sortBy, sortOrder, toggleSort } = useSortParams();

  // Story 4.3 AC#2: Local search input state (for immediate UI feedback)
  const [searchInput, setSearchInput] = useState(urlSearch);

  // Story 4.3 AC#2: Debounce search input (300ms)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Story 4.3 AC#7: Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      setUrlSearch(debouncedSearch);
    }
  }, [debouncedSearch, urlSearch, setUrlSearch]);

  // Story 4.3 AC#7: Sync URL search to input when navigating via URL
  // This handles the case when user navigates directly to a URL with search param
  // or when the URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    // Only sync from URL to input if the URL search changed externally
    // and the input is either empty or matches a previous URL value
    // This prevents overwriting user's in-progress typing
    setSearchInput((currentInput) => {
      // If URL has a value and input is empty, sync from URL
      if (urlSearch && !currentInput) {
        return urlSearch;
      }
      // If URL is empty and input has value, keep input (debounce will sync)
      // If both have values and differ, keep input (user is typing)
      return currentInput;
    });
  }, [urlSearch]);

  // Story 4.7 AC#5: Convert URL sort params to TanStack Table SortingState
  const sorting: SortingState = useMemo(
    () => [{ id: sortBy, desc: sortOrder === 'desc' }],
    [sortBy, sortOrder]
  );

  // Story 4.9: Selection state management
  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected,
  } = useLeadSelection();

  // Tech Debt: Column visibility toggle
  const {
    columnVisibility,
    toggleColumnVisibility,
    resetColumnVisibility,
    isColumnVisible,
    hiddenColumnCount,
  } = useColumnVisibility();

  // Story 4.9 AC#7: Track previous filter values to detect changes
  const prevFiltersRef = useRef({ status: statuses, owner: owners, search: debouncedSearch, dateRange, leadSource });

  // Story 4.9 AC#7: Clear selection when filters/search change
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged =
      JSON.stringify(prev.status) !== JSON.stringify(statuses) ||
      JSON.stringify(prev.owner) !== JSON.stringify(owners) ||
      prev.search !== debouncedSearch ||
      prev.dateRange?.from !== dateRange?.from ||
      prev.dateRange?.to !== dateRange?.to ||
      prev.leadSource !== leadSource; // Story 4.14

    if (filtersChanged && selectedCount > 0) {
      clearSelection();
      toast({
        title: 'Selection cleared',
        description: 'Selection cleared due to filter change',
      });
    }

    prevFiltersRef.current = { status: statuses, owner: owners, search: debouncedSearch, dateRange, leadSource };
  }, [statuses, owners, debouncedSearch, dateRange, leadSource, selectedCount, clearSelection]);

  // Detail sheet state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Story 4.16 AC#4: Mobile filter sheet state
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Story 4.3 AC#3: Pass search param to useLeads hook
  // Story 4.4 AC#4, AC#5: Pass status filter to useLeads hook
  // Story 4.5 AC#4, AC#6: Pass owner filter to useLeads hook
  // Story 4.6 AC#5, AC#6: Pass date filter to useLeads hook
  // Story 4.7 AC#8: Pass sort params to useLeads hook
  // Story 4.14 AC#4: Pass lead source filter to useLeads hook
  const { data, pagination, availableFilters, isLoading, isFetching, isError, error, refetch } = useLeads({
    page,
    limit,
    search: debouncedSearch || undefined, // Only pass if not empty
    status: statuses.length > 0 ? statuses : undefined, // Story 4.4 AC#4
    owner: owners.length > 0 ? owners : undefined, // Story 4.5 AC#4
    from: dateRange?.from ? formatDateForApi(dateRange.from) : undefined, // Story 4.6 AC#5
    to: dateRange?.to ? formatDateForApi(dateRange.to) : undefined, // Story 4.6 AC#5
    leadSource: leadSource || undefined, // Story 4.14 AC#4
    sortBy, // Story 4.7 AC#8
    sortDir: sortOrder, // Story 4.7 AC#8
  });

  // Story 4.3 AC#2: isPending when debounce in progress
  const isSearchPending = searchInput !== debouncedSearch;

  // Story 4.9: Compute visible row IDs for select all functionality
  const visibleRowIds = useMemo(() => data?.map((lead) => lead.row) ?? [], [data]);

  // Story 4.10: Get actual lead data for selected IDs (for export)
  const selectedLeads = useMemo(
    () => data?.filter((lead) => selectedIds.has(lead.row)) ?? [],
    [data, selectedIds]
  );

  // Tech Debt: Export All - filter params for fetching all matching leads
  const exportAllFilters: Omit<LeadsQueryParams, 'page' | 'limit'> = useMemo(
    () => ({
      status: statuses.length > 0 ? statuses : undefined,
      owner: owners.length > 0 ? owners : undefined,
      search: debouncedSearch || undefined,
      from: dateRange?.from ? formatDateForApi(dateRange.from) : undefined,
      to: dateRange?.to ? formatDateForApi(dateRange.to) : undefined,
      leadSource: leadSource || undefined,
      sortBy,
      sortDir: sortOrder,
    }),
    [statuses, owners, debouncedSearch, dateRange, leadSource, sortBy, sortOrder]
  );

  // AC#5: Row click handler
  const handleRowClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setSheetOpen(true);
  }, []);

  // Story 4.2 AC#2: Reset to page 1 when limit changes (handled in hook)
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit as ValidLimit);
  }, [setLimit]);

  // Story 4.3 AC#5: Clear search handler
  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    clearSearch();
  }, [clearSearch]);

  // Story 4.4 AC#6, Story 4.5 AC#7, Story 4.6 AC#7, Story 4.14 AC#7: Handle clear when search or any filter is active
  const handleClearFilters = useCallback(() => {
    if (debouncedSearch) {
      handleClearSearch();
    }
    if (hasStatusFilter) {
      setStatuses([]);
    }
    if (hasOwnerFilter) {
      setOwners([]);
    }
    if (hasDateFilter) {
      setDateRange(null);
    }
    if (hasLeadSourceFilter) {
      setLeadSource(null);
    }
  }, [debouncedSearch, handleClearSearch, hasStatusFilter, setStatuses, hasOwnerFilter, setOwners, hasDateFilter, setDateRange, hasLeadSourceFilter, setLeadSource]);

  // Story 4.16 AC#3: Handle individual chip removal (immediate update, bypasses manual-apply)
  const handleChipRemove = useCallback((filterType: 'status' | 'owner' | 'date' | 'source') => {
    switch (filterType) {
      case 'status':
        setStatuses([]);
        break;
      case 'owner':
        setOwners([]);
        break;
      case 'date':
        setDateRange(null);
        break;
      case 'source':
        setLeadSource(null);
        break;
    }
  }, [setStatuses, setOwners, setDateRange, setLeadSource]);

  // Story 4.16 AC#6: Handle mobile filter sheet apply
  const handleFilterSheetApply = useCallback(async (filters: {
    status: LeadStatus[]
    owner: string[]
    dateRange: { from?: Date; to?: Date } | null
    leadSource: string | null
  }) => {
    setStatuses(filters.status);
    setOwners(filters.owner);
    setDateRange(filters.dateRange?.from && filters.dateRange?.to ? {
      from: filters.dateRange.from,
      to: filters.dateRange.to
    } : null);
    setLeadSource(filters.leadSource);
    setFilterSheetOpen(false);
  }, [setStatuses, setOwners, setDateRange, setLeadSource]);

  // Story 4.16 AC#6: Handle mobile filter sheet cancel
  const handleFilterSheetCancel = useCallback(() => {
    setFilterSheetOpen(false);
  }, []);

  // Story 4.16 AC#7: Handle clear all in bottom sheet
  const handleFilterSheetClearAll = useCallback(() => {
    // Clear all immediately (updates temp state in sheet)
    // Will apply when user clicks "Apply"
  }, []);

  // Story 4.16 AC#1: Auto-close bottom sheet on resize mobile→desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && filterSheetOpen) {
        setFilterSheetOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [filterSheetOpen]);

  // Story 4.14: Get available lead sources from API
  const availableLeadSources = availableFilters?.leadSources ?? [];

  // Story 4.16: Calculate active filter count for mobile toolbar badge
  const activeFilterCount = (
    (hasStatusFilter ? 1 : 0) +
    (hasOwnerFilter ? 1 : 0) +
    (hasDateFilter ? 1 : 0) +
    (hasLeadSourceFilter ? 1 : 0)
  );

  // Story 4.16: Owner names map for ActiveFilterChips
  const ownerNames = useMemo(() => {
    const names: Record<string, string> = {};
    availableFilters?.owners?.forEach(owner => {
      names[owner.id] = owner.name;
    });
    return names;
  }, [availableFilters]);

  // AC#6: Loading state (only on initial load, not during pagination)
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Story 4.3, 4.4, 4.5, 4.6, 4.14: Show search and filters even during loading */}
        <div className="flex flex-wrap items-center gap-4">
          <LeadSearch
            value={searchInput}
            onChange={setSearchInput}
            isPending={isSearchPending}
            className="flex-1 min-w-[200px]"
          />
          <LeadStatusFilter value={statuses} onChange={setStatuses} />
          <LeadOwnerFilter value={owners} onChange={setOwners} />
          <LeadDateFilter value={dateRange} onChange={setDateRange} />
          <LeadSourceFilter
            value={leadSource}
            sources={availableLeadSources}
            onChange={setLeadSource}
            isLoading={true}
          />
        </div>
        <LeadTableSkeleton />
      </div>
    );
  }

  // AC#6: Error state with retry
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <LeadSearch
            value={searchInput}
            onChange={setSearchInput}
            isPending={isSearchPending}
            className="flex-1 min-w-[200px]"
          />
          <LeadStatusFilter value={statuses} onChange={setStatuses} />
          <LeadOwnerFilter value={owners} onChange={setOwners} />
          <LeadDateFilter value={dateRange} onChange={setDateRange} />
          <LeadSourceFilter
            value={leadSource}
            sources={availableLeadSources}
            onChange={setLeadSource}
          />
        </div>
        <LeadTableError
          message={error?.message || 'Failed to load leads data'}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Story 4.3 AC#6, Story 4.4, 4.5, 4.6, 4.14: Empty state with search/filter context
  if (!data || data.length === 0) {
    const hasAnyFilter = hasStatusFilter || hasOwnerFilter || hasDateFilter || hasLeadSourceFilter;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <LeadSearch
            value={searchInput}
            onChange={setSearchInput}
            isPending={isSearchPending}
            className="flex-1 min-w-[200px]"
          />
          <LeadStatusFilter value={statuses} onChange={setStatuses} />
          <LeadOwnerFilter value={owners} onChange={setOwners} />
          <LeadDateFilter value={dateRange} onChange={setDateRange} />
          <LeadSourceFilter
            value={leadSource}
            sources={availableLeadSources}
            onChange={setLeadSource}
          />
        </div>
        <LeadTableEmpty
          searchTerm={debouncedSearch}
          hasFilters={hasAnyFilter}
          onClearSearch={debouncedSearch || hasAnyFilter ? handleClearFilters : undefined}
        />
      </div>
    );
  }

  // Render table with data and pagination
  return (
    <div className="space-y-4">
      {/* Story 4.16 AC#1: Responsive filter toolbar */}

      {/* Desktop layout (>= 768px) */}
      <div className="hidden md:flex flex-wrap items-center gap-4">
        <LeadSearch
          value={searchInput}
          onChange={setSearchInput}
          isPending={isSearchPending || isFetching}
          resultCount={pagination?.total}
          className="flex-1 min-w-[200px]"
        />
        <LeadStatusFilter
          value={statuses}
          onChange={setStatuses}
          disabled={isFetching}
        />
        <LeadOwnerFilter
          value={owners}
          onChange={setOwners}
          disabled={isFetching}
        />
        <LeadDateFilter
          value={dateRange}
          onChange={setDateRange}
          disabled={isFetching}
        />
        <LeadSourceFilter
          value={leadSource}
          sources={availableLeadSources}
          onChange={setLeadSource}
          disabled={isFetching}
        />
        {/* Story 4.16 AC#2: Hide Column Visibility on mobile */}
        <ColumnVisibilityDropdown
          isColumnVisible={isColumnVisible}
          toggleColumnVisibility={toggleColumnVisibility}
          resetColumnVisibility={resetColumnVisibility}
          hiddenColumnCount={hiddenColumnCount}
          disabled={isFetching}
        />
        {selectedCount === 0 && pagination && (
          <ExportAllButton
            filters={exportAllFilters}
            totalCount={pagination.total}
            disabled={isFetching}
          />
        )}
      </div>

      {/* Mobile layout (< 768px) */}
      <div className="md:hidden space-y-3">
        {/* Story 4.16 AC#2: Mobile search (full-width) */}
        <LeadSearch
          value={searchInput}
          onChange={setSearchInput}
          isPending={isSearchPending || isFetching}
          resultCount={pagination?.total}
          className="w-full"
        />

        {/* Story 4.16 AC#3: Active filter chips (if any) */}
        <ActiveFilterChips
          status={statuses}
          owner={owners}
          dateRange={dateRange}
          leadSource={leadSource}
          onRemove={handleChipRemove}
          ownerNames={ownerNames}
        />

        {/* Story 4.16 AC#2, AC#9: Mobile filter toolbar */}
        <MobileFilterToolbar
          activeFilterCount={activeFilterCount}
          onFilterClick={() => setFilterSheetOpen(true)}
          filters={exportAllFilters}
          totalCount={pagination?.total ?? 0}
        />
      </div>

      {/* Story 4.9 AC#4: Selection toolbar (conditionally rendered) */}
      {/* Story 4.10: Pass selectedLeads for export functionality */}
      <SelectionToolbar
        selectedCount={selectedCount}
        selectedLeads={selectedLeads}
        onClearSelection={clearSelection}
      />

      {/* Story 4.2 AC#5: Table with subtle loading state during pagination/search */}
      <div
        className={cn(
          'transition-opacity duration-200',
          isFetching && 'opacity-70'
        )}
      >
        <LeadTable
          data={data}
          sorting={sorting}
          onSortingChange={toggleSort}
          onRowClick={handleRowClick}
          // Story 4.9: Selection props
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onSelectAll={() => selectAll(visibleRowIds)}
          isAllSelected={isAllSelected(visibleRowIds)}
          isSomeSelected={isSomeSelected(visibleRowIds)}
          // Tech Debt: Column visibility toggle
          columnVisibility={columnVisibility}
        />
      </div>

      {/* Story 4.2 AC#1-8, Story 4.3 AC#4: Pagination controls (reflects filtered count) */}
      {pagination && (
        <LeadPagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
          isFetching={isFetching}
        />
      )}

      {/* Detail Sheet */}
      <LeadDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        lead={selectedLead}
      />

      {/* Story 4.16 AC#4, AC#5, AC#6: Mobile Filter Sheet */}
      <MobileFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        status={statuses}
        owner={owners}
        dateRange={dateRange}
        leadSource={leadSource}
        onApply={handleFilterSheetApply}
        onCancel={handleFilterSheetCancel}
        onClearAll={handleFilterSheetClearAll}
      />
    </div>
  );
}
