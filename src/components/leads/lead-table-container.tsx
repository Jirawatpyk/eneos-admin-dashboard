/**
 * Lead Table Container Component
 * Story 4.1: Lead List Table
 * Story 4.2: Pagination - Added pagination support
 *
 * Container component that handles:
 * - Data fetching with useLeads hook
 * - Pagination with URL state sync (AC#4)
 * - Loading/error/empty states
 * - Passing data to presentation component
 * - Detail sheet open/close state
 * - Default sort (createdAt DESC)
 *
 * @note This component uses usePaginationParams which requires useSearchParams.
 *       Parent page MUST wrap this component in a Suspense boundary.
 *       See: project-context.md → Hydration Safety
 */
'use client';

import { useState, useCallback } from 'react';
import { type SortingState } from '@tanstack/react-table';
import { useLeads } from '@/hooks/use-leads';
import { usePaginationParams, type ValidLimit } from '@/hooks/use-pagination-params';
import { LeadTable } from './lead-table';
import { LeadTableSkeleton } from './lead-table-skeleton';
import { LeadTableEmpty } from './lead-table-empty';
import { LeadTableError } from './lead-table-error';
import { LeadDetailSheet } from './lead-detail-sheet';
import { LeadPagination } from './lead-pagination';
import type { Lead } from '@/types/lead';
import { cn } from '@/lib/utils';

export function LeadTableContainer() {
  // Story 4.2 AC#4: URL state sync for pagination
  const { page, limit, setPage, setLimit } = usePaginationParams();

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

  // Story 4.2: Pass pagination params to useLeads hook
  const { data, pagination, isLoading, isFetching, isError, error, refetch } = useLeads({
    page,
    limit,
    sortBy,
    sortDir,
  });

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

  // AC#6: Loading state (only on initial load, not during pagination)
  if (isLoading) {
    return <LeadTableSkeleton />;
  }

  // AC#6: Error state with retry
  if (isError) {
    return (
      <LeadTableError
        message={error?.message || 'Failed to load leads data'}
        onRetry={refetch}
      />
    );
  }

  // AC#6: Empty state
  if (!data || data.length === 0) {
    return <LeadTableEmpty />;
  }

  // Render table with data and pagination
  return (
    <div className="space-y-4">
      {/* Story 4.2 AC#5: Table with subtle loading state during pagination */}
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

      {/* Story 4.2 AC#1-8: Pagination controls */}
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
