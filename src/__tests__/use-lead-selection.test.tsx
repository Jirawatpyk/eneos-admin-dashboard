/**
 * Lead Selection Hook Tests
 * Story 4.9: Bulk Select - AC#2, AC#3, AC#5, AC#6, AC#9
 *
 * Tests:
 * - AC#2: Toggle individual row selection
 * - AC#3: Select all / deselect all with indeterminate detection
 * - AC#5: Clear selection
 * - AC#6: Selection persists across page changes (by row ID)
 * - AC#9: Expose selectedIds for export
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLeadSelection } from '@/hooks/use-lead-selection';

describe('useLeadSelection', () => {
  // Initial state
  describe('initial state', () => {
    it('returns empty selection initially', () => {
      const { result } = renderHook(() => useLeadSelection());

      expect(result.current.selectedIds.size).toBe(0);
      expect(result.current.selectedCount).toBe(0);
    });

    it('isSelected returns false for any row initially', () => {
      const { result } = renderHook(() => useLeadSelection());

      expect(result.current.isSelected(1)).toBe(false);
      expect(result.current.isSelected(100)).toBe(false);
    });

    it('isAllSelected returns false for empty visible rows', () => {
      const { result } = renderHook(() => useLeadSelection());

      expect(result.current.isAllSelected([])).toBe(false);
    });

    it('isSomeSelected returns false for empty visible rows', () => {
      const { result } = renderHook(() => useLeadSelection());

      expect(result.current.isSomeSelected([])).toBe(false);
    });
  });

  // AC#2: Toggle individual row selection
  describe('toggleSelection', () => {
    it('selects a row when not selected', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection(5);
      });

      expect(result.current.isSelected(5)).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it('deselects a row when already selected', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection(5);
      });
      expect(result.current.isSelected(5)).toBe(true);

      act(() => {
        result.current.toggleSelection(5);
      });
      expect(result.current.isSelected(5)).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });

    it('can select multiple rows', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection(1);
        result.current.toggleSelection(2);
        result.current.toggleSelection(3);
      });

      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isSelected(1)).toBe(true);
      expect(result.current.isSelected(2)).toBe(true);
      expect(result.current.isSelected(3)).toBe(true);
    });

    it('toggling one row does not affect others', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection(1);
        result.current.toggleSelection(2);
      });

      act(() => {
        result.current.toggleSelection(1);
      });

      expect(result.current.isSelected(1)).toBe(false);
      expect(result.current.isSelected(2)).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });
  });

  // AC#3: Select all / deselect all
  describe('selectAll', () => {
    it('selects all visible rows when none are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleRowIds = [1, 2, 3, 4, 5];

      act(() => {
        result.current.selectAll(visibleRowIds);
      });

      expect(result.current.selectedCount).toBe(5);
      visibleRowIds.forEach((id) => {
        expect(result.current.isSelected(id)).toBe(true);
      });
    });

    it('deselects all visible rows when all are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleRowIds = [1, 2, 3];

      // First, select all
      act(() => {
        result.current.selectAll(visibleRowIds);
      });
      expect(result.current.selectedCount).toBe(3);

      // Then, deselect all
      act(() => {
        result.current.selectAll(visibleRowIds);
      });
      expect(result.current.selectedCount).toBe(0);
    });

    it('selects remaining rows when some are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleRowIds = [1, 2, 3];

      // Select one row first
      act(() => {
        result.current.toggleSelection(1);
      });
      expect(result.current.selectedCount).toBe(1);

      // Select all - should select the remaining rows
      act(() => {
        result.current.selectAll(visibleRowIds);
      });
      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isSelected(1)).toBe(true);
      expect(result.current.isSelected(2)).toBe(true);
      expect(result.current.isSelected(3)).toBe(true);
    });

    // AC#6: Selection persists across pages
    it('preserves selections from other pages when selecting all', () => {
      const { result } = renderHook(() => useLeadSelection());

      // Select rows from "page 1" (rows 1-5)
      act(() => {
        result.current.toggleSelection(1);
        result.current.toggleSelection(2);
      });

      // Select all rows on "page 2" (rows 6-10)
      const page2RowIds = [6, 7, 8, 9, 10];
      act(() => {
        result.current.selectAll(page2RowIds);
      });

      // Original selections should be preserved
      expect(result.current.isSelected(1)).toBe(true);
      expect(result.current.isSelected(2)).toBe(true);
      expect(result.current.selectedCount).toBe(7); // 2 from page 1 + 5 from page 2
    });

    it('only deselects visible rows when deselecting all', () => {
      const { result } = renderHook(() => useLeadSelection());

      // Select rows from both pages
      const page1RowIds = [1, 2, 3];
      const page2RowIds = [6, 7, 8];
      act(() => {
        result.current.selectAll(page1RowIds);
        result.current.selectAll(page2RowIds);
      });
      expect(result.current.selectedCount).toBe(6);

      // Deselect all on page 1
      act(() => {
        result.current.selectAll(page1RowIds);
      });

      // Page 1 deselected, page 2 still selected
      expect(result.current.isSelected(1)).toBe(false);
      expect(result.current.isSelected(6)).toBe(true);
      expect(result.current.selectedCount).toBe(3);
    });
  });

  // AC#5: Clear selection
  describe('clearSelection', () => {
    it('clears all selections', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection(1);
        result.current.toggleSelection(5);
        result.current.toggleSelection(10);
      });
      expect(result.current.selectedCount).toBe(3);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isSelected(1)).toBe(false);
      expect(result.current.isSelected(5)).toBe(false);
      expect(result.current.isSelected(10)).toBe(false);
    });

    it('clearSelection is idempotent', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.clearSelection();
        result.current.clearSelection();
      });

      expect(result.current.selectedCount).toBe(0);
    });
  });

  // AC#3: isAllSelected and isSomeSelected for indeterminate state
  describe('isAllSelected', () => {
    it('returns true when all visible rows are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleRowIds = [1, 2, 3];

      act(() => {
        result.current.selectAll(visibleRowIds);
      });

      expect(result.current.isAllSelected(visibleRowIds)).toBe(true);
    });

    it('returns false when some visible rows are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleRowIds = [1, 2, 3];

      act(() => {
        result.current.toggleSelection(1);
      });

      expect(result.current.isAllSelected(visibleRowIds)).toBe(false);
    });

    it('returns false when no visible rows are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleRowIds = [1, 2, 3];

      expect(result.current.isAllSelected(visibleRowIds)).toBe(false);
    });
  });

  describe('isSomeSelected', () => {
    it('returns true when some (but not all) visible rows are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleRowIds = [1, 2, 3];

      act(() => {
        result.current.toggleSelection(1);
      });

      expect(result.current.isSomeSelected(visibleRowIds)).toBe(true);
    });

    it('returns false when all visible rows are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleRowIds = [1, 2, 3];

      act(() => {
        result.current.selectAll(visibleRowIds);
      });

      expect(result.current.isSomeSelected(visibleRowIds)).toBe(false);
    });

    it('returns false when no visible rows are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleRowIds = [1, 2, 3];

      expect(result.current.isSomeSelected(visibleRowIds)).toBe(false);
    });

    it('returns true for indeterminate state (selections from other pages)', () => {
      const { result } = renderHook(() => useLeadSelection());

      // Select row 10 (from another page)
      act(() => {
        result.current.toggleSelection(10);
      });

      // Current page has rows 1, 2, 3 - none selected
      const visibleRowIds = [1, 2, 3];

      // isSomeSelected should be false because none of the VISIBLE rows are selected
      expect(result.current.isSomeSelected(visibleRowIds)).toBe(false);

      // Now select one visible row
      act(() => {
        result.current.toggleSelection(1);
      });

      // Now isSomeSelected should be true
      expect(result.current.isSomeSelected(visibleRowIds)).toBe(true);
    });
  });

  // AC#9: Expose selectedIds for export
  describe('selectedIds (for export)', () => {
    it('selectedIds contains all selected row IDs', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection(5);
        result.current.toggleSelection(10);
        result.current.toggleSelection(15);
      });

      const selectedArray = Array.from(result.current.selectedIds);
      expect(selectedArray).toContain(5);
      expect(selectedArray).toContain(10);
      expect(selectedArray).toContain(15);
      expect(selectedArray.length).toBe(3);
    });

    it('selectedIds is empty after clearSelection', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection(1);
        result.current.toggleSelection(2);
      });

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedIds.size).toBe(0);
    });
  });
});
