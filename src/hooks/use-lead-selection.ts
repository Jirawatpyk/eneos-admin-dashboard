/**
 * Lead Selection Hook
 * Story 4.9: Bulk Select - AC#2, AC#6, AC#7, AC#9
 *
 * Features:
 * - AC#2: Toggle individual row selection
 * - AC#6: Selection persists across page changes (stored by lead UUID)
 * - AC#7: Clear selection when needed (external trigger for filter changes)
 * - AC#9: Exposes selectedIds for Story 4-10 (Quick Export)
 */
'use client';

import { useState, useCallback, useMemo } from 'react';

// ===========================================
// Types
// ===========================================

export interface UseLeadSelectionReturn {
  /** Set of selected lead UUIDs */
  selectedIds: Set<string>;
  /** Number of selected rows */
  selectedCount: number;
  /** Check if a specific lead is selected */
  isSelected: (id: string) => boolean;
  /** Toggle selection for a single lead */
  toggleSelection: (id: string) => void;
  /** Select/deselect all visible leads (toggles based on current state) */
  selectAll: (ids: string[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Check if all visible leads are selected */
  isAllSelected: (visibleIds: string[]) => boolean;
  /** Check if some (but not all) visible leads are selected (for indeterminate state) */
  isSomeSelected: (visibleIds: string[]) => boolean;
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
 * // Check if lead is selected
 * const isLeadSelected = isSelected('uuid-123');
 *
 * // Toggle selection
 * toggleSelection('uuid-123');
 *
 * // Select all visible leads
 * const visibleIds = leads.map(lead => lead.leadUuid);
 * selectAll(visibleIds);
 * ```
 */
export function useLeadSelection(): UseLeadSelectionReturn {
  // Store selected lead UUIDs in a Set for O(1) lookup
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // AC#9: Expose selection count for export
  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  // AC#2: Check if a specific lead is selected
  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  // AC#2: Toggle selection for a single lead
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // AC#3: Select/deselect all visible leads
  // If all visible leads are selected, deselect them
  // Otherwise, select all visible leads (preserving other selections)
  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      if (allSelected) {
        // Deselect all visible leads (keep selections from other pages)
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      } else {
        // Select all visible leads (add to existing selections)
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      }
    });
  }, []);

  // AC#5, AC#7: Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // AC#3: Check if all visible leads are selected (for header checkbox checked state)
  const isAllSelected = useCallback(
    (visibleIds: string[]) => {
      if (visibleIds.length === 0) return false;
      return visibleIds.every((id) => selectedIds.has(id));
    },
    [selectedIds]
  );

  // AC#3: Check if some (but not all) visible leads are selected (for indeterminate state)
  const isSomeSelected = useCallback(
    (visibleIds: string[]) => {
      if (visibleIds.length === 0) return false;
      const selectedOnPage = visibleIds.filter((id) => selectedIds.has(id)).length;
      return selectedOnPage > 0 && selectedOnPage < visibleIds.length;
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
