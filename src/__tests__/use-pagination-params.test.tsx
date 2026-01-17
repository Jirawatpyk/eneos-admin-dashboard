/**
 * usePaginationParams Hook Tests
 * Story 4.2: Pagination - AC#4
 *
 * Tests for URL state management hook
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/leads',
}));

import { usePaginationParams } from '@/hooks/use-pagination-params';

describe('usePaginationParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    mockSearchParams.delete('page');
    mockSearchParams.delete('limit');
  });

  describe('default values', () => {
    it('returns default page=1 when no URL param', () => {
      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.page).toBe(1);
    });

    it('returns default limit=20 when no URL param', () => {
      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.limit).toBe(20);
    });
  });

  describe('reading URL params (AC#4)', () => {
    it('reads page from URL', () => {
      mockSearchParams.set('page', '3');

      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.page).toBe(3);
    });

    it('reads limit from URL', () => {
      mockSearchParams.set('limit', '25');

      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.limit).toBe(25);
    });

    it('reads both page and limit from URL', () => {
      mockSearchParams.set('page', '5');
      mockSearchParams.set('limit', '50');

      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.page).toBe(5);
      expect(result.current.limit).toBe(50);
    });
  });

  describe('invalid URL params (AC#4)', () => {
    it('defaults to page=1 for invalid page', () => {
      mockSearchParams.set('page', 'invalid');

      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.page).toBe(1);
    });

    it('defaults to page=1 for negative page', () => {
      mockSearchParams.set('page', '-1');

      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.page).toBe(1);
    });

    it('defaults to page=1 for zero page', () => {
      mockSearchParams.set('page', '0');

      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.page).toBe(1);
    });

    it('defaults to limit=20 for invalid limit', () => {
      mockSearchParams.set('limit', '15'); // Not in valid options

      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.limit).toBe(20);
    });

    it('defaults to limit=20 for non-numeric limit', () => {
      mockSearchParams.set('limit', 'abc');

      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.limit).toBe(20);
    });
  });

  describe('setPage (AC#3)', () => {
    it('updates URL when page changes', () => {
      const { result } = renderHook(() => usePaginationParams());

      act(() => {
        result.current.setPage(2);
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?page=2', {
        scroll: false,
      });
    });

    it('preserves existing limit when changing page', () => {
      mockSearchParams.set('limit', '25');

      const { result } = renderHook(() => usePaginationParams());

      act(() => {
        result.current.setPage(3);
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?limit=25&page=3', {
        scroll: false,
      });
    });

    it('prevents negative page numbers', () => {
      const { result } = renderHook(() => usePaginationParams());

      act(() => {
        result.current.setPage(-1);
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?page=1', {
        scroll: false,
      });
    });
  });

  describe('setLimit (AC#2)', () => {
    it('updates URL when limit changes', () => {
      const { result } = renderHook(() => usePaginationParams());

      act(() => {
        result.current.setLimit(50);
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?limit=50&page=1', {
        scroll: false,
      });
    });

    it('resets to page 1 when limit changes', () => {
      mockSearchParams.set('page', '5');

      const { result } = renderHook(() => usePaginationParams());

      act(() => {
        result.current.setLimit(25);
      });

      // Should reset to page 1
      expect(mockReplace).toHaveBeenCalledWith('/leads?page=1&limit=25', {
        scroll: false,
      });
    });
  });

  describe('valid limit options (AC#2)', () => {
    it.each([10, 20, 25, 50])('accepts valid limit %d', (validLimit) => {
      mockSearchParams.set('limit', String(validLimit));

      const { result } = renderHook(() => usePaginationParams());

      expect(result.current.limit).toBe(validLimit);
    });
  });
});
