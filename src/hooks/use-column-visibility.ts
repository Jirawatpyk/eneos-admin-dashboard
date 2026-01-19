/**
 * Column Visibility Hook
 * Technical Debt: Table Column Toggle Feature
 *
 * Manages column visibility state with localStorage persistence.
 * Integrates with TanStack Table's column visibility API.
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { VisibilityState } from '@tanstack/react-table';

const STORAGE_KEY = 'lead-table-column-visibility';

/**
 * Default column visibility
 * All columns visible by default
 */
const DEFAULT_VISIBILITY: VisibilityState = {
  select: true,
  company: true,
  customerName: true,
  email: true,
  phone: true,
  status: true,
  salesOwnerName: true,
  campaignName: true,
  createdAt: true,
};

/**
 * Column definitions for the visibility toggle
 * Maps column IDs to display labels
 */
export const COLUMN_DEFINITIONS: Record<string, string> = {
  company: 'Company',
  customerName: 'Contact',
  email: 'Email',
  phone: 'Phone',
  status: 'Status',
  salesOwnerName: 'Owner',
  campaignName: 'Campaign',
  createdAt: 'Date',
};

/**
 * Columns that can be toggled (excludes select column)
 */
export const TOGGLEABLE_COLUMNS = Object.keys(COLUMN_DEFINITIONS);

interface UseColumnVisibilityReturn {
  /** Current visibility state */
  columnVisibility: VisibilityState;
  /** Update visibility for a specific column */
  setColumnVisibility: (columnId: string, visible: boolean) => void;
  /** Toggle visibility for a specific column */
  toggleColumnVisibility: (columnId: string) => void;
  /** Reset all columns to visible */
  resetColumnVisibility: () => void;
  /** Get the full visibility state (for TanStack Table) */
  getVisibilityState: () => VisibilityState;
  /** Check if a column is visible */
  isColumnVisible: (columnId: string) => boolean;
  /** Count of hidden columns */
  hiddenColumnCount: number;
}

/**
 * Hook for managing column visibility with localStorage persistence
 *
 * @example
 * ```tsx
 * const {
 *   columnVisibility,
 *   toggleColumnVisibility,
 *   isColumnVisible,
 * } = useColumnVisibility();
 *
 * // Use with TanStack Table
 * const table = useReactTable({
 *   columnVisibility,
 *   onColumnVisibilityChange: (updater) => {
 *     // Handle updates
 *   },
 * });
 * ```
 */
export function useColumnVisibility(): UseColumnVisibilityReturn {
  const [columnVisibility, setColumnVisibilityState] = useState<VisibilityState>(
    DEFAULT_VISIBILITY
  );

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as VisibilityState;
        // Merge with defaults to handle new columns
        setColumnVisibilityState({
          ...DEFAULT_VISIBILITY,
          ...parsed,
        });
      }
    } catch (error) {
      console.warn('Failed to load column visibility from localStorage:', error);
    }
  }, []);

  // Persist to localStorage when visibility changes
  const persistVisibility = useCallback((visibility: VisibilityState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
    } catch (error) {
      console.warn('Failed to save column visibility to localStorage:', error);
    }
  }, []);

  const setColumnVisibility = useCallback(
    (columnId: string, visible: boolean) => {
      setColumnVisibilityState((prev) => {
        const updated = { ...prev, [columnId]: visible };
        persistVisibility(updated);
        return updated;
      });
    },
    [persistVisibility]
  );

  const toggleColumnVisibility = useCallback(
    (columnId: string) => {
      setColumnVisibilityState((prev) => {
        const updated = { ...prev, [columnId]: !prev[columnId] };
        persistVisibility(updated);
        return updated;
      });
    },
    [persistVisibility]
  );

  const resetColumnVisibility = useCallback(() => {
    setColumnVisibilityState(DEFAULT_VISIBILITY);
    persistVisibility(DEFAULT_VISIBILITY);
  }, [persistVisibility]);

  const getVisibilityState = useCallback(() => {
    return columnVisibility;
  }, [columnVisibility]);

  const isColumnVisible = useCallback(
    (columnId: string) => {
      return columnVisibility[columnId] !== false;
    },
    [columnVisibility]
  );

  const hiddenColumnCount = TOGGLEABLE_COLUMNS.filter(
    (col) => !isColumnVisible(col)
  ).length;

  return {
    columnVisibility,
    setColumnVisibility,
    toggleColumnVisibility,
    resetColumnVisibility,
    getVisibilityState,
    isColumnVisible,
    hiddenColumnCount,
  };
}
