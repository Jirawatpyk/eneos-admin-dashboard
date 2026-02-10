/**
 * Lead Selection Hook Tests
 * Story 4.9: Bulk Select - AC#2, AC#3, AC#5, AC#6, AC#9
 *
 * Tests:
 * - AC#2: Toggle individual row selection
 * - AC#3: Select all / deselect all with indeterminate detection
 * - AC#5: Clear selection
 * - AC#6: Selection persists across page changes (by lead UUID)
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

    it('isSelected returns false for any lead initially', () => {
      const { result } = renderHook(() => useLeadSelection());

      expect(result.current.isSelected('uuid-1')).toBe(false);
      expect(result.current.isSelected('uuid-100')).toBe(false);
    });

    it('isAllSelected returns false for empty visible ids', () => {
      const { result } = renderHook(() => useLeadSelection());

      expect(result.current.isAllSelected([])).toBe(false);
    });

    it('isSomeSelected returns false for empty visible ids', () => {
      const { result } = renderHook(() => useLeadSelection());

      expect(result.current.isSomeSelected([])).toBe(false);
    });
  });

  // AC#2: Toggle individual row selection
  describe('toggleSelection', () => {
    it('selects a lead when not selected', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection('uuid-5');
      });

      expect(result.current.isSelected('uuid-5')).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it('deselects a lead when already selected', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection('uuid-5');
      });
      expect(result.current.isSelected('uuid-5')).toBe(true);

      act(() => {
        result.current.toggleSelection('uuid-5');
      });
      expect(result.current.isSelected('uuid-5')).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });

    it('can select multiple leads', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection('uuid-1');
        result.current.toggleSelection('uuid-2');
        result.current.toggleSelection('uuid-3');
      });

      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isSelected('uuid-1')).toBe(true);
      expect(result.current.isSelected('uuid-2')).toBe(true);
      expect(result.current.isSelected('uuid-3')).toBe(true);
    });

    it('toggling one lead does not affect others', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection('uuid-1');
        result.current.toggleSelection('uuid-2');
      });

      act(() => {
        result.current.toggleSelection('uuid-1');
      });

      expect(result.current.isSelected('uuid-1')).toBe(false);
      expect(result.current.isSelected('uuid-2')).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });
  });

  // AC#3: Select all / deselect all
  describe('selectAll', () => {
    it('selects all visible leads when none are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleIds = ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5'];

      act(() => {
        result.current.selectAll(visibleIds);
      });

      expect(result.current.selectedCount).toBe(5);
      visibleIds.forEach((id) => {
        expect(result.current.isSelected(id)).toBe(true);
      });
    });

    it('deselects all visible leads when all are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleIds = ['uuid-1', 'uuid-2', 'uuid-3'];

      // First, select all
      act(() => {
        result.current.selectAll(visibleIds);
      });
      expect(result.current.selectedCount).toBe(3);

      // Then, deselect all
      act(() => {
        result.current.selectAll(visibleIds);
      });
      expect(result.current.selectedCount).toBe(0);
    });

    it('selects remaining leads when some are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleIds = ['uuid-1', 'uuid-2', 'uuid-3'];

      // Select one lead first
      act(() => {
        result.current.toggleSelection('uuid-1');
      });
      expect(result.current.selectedCount).toBe(1);

      // Select all - should select the remaining leads
      act(() => {
        result.current.selectAll(visibleIds);
      });
      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isSelected('uuid-1')).toBe(true);
      expect(result.current.isSelected('uuid-2')).toBe(true);
      expect(result.current.isSelected('uuid-3')).toBe(true);
    });

    // AC#6: Selection persists across pages
    it('preserves selections from other pages when selecting all', () => {
      const { result } = renderHook(() => useLeadSelection());

      // Select leads from "page 1"
      act(() => {
        result.current.toggleSelection('uuid-1');
        result.current.toggleSelection('uuid-2');
      });

      // Select all leads on "page 2"
      const page2Ids = ['uuid-6', 'uuid-7', 'uuid-8', 'uuid-9', 'uuid-10'];
      act(() => {
        result.current.selectAll(page2Ids);
      });

      // Original selections should be preserved
      expect(result.current.isSelected('uuid-1')).toBe(true);
      expect(result.current.isSelected('uuid-2')).toBe(true);
      expect(result.current.selectedCount).toBe(7); // 2 from page 1 + 5 from page 2
    });

    it('only deselects visible leads when deselecting all', () => {
      const { result } = renderHook(() => useLeadSelection());

      // Select leads from both pages
      const page1Ids = ['uuid-1', 'uuid-2', 'uuid-3'];
      const page2Ids = ['uuid-6', 'uuid-7', 'uuid-8'];
      act(() => {
        result.current.selectAll(page1Ids);
        result.current.selectAll(page2Ids);
      });
      expect(result.current.selectedCount).toBe(6);

      // Deselect all on page 1
      act(() => {
        result.current.selectAll(page1Ids);
      });

      // Page 1 deselected, page 2 still selected
      expect(result.current.isSelected('uuid-1')).toBe(false);
      expect(result.current.isSelected('uuid-6')).toBe(true);
      expect(result.current.selectedCount).toBe(3);
    });
  });

  // AC#5: Clear selection
  describe('clearSelection', () => {
    it('clears all selections', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection('uuid-1');
        result.current.toggleSelection('uuid-5');
        result.current.toggleSelection('uuid-10');
      });
      expect(result.current.selectedCount).toBe(3);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isSelected('uuid-1')).toBe(false);
      expect(result.current.isSelected('uuid-5')).toBe(false);
      expect(result.current.isSelected('uuid-10')).toBe(false);
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
    it('returns true when all visible leads are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleIds = ['uuid-1', 'uuid-2', 'uuid-3'];

      act(() => {
        result.current.selectAll(visibleIds);
      });

      expect(result.current.isAllSelected(visibleIds)).toBe(true);
    });

    it('returns false when some visible leads are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleIds = ['uuid-1', 'uuid-2', 'uuid-3'];

      act(() => {
        result.current.toggleSelection('uuid-1');
      });

      expect(result.current.isAllSelected(visibleIds)).toBe(false);
    });

    it('returns false when no visible leads are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleIds = ['uuid-1', 'uuid-2', 'uuid-3'];

      expect(result.current.isAllSelected(visibleIds)).toBe(false);
    });
  });

  describe('isSomeSelected', () => {
    it('returns true when some (but not all) visible leads are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleIds = ['uuid-1', 'uuid-2', 'uuid-3'];

      act(() => {
        result.current.toggleSelection('uuid-1');
      });

      expect(result.current.isSomeSelected(visibleIds)).toBe(true);
    });

    it('returns false when all visible leads are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleIds = ['uuid-1', 'uuid-2', 'uuid-3'];

      act(() => {
        result.current.selectAll(visibleIds);
      });

      expect(result.current.isSomeSelected(visibleIds)).toBe(false);
    });

    it('returns false when no visible leads are selected', () => {
      const { result } = renderHook(() => useLeadSelection());
      const visibleIds = ['uuid-1', 'uuid-2', 'uuid-3'];

      expect(result.current.isSomeSelected(visibleIds)).toBe(false);
    });

    it('returns true for indeterminate state (selections from other pages)', () => {
      const { result } = renderHook(() => useLeadSelection());

      // Select lead from another page
      act(() => {
        result.current.toggleSelection('uuid-10');
      });

      // Current page has leads uuid-1, uuid-2, uuid-3 - none selected
      const visibleIds = ['uuid-1', 'uuid-2', 'uuid-3'];

      // isSomeSelected should be false because none of the VISIBLE leads are selected
      expect(result.current.isSomeSelected(visibleIds)).toBe(false);

      // Now select one visible lead
      act(() => {
        result.current.toggleSelection('uuid-1');
      });

      // Now isSomeSelected should be true
      expect(result.current.isSomeSelected(visibleIds)).toBe(true);
    });
  });

  // AC#9: Expose selectedIds for export
  describe('selectedIds (for export)', () => {
    it('selectedIds contains all selected lead UUIDs', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection('uuid-5');
        result.current.toggleSelection('uuid-10');
        result.current.toggleSelection('uuid-15');
      });

      const selectedArray = Array.from(result.current.selectedIds);
      expect(selectedArray).toContain('uuid-5');
      expect(selectedArray).toContain('uuid-10');
      expect(selectedArray).toContain('uuid-15');
      expect(selectedArray.length).toBe(3);
    });

    it('selectedIds is empty after clearSelection', () => {
      const { result } = renderHook(() => useLeadSelection());

      act(() => {
        result.current.toggleSelection('uuid-1');
        result.current.toggleSelection('uuid-2');
      });

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedIds.size).toBe(0);
    });
  });
});
