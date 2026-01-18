/**
 * Lead Selection Hook
 * Story 4.9: Bulk Select - AC#2, AC#6, AC#7, AC#9
 *
 * Features:
 * - AC#2: Toggle individual row selection
 * - AC#6: Selection persists across page changes (stored by row ID)
 * - AC#7: Clear selection when needed (external trigger for filter changes)
 * - AC#9: Exposes selectedIds for Story 4-10 (Quick Export)
 */
'use client';

import { useState, useCallback, useMemo } from 'react';

// ===========================================
// Types
// ===========================================

export interface UseLeadSelectionReturn {
  /** Set of selected row IDs */
  selectedIds: Set<number>;
  /** Number of selected rows */
  selectedCount: number;
  /** Check if a specific row is selected */
  isSelected: (rowId: number) => boolean;
  /** Toggle selection for a single row */
  toggleSelection: (rowId: number) => void;
  /** Select/deselect all visible rows (toggles based on current state) */
  selectAll: (rowIds: number[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Check if all visible rows are selected */
  isAllSelected: (visibleRowIds: number[]) => boolean;
  /** Check if some (but not all) visible rows are selected (for indeterminate state) */
  isSomeSelected: (visibleRowIds: number[]) => boolean;
}

// ===========================================
// Hook Implementation
// ===========================================

/**
 * Hook for managing lead selection state
 *
 * @returns Selection state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   selectedIds,
 *   selectedCount,
 *   isSelected,
 *   toggleSelection,
 *   selectAll,
 *   clearSelection,
 *   isAllSelected,
 *   isSomeSelected,
 * } = useLeadSelection();
 *
 * // Check if row 5 is selected
 * const isRow5Selected = isSelected(5);
 *
 * // Toggle selection for row 5
 * toggleSelection(5);
 *
 * // Select all visible rows
 * const visibleRowIds = leads.map(lead => lead.row);
 * selectAll(visibleRowIds);
 * ```
 */
export function useLeadSelection(): UseLeadSelectionReturn {
  // Store selected row IDs in a Set for O(1) lookup
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // AC#9: Expose selection count for export
  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  // AC#2: Check if a specific row is selected
  const isSelected = useCallback(
    (rowId: number) => selectedIds.has(rowId),
    [selectedIds]
  );

  // AC#2: Toggle selection for a single row
  const toggleSelection = useCallback((rowId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  // AC#3: Select/deselect all visible rows
  // If all visible rows are selected, deselect them
  // Otherwise, select all visible rows (preserving other selections)
  const selectAll = useCallback((rowIds: number[]) => {
    setSelectedIds((prev) => {
      const allSelected = rowIds.every((id) => prev.has(id));
      if (allSelected) {
        // Deselect all visible rows (keep selections from other pages)
        const next = new Set(prev);
        rowIds.forEach((id) => next.delete(id));
        return next;
      } else {
        // Select all visible rows (add to existing selections)
        const next = new Set(prev);
        rowIds.forEach((id) => next.add(id));
        return next;
      }
    });
  }, []);

  // AC#5, AC#7: Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // AC#3: Check if all visible rows are selected (for header checkbox checked state)
  const isAllSelected = useCallback(
    (visibleRowIds: number[]) => {
      if (visibleRowIds.length === 0) return false;
      return visibleRowIds.every((id) => selectedIds.has(id));
    },
    [selectedIds]
  );

  // AC#3: Check if some (but not all) visible rows are selected (for indeterminate state)
  const isSomeSelected = useCallback(
    (visibleRowIds: number[]) => {
      if (visibleRowIds.length === 0) return false;
      const selectedOnPage = visibleRowIds.filter((id) => selectedIds.has(id)).length;
      return selectedOnPage > 0 && selectedOnPage < visibleRowIds.length;
    },
    [selectedIds]
  );

  return {
    selectedIds,
    selectedCount,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected,
  };
}
