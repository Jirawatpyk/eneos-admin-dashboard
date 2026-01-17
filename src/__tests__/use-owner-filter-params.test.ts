/**
 * useOwnerFilterParams Hook Tests
 * Story 4.5: Filter by Owner - AC#8
 *
 * Tests for:
 * - Reading owner from URL
 * - Updating URL when filter changes
 * - Page reset on filter change
 * - Preserving other params
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock Next.js navigation hooks
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/leads',
}));

// Import after mocking
import { useOwnerFilterParams } from '@/hooks/use-owner-filter-params';

describe('useOwnerFilterParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    mockSearchParams.delete('owner');
    mockSearchParams.delete('page');
    mockSearchParams.delete('status');
    mockSearchParams.delete('search');
  });

  describe('Reading from URL', () => {
    it('returns empty array when no owner param', () => {
      const { result } = renderHook(() => useOwnerFilterParams());

      expect(result.current.owners).toEqual([]);
      expect(result.current.hasOwnerFilter).toBe(false);
    });

    it('parses single owner from URL', () => {
      mockSearchParams.set('owner', 'user-1');

      const { result } = renderHook(() => useOwnerFilterParams());

      expect(result.current.owners).toEqual(['user-1']);
      expect(result.current.hasOwnerFilter).toBe(true);
    });

    it('parses multiple owners from URL (comma-separated)', () => {
      mockSearchParams.set('owner', 'user-1,user-2,user-3');

      const { result } = renderHook(() => useOwnerFilterParams());

      expect(result.current.owners).toEqual(['user-1', 'user-2', 'user-3']);
    });

    it('parses "unassigned" special value', () => {
      mockSearchParams.set('owner', 'unassigned');

      const { result } = renderHook(() => useOwnerFilterParams());

      expect(result.current.owners).toEqual(['unassigned']);
    });

    it('handles mixed unassigned and regular owners', () => {
      mockSearchParams.set('owner', 'unassigned,user-1');

      const { result } = renderHook(() => useOwnerFilterParams());

      expect(result.current.owners).toEqual(['unassigned', 'user-1']);
    });

    it('trims whitespace from owner IDs', () => {
      mockSearchParams.set('owner', ' user-1 , user-2 ');

      const { result } = renderHook(() => useOwnerFilterParams());

      expect(result.current.owners).toEqual(['user-1', 'user-2']);
    });
  });

  describe('Updating URL', () => {
    it('sets single owner in URL', () => {
      const { result } = renderHook(() => useOwnerFilterParams());

      act(() => {
        result.current.setOwners(['user-1']);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('owner=user-1'),
        { scroll: false }
      );
    });

    it('sets multiple owners as comma-separated', () => {
      const { result } = renderHook(() => useOwnerFilterParams());

      act(() => {
        result.current.setOwners(['user-1', 'user-2']);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('owner=user-1%2Cuser-2'),
        { scroll: false }
      );
    });

    it('removes owner param when empty array', () => {
      mockSearchParams.set('owner', 'user-1');

      const { result } = renderHook(() => useOwnerFilterParams());

      act(() => {
        result.current.setOwners([]);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.not.stringContaining('owner='),
        { scroll: false }
      );
    });

    it('resets page to 1 when filter changes', () => {
      mockSearchParams.set('page', '5');

      const { result } = renderHook(() => useOwnerFilterParams());

      act(() => {
        result.current.setOwners(['user-1']);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        { scroll: false }
      );
    });

    it('preserves other params (status, search, limit)', () => {
      mockSearchParams.set('status', 'new,claimed');
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('limit', '50');

      const { result } = renderHook(() => useOwnerFilterParams());

      act(() => {
        result.current.setOwners(['user-1']);
      });

      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).toContain('status=new%2Cclaimed');
      expect(calledUrl).toContain('search=test');
      expect(calledUrl).toContain('limit=50');
    });
  });

  describe('Clear Owners', () => {
    it('clears owner param', () => {
      mockSearchParams.set('owner', 'user-1,user-2');

      const { result } = renderHook(() => useOwnerFilterParams());

      act(() => {
        result.current.clearOwners();
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.not.stringContaining('owner='),
        { scroll: false }
      );
    });

    it('resets page to 1 when cleared', () => {
      mockSearchParams.set('owner', 'user-1');
      mockSearchParams.set('page', '3');

      const { result } = renderHook(() => useOwnerFilterParams());

      act(() => {
        result.current.clearOwners();
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        { scroll: false }
      );
    });
  });

  describe('hasOwnerFilter', () => {
    it('returns false when no owners selected', () => {
      const { result } = renderHook(() => useOwnerFilterParams());

      expect(result.current.hasOwnerFilter).toBe(false);
    });

    it('returns true when owners selected', () => {
      mockSearchParams.set('owner', 'user-1');

      const { result } = renderHook(() => useOwnerFilterParams());

      expect(result.current.hasOwnerFilter).toBe(true);
    });

    it('returns true for unassigned', () => {
      mockSearchParams.set('owner', 'unassigned');

      const { result } = renderHook(() => useOwnerFilterParams());

      expect(result.current.hasOwnerFilter).toBe(true);
    });
  });
});
