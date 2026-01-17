/**
 * Sort URL State Hook
 * Story 4.7: Sort Columns - AC#5
 *
 * Syncs sort state with URL searchParams for shareable links
 * Uses Next.js App Router navigation hooks
 *
 * @note Default sort (createdAt DESC) is NOT stored in URL - clean URLs
 */
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { VALID_SORT_COLUMNS, DEFAULT_SORT } from '@/lib/leads-constants';

/** Sort order type */
export type SortOrder = 'asc' | 'desc';

/**
 * Return type for useSortParams hook
 */
export interface UseSortParamsReturn {
  /** Current sort column */
  sortBy: string;
  /** Current sort order (asc/desc) */
  sortOrder: SortOrder;
  /** Update sort - resets to page 1 (AC#7) */
  setSort: (sortBy: string, sortOrder: SortOrder) => void;
  /** Toggle sort for a column - ascending first, then descending, except createdAt which defaults to desc */
  toggleSort: (columnId: string) => void;
  /** Check if current sort is the default (not in URL) */
  isDefaultSort: boolean;
}

/**
 * Parse sortBy from URL, ensuring it's a valid column
 */
function parseSortByParam(value: string | null): string {
  if (!value) return DEFAULT_SORT.sortBy;
  if (VALID_SORT_COLUMNS.includes(value)) {
    return value;
  }
  return DEFAULT_SORT.sortBy;
}

/**
 * Parse sortOrder from URL
 */
function parseSortOrderParam(value: string | null): SortOrder {
  if (value === 'asc' || value === 'desc') {
    return value;
  }
  return DEFAULT_SORT.sortOrder;
}

/**
 * Hook for syncing sort state with URL
 * Requires Suspense wrapper due to useSearchParams
 *
 * Features (AC#5):
 * - URL updates to ?sortBy=column&sortOrder=asc
 * - Preserves sort on page refresh
 * - Shareable URLs
 * - Default sort (createdAt DESC) not shown in URL
 *
 * @example
 * ```tsx
 * function LeadsContent() {
 *   const { sortBy, sortOrder, toggleSort, isDefaultSort } = useSortParams();
 *   const { data } = useLeads({ sortBy, sortDir: sortOrder });
 *   // ...
 * }
 * ```
 */
export function useSortParams(): UseSortParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current values from URL
  const sortBy = useMemo(
    () => parseSortByParam(searchParams.get('sortBy')),
    [searchParams]
  );

  const sortOrder = useMemo(
    () => parseSortOrderParam(searchParams.get('sortOrder')),
    [searchParams]
  );

  // Check if using default sort (AC#4)
  const isDefaultSort = useMemo(
    () => sortBy === DEFAULT_SORT.sortBy && sortOrder === DEFAULT_SORT.sortOrder,
    [sortBy, sortOrder]
  );

  /**
   * Update sort in URL (AC#5)
   * Resets to page 1 when sort changes (AC#7)
   */
  const setSort = useCallback(
    (newSortBy: string, newSortOrder: SortOrder) => {
      const params = new URLSearchParams(searchParams.toString());

      // If setting to default, remove from URL (clean URLs)
      if (newSortBy === DEFAULT_SORT.sortBy && newSortOrder === DEFAULT_SORT.sortOrder) {
        params.delete('sortBy');
        params.delete('sortOrder');
      } else {
        params.set('sortBy', newSortBy);
        params.set('sortOrder', newSortOrder);
      }

      // AC#7: Reset to page 1 when sort changes
      params.set('page', '1');

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Toggle sort for a column (AC#2)
   * - If clicking same column: toggle between asc/desc
   * - If clicking new column: use default order for that column
   *   - createdAt: defaults to desc (newest first)
   *   - others: defaults to asc (A-Z)
   */
  const toggleSort = useCallback(
    (columnId: string) => {
      // Validate column is sortable
      if (!VALID_SORT_COLUMNS.includes(columnId)) {
        return;
      }

      if (sortBy === columnId) {
        // Same column - toggle order
        const newOrder: SortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSort(columnId, newOrder);
      } else {
        // New column - use column's default order
        const defaultOrder: SortOrder = columnId === 'createdAt' ? 'desc' : 'asc';
        setSort(columnId, defaultOrder);
      }
    },
    [sortBy, sortOrder, setSort]
  );

  return { sortBy, sortOrder, setSort, toggleSort, isDefaultSort };
}
