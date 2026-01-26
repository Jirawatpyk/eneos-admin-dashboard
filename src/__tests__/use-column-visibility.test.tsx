/**
 * Column Visibility Hook Tests
 * Technical Debt: Table Column Toggle Feature
 *
 * Tests:
 * - Initial state with all columns visible
 * - Toggle column visibility
 * - Reset column visibility
 * - Check if column is visible
 * - Hidden column count
 * - localStorage persistence
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useColumnVisibility, COLUMN_DEFINITIONS, TOGGLEABLE_COLUMNS } from '@/hooks/use-column-visibility';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useColumnVisibility', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('COLUMN_DEFINITIONS', () => {
    it('has all expected columns', () => {
      expect(COLUMN_DEFINITIONS.company).toBe('Company');
      expect(COLUMN_DEFINITIONS.capital).toBe('Capital'); // Story 4.15
      expect(COLUMN_DEFINITIONS.location).toBe('Location'); // Story 4.15
      expect(COLUMN_DEFINITIONS.customerName).toBe('Contact');
      expect(COLUMN_DEFINITIONS.email).toBe('Email');
      expect(COLUMN_DEFINITIONS.phone).toBe('Phone');
      expect(COLUMN_DEFINITIONS.status).toBe('Status');
      expect(COLUMN_DEFINITIONS.salesOwnerName).toBe('Owner');
      expect(COLUMN_DEFINITIONS.createdAt).toBe('Date');
    });

    it('TOGGLEABLE_COLUMNS contains all column keys', () => {
      expect(TOGGLEABLE_COLUMNS).toContain('company');
      expect(TOGGLEABLE_COLUMNS).toContain('capital'); // Story 4.15
      expect(TOGGLEABLE_COLUMNS).toContain('location'); // Story 4.15
      expect(TOGGLEABLE_COLUMNS).toContain('customerName');
      expect(TOGGLEABLE_COLUMNS).toContain('email');
      expect(TOGGLEABLE_COLUMNS).toContain('phone');
      expect(TOGGLEABLE_COLUMNS).toContain('status');
      expect(TOGGLEABLE_COLUMNS).toContain('salesOwnerName');
      expect(TOGGLEABLE_COLUMNS).toContain('createdAt');
    });
  });

  describe('initial state', () => {
    it('returns all columns visible by default', () => {
      const { result } = renderHook(() => useColumnVisibility());

      expect(result.current.isColumnVisible('company')).toBe(true);
      expect(result.current.isColumnVisible('email')).toBe(true);
      expect(result.current.isColumnVisible('status')).toBe(true);
    });

    it('returns zero hidden columns initially', () => {
      const { result } = renderHook(() => useColumnVisibility());

      expect(result.current.hiddenColumnCount).toBe(0);
    });

    it('returns columnVisibility object with all columns true', () => {
      const { result } = renderHook(() => useColumnVisibility());

      expect(result.current.columnVisibility.company).toBe(true);
      expect(result.current.columnVisibility.email).toBe(true);
      expect(result.current.columnVisibility.status).toBe(true);
    });
  });

  describe('toggleColumnVisibility', () => {
    it('hides a column when toggled', () => {
      const { result } = renderHook(() => useColumnVisibility());

      act(() => {
        result.current.toggleColumnVisibility('email');
      });

      expect(result.current.isColumnVisible('email')).toBe(false);
      expect(result.current.hiddenColumnCount).toBe(1);
    });

    it('shows a column when toggled again', () => {
      const { result } = renderHook(() => useColumnVisibility());

      act(() => {
        result.current.toggleColumnVisibility('email');
      });
      expect(result.current.isColumnVisible('email')).toBe(false);

      act(() => {
        result.current.toggleColumnVisibility('email');
      });
      expect(result.current.isColumnVisible('email')).toBe(true);
      expect(result.current.hiddenColumnCount).toBe(0);
    });

    it('can hide multiple columns', () => {
      const { result } = renderHook(() => useColumnVisibility());

      act(() => {
        result.current.toggleColumnVisibility('email');
        result.current.toggleColumnVisibility('phone');
        result.current.toggleColumnVisibility('capital'); // Story 4.15
      });

      expect(result.current.isColumnVisible('email')).toBe(false);
      expect(result.current.isColumnVisible('phone')).toBe(false);
      expect(result.current.isColumnVisible('capital')).toBe(false);
      expect(result.current.hiddenColumnCount).toBe(3);
    });

    it('persists to localStorage', () => {
      const { result } = renderHook(() => useColumnVisibility());

      act(() => {
        result.current.toggleColumnVisibility('email');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lead-table-column-visibility',
        expect.any(String)
      );
    });
  });

  describe('setColumnVisibility', () => {
    it('sets a column to hidden', () => {
      const { result } = renderHook(() => useColumnVisibility());

      act(() => {
        result.current.setColumnVisibility('email', false);
      });

      expect(result.current.isColumnVisible('email')).toBe(false);
    });

    it('sets a column to visible', () => {
      const { result } = renderHook(() => useColumnVisibility());

      // First hide it
      act(() => {
        result.current.setColumnVisibility('email', false);
      });

      // Then show it
      act(() => {
        result.current.setColumnVisibility('email', true);
      });

      expect(result.current.isColumnVisible('email')).toBe(true);
    });
  });

  describe('resetColumnVisibility', () => {
    it('resets all columns to visible', () => {
      const { result } = renderHook(() => useColumnVisibility());

      // Hide some columns
      act(() => {
        result.current.toggleColumnVisibility('email');
        result.current.toggleColumnVisibility('phone');
        result.current.toggleColumnVisibility('status');
      });
      expect(result.current.hiddenColumnCount).toBe(3);

      // Reset
      act(() => {
        result.current.resetColumnVisibility();
      });

      expect(result.current.hiddenColumnCount).toBe(0);
      expect(result.current.isColumnVisible('email')).toBe(true);
      expect(result.current.isColumnVisible('phone')).toBe(true);
      expect(result.current.isColumnVisible('status')).toBe(true);
    });

    it('persists reset to localStorage', () => {
      const { result } = renderHook(() => useColumnVisibility());

      act(() => {
        result.current.toggleColumnVisibility('email');
      });

      vi.clearAllMocks();

      act(() => {
        result.current.resetColumnVisibility();
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('getVisibilityState', () => {
    it('returns current visibility state', () => {
      const { result } = renderHook(() => useColumnVisibility());

      act(() => {
        result.current.toggleColumnVisibility('email');
      });

      const state = result.current.getVisibilityState();
      expect(state.email).toBe(false);
      expect(state.company).toBe(true);
    });
  });

  describe('isColumnVisible', () => {
    it('returns true for visible columns', () => {
      const { result } = renderHook(() => useColumnVisibility());

      expect(result.current.isColumnVisible('company')).toBe(true);
    });

    it('returns false for hidden columns', () => {
      const { result } = renderHook(() => useColumnVisibility());

      act(() => {
        result.current.toggleColumnVisibility('company');
      });

      expect(result.current.isColumnVisible('company')).toBe(false);
    });

    it('returns true for unknown columns (defensive)', () => {
      const { result } = renderHook(() => useColumnVisibility());

      // Unknown columns should default to visible
      expect(result.current.isColumnVisible('unknownColumn')).toBe(true);
    });
  });

  describe('hiddenColumnCount', () => {
    it('correctly counts hidden columns', () => {
      const { result } = renderHook(() => useColumnVisibility());

      expect(result.current.hiddenColumnCount).toBe(0);

      act(() => {
        result.current.toggleColumnVisibility('email');
      });
      expect(result.current.hiddenColumnCount).toBe(1);

      act(() => {
        result.current.toggleColumnVisibility('phone');
      });
      expect(result.current.hiddenColumnCount).toBe(2);

      act(() => {
        result.current.toggleColumnVisibility('email');
      });
      expect(result.current.hiddenColumnCount).toBe(1);
    });
  });

  describe('localStorage persistence', () => {
    it('loads saved visibility from localStorage on mount', () => {
      // Set up localStorage with some hidden columns
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({ email: false, phone: false })
      );

      renderHook(() => useColumnVisibility());

      // Wait for useEffect
      expect(localStorageMock.getItem).toHaveBeenCalledWith('lead-table-column-visibility');
    });

    it('handles invalid JSON in localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      // Should not throw
      const { result } = renderHook(() => useColumnVisibility());

      // Should still have default visibility
      expect(result.current.isColumnVisible('email')).toBe(true);
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      // Should not throw
      const { result } = renderHook(() => useColumnVisibility());

      // Should still have default visibility
      expect(result.current.isColumnVisible('email')).toBe(true);
    });
  });
});
