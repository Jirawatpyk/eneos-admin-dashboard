/**
 * Lead Table Container Component
 * Story 4.1: Lead List Table
 * Story 4.2: Pagination - Added pagination support
 * Story 4.3: Search - Added search functionality (AC#1-7)
 * Story 4.4: Filter by Status - Added status filter (AC#1-9)
 * Story 4.5: Filter by Owner - Added owner filter (AC#1-9)
 *
 * Container component that handles:
 * - Data fetching with useLeads hook
 * - Pagination with URL state sync (AC#4)
 * - Search with debounce and URL sync (Story 4.3)
 * - Status filter with URL sync (Story 4.4 AC#7)
 * - Owner filter with URL sync (Story 4.5 AC#8)
 * - Loading/error/empty states
 * - Passing data to presentation component
 * - Detail sheet open/close state
 * - Default sort (createdAt DESC)
 *
 * @note This component uses usePaginationParams, useLeadSearchParams, useStatusFilterParams,
 *       and useOwnerFilterParams which require useSearchParams. Parent page MUST wrap this
 *       component in a Suspense boundary.
 *       See: project-context.md → Hydration Safety
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { type SortingState } from '@tanstack/react-table';
import { useLeads } from '@/hooks/use-leads';
import { usePaginationParams, type ValidLimit } from '@/hooks/use-pagination-params';
import { useLeadSearchParams } from '@/hooks/use-search-params';
import { useStatusFilterParams } from '@/hooks/use-status-filter-params';
import { useOwnerFilterParams } from '@/hooks/use-owner-filter-params';
import { useDebounce } from '@/hooks/use-debounce';
import { LeadTable } from './lead-table';
import { LeadTableSkeleton } from './lead-table-skeleton';
import { LeadTableEmpty } from './lead-table-empty';
import { LeadTableError } from './lead-table-error';
import { LeadDetailSheet } from './lead-detail-sheet';
import { LeadPagination } from './lead-pagination';
import { LeadSearch } from './lead-search';
import { LeadStatusFilter } from './lead-status-filter';
import { LeadOwnerFilter } from './lead-owner-filter';
import type { Lead } from '@/types/lead';
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

  // AC#8: Default sort - createdAt DESC (newest first)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  // Detail sheet state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch leads with current sorting and pagination
  const sortBy = sorting.length > 0 ? sorting[0].id : 'createdAt';
  const sortDir = sorting.length > 0 && sorting[0].desc ? 'desc' : 'asc';

  // Story 4.3 AC#3: Pass search param to useLeads hook
  // Story 4.4 AC#4, AC#5: Pass status filter to useLeads hook
  // Story 4.5 AC#4, AC#6: Pass owner filter to useLeads hook
  const { data, pagination, isLoading, isFetching, isError, error, refetch } = useLeads({
    page,
    limit,
    search: debouncedSearch || undefined, // Only pass if not empty
    status: statuses.length > 0 ? statuses : undefined, // Story 4.4 AC#4
    owner: owners.length > 0 ? owners : undefined, // Story 4.5 AC#4
    sortBy,
    sortDir,
  });

  // Story 4.3 AC#2: isPending when debounce in progress
  const isSearchPending = searchInput !== debouncedSearch;

  // AC#5: Row click handler
  const handleRowClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setSheetOpen(true);
  }, []);

  // Handle sorting change
  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
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

  // Story 4.4 AC#6, Story 4.5 AC#7: Handle clear when search or any filter is active
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
  }, [debouncedSearch, handleClearSearch, hasStatusFilter, setStatuses, hasOwnerFilter, setOwners]);

  // AC#6: Loading state (only on initial load, not during pagination)
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Story 4.3, 4.4, 4.5: Show search and filters even during loading */}
        <div className="flex flex-wrap items-center gap-4">
          <LeadSearch
            value={searchInput}
            onChange={setSearchInput}
            isPending={isSearchPending}
            className="flex-1 min-w-[200px]"
          />
          <LeadStatusFilter value={statuses} onChange={setStatuses} />
          <LeadOwnerFilter value={owners} onChange={setOwners} />
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
        </div>
        <LeadTableError
          message={error?.message || 'Failed to load leads data'}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Story 4.3 AC#6, Story 4.4, 4.5: Empty state with search/filter context
  if (!data || data.length === 0) {
    const hasAnyFilter = hasStatusFilter || hasOwnerFilter;
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
      {/* Story 4.3 AC#1, Story 4.4 AC#1, Story 4.5 AC#1: Filter toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <LeadSearch
          value={searchInput}
          onChange={setSearchInput}
          isPending={isSearchPending || isFetching}
          resultCount={pagination?.total}
          className="flex-1 min-w-[200px]"
        />
        {/* Story 4.4 AC#1: Status filter next to search */}
        <LeadStatusFilter
          value={statuses}
          onChange={setStatuses}
          disabled={isFetching}
        />
        {/* Story 4.5 AC#1: Owner filter next to status filter */}
        <LeadOwnerFilter
          value={owners}
          onChange={setOwners}
          disabled={isFetching}
        />
      </div>

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
          onSortingChange={handleSortingChange}
          onRowClick={handleRowClick}
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
    </div>
  );
}
