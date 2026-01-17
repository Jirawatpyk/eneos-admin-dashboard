/**
 * Lead Table Container Component
 * Story 4.1: Lead List Table
 *
 * AC#1-8: Container component that handles:
 * - Data fetching with useLeads hook
 * - Loading/error/empty states
 * - Passing data to presentation component
 * - Detail sheet open/close state
 * - Default sort (createdAt DESC)
 */
'use client';

import { useState, useCallback } from 'react';
import { type SortingState } from '@tanstack/react-table';
import { useLeads } from '@/hooks/use-leads';
import { LeadTable } from './lead-table';
import { LeadTableSkeleton } from './lead-table-skeleton';
import { LeadTableEmpty } from './lead-table-empty';
import { LeadTableError } from './lead-table-error';
import { LeadDetailSheet } from './lead-detail-sheet';
import type { Lead } from '@/types/lead';

export function LeadTableContainer() {
  // AC#8: Default sort - createdAt DESC (newest first)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  // Detail sheet state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch leads with current sorting
  const sortBy = sorting.length > 0 ? sorting[0].id : 'createdAt';
  const sortDir = sorting.length > 0 && sorting[0].desc ? 'desc' : 'asc';

  const { data, isLoading, isError, error, refetch } = useLeads({
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

  // AC#6: Loading state
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

  // AC#1-5, 7-9: Render table with data
  return (
    <>
      <LeadTable
        data={data}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        onRowClick={handleRowClick}
      />

      {/* AC#5: Detail Sheet */}
      <LeadDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        lead={selectedLead}
      />
    </>
  );
}
