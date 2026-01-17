/**
 * Sort Params Hook Tests
 * Story 4.7: Sort Columns - AC#5
 *
 * Tests for URL-based sorting state management
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSortParams } from '@/hooks/use-sort-params';

// Mock next/navigation
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/leads',
}));

describe('useSortParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    mockSearchParams.delete('sortBy');
    mockSearchParams.delete('sortOrder');
  });

  describe('AC#4: Default Sort', () => {
    it('returns default sort (createdAt desc) when no URL params', () => {
      const { result } = renderHook(() => useSortParams());

      expect(result.current.sortBy).toBe('createdAt');
      expect(result.current.sortOrder).toBe('desc');
      expect(result.current.isDefaultSort).toBe(true);
    });
  });

  describe('AC#5: URL State Sync', () => {
    it('reads sortBy from URL', () => {
      mockSearchParams.set('sortBy', 'company');
      mockSearchParams.set('sortOrder', 'asc');

      const { result } = renderHook(() => useSortParams());

      expect(result.current.sortBy).toBe('company');
      expect(result.current.sortOrder).toBe('asc');
      expect(result.current.isDefaultSort).toBe(false);
    });

    it('updates URL when setSort is called', () => {
      const { result } = renderHook(() => useSortParams());

      act(() => {
        result.current.setSort('company', 'asc');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        '/leads?sortBy=company&sortOrder=asc&page=1',
        { scroll: false }
      );
    });

    it('removes URL params when setting to default sort', () => {
      mockSearchParams.set('sortBy', 'company');
      mockSearchParams.set('sortOrder', 'asc');

      const { result } = renderHook(() => useSortParams());

      act(() => {
        result.current.setSort('createdAt', 'desc');
      });

      // Should remove sortBy and sortOrder, keep page=1
      expect(mockReplace).toHaveBeenCalledWith(
        '/leads?page=1',
        { scroll: false }
      );
    });

    it('validates sortBy against allowed columns', () => {
      mockSearchParams.set('sortBy', 'invalidColumn');

      const { result } = renderHook(() => useSortParams());

      // Should fall back to default
      expect(result.current.sortBy).toBe('createdAt');
    });

    it('validates sortOrder (only asc/desc allowed)', () => {
      mockSearchParams.set('sortBy', 'company');
      mockSearchParams.set('sortOrder', 'invalid');

      const { result } = renderHook(() => useSortParams());

      // Should fall back to default
      expect(result.current.sortOrder).toBe('desc');
    });
  });

  describe('AC#2: Toggle Sort', () => {
    it('toggleSort switches from asc to desc for same column', () => {
      mockSearchParams.set('sortBy', 'company');
      mockSearchParams.set('sortOrder', 'asc');

      const { result } = renderHook(() => useSortParams());

      act(() => {
        result.current.toggleSort('company');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        '/leads?sortBy=company&sortOrder=desc&page=1',
        { scroll: false }
      );
    });

    it('toggleSort switches from desc to asc for same column', () => {
      mockSearchParams.set('sortBy', 'company');
      mockSearchParams.set('sortOrder', 'desc');

      const { result } = renderHook(() => useSortParams());

      act(() => {
        result.current.toggleSort('company');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        '/leads?sortBy=company&sortOrder=asc&page=1',
        { scroll: false }
      );
    });

    it('toggleSort defaults to asc for non-date columns', () => {
      mockSearchParams.set('sortBy', 'createdAt');
      mockSearchParams.set('sortOrder', 'desc');

      const { result } = renderHook(() => useSortParams());

      act(() => {
        result.current.toggleSort('company');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        '/leads?sortBy=company&sortOrder=asc&page=1',
        { scroll: false }
      );
    });

    it('toggleSort defaults to desc for createdAt column', () => {
      mockSearchParams.set('sortBy', 'company');
      mockSearchParams.set('sortOrder', 'asc');

      const { result } = renderHook(() => useSortParams());

      act(() => {
        result.current.toggleSort('createdAt');
      });

      // createdAt defaults to desc, and since it's the default, URL params are removed
      expect(mockReplace).toHaveBeenCalledWith(
        '/leads?page=1',
        { scroll: false }
      );
    });

    it('toggleSort ignores invalid column IDs', () => {
      const { result } = renderHook(() => useSortParams());

      act(() => {
        result.current.toggleSort('invalidColumn');
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('AC#7: Reset to Page 1', () => {
    it('resets to page 1 when sort changes', () => {
      mockSearchParams.set('page', '5');

      const { result } = renderHook(() => useSortParams());

      act(() => {
        result.current.setSort('company', 'asc');
      });

      // Should include page=1 in the URL
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
    });
  });

  describe('AC#6: Sort with Filters', () => {
    it('preserves existing filter params when changing sort', () => {
      mockSearchParams.set('status', 'new');
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('page', '3');

      const { result } = renderHook(() => useSortParams());

      act(() => {
        result.current.setSort('company', 'asc');
      });

      // Should preserve status and search, but reset page to 1
      // Note: URLSearchParams order may vary, so check for all required params
      const calledUrl = mockReplace.mock.calls[0][0] as string;
      expect(calledUrl).toContain('status=new');
      expect(calledUrl).toContain('search=test');
      expect(calledUrl).toContain('sortBy=company');
      expect(calledUrl).toContain('sortOrder=asc');
      expect(calledUrl).toContain('page=1');
      expect(mockReplace).toHaveBeenCalledWith(
        expect.any(String),
        { scroll: false }
      );
    });
  });
});
