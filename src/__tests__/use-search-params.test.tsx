/**
 * Search URL State Hook Tests
 * Story 4.3: Search - AC#7
 *
 * Tests for URL state synchronization
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * Helper to create mock ReadonlyURLSearchParams
 * Note: ReadonlyURLSearchParams is a subset of URLSearchParams,
 * so this cast is safe for read-only operations in tests
 */
const createMockSearchParams = (init?: string): ReadonlyURLSearchParams => {
  const params = new URLSearchParams(init);
  // URLSearchParams implements all ReadonlyURLSearchParams methods
  // This cast is intentional for testing purposes only
  return params as ReadonlyURLSearchParams;
};

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => createMockSearchParams()),
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  usePathname: () => '/leads',
}));

// Import after mock
import { useLeadSearchParams } from '@/hooks/use-search-params';
import { useSearchParams } from 'next/navigation';

describe('useLeadSearchParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // AC#7: URL State Sync
  // ==========================================================================
  describe('AC#7: URL State Sync', () => {
    it('returns empty string when no search param in URL', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());

      const { result } = renderHook(() => useLeadSearchParams());

      expect(result.current.search).toBe('');
    });

    it('reads search value from URL', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams('search=ENEOS')
      );

      const { result } = renderHook(() => useLeadSearchParams());

      expect(result.current.search).toBe('ENEOS');
    });

    it('reads search with spaces from URL', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams('search=test%20company')
      );

      const { result } = renderHook(() => useLeadSearchParams());

      expect(result.current.search).toBe('test company');
    });
  });

  // ==========================================================================
  // AC#3, AC#7: Update URL when search changes
  // ==========================================================================
  describe('AC#3, AC#7: setSearch', () => {
    it('updates URL with search parameter', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());

      const { result } = renderHook(() => useLeadSearchParams());

      act(() => {
        result.current.setSearch('ENEOS');
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?search=ENEOS&page=1', {
        scroll: false,
      });
    });

    it('trims whitespace from search', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());

      const { result } = renderHook(() => useLeadSearchParams());

      act(() => {
        result.current.setSearch('  ENEOS  ');
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?search=ENEOS&page=1', {
        scroll: false,
      });
    });

    it('removes search param when empty string', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams('search=ENEOS&page=2')
      );

      const { result } = renderHook(() => useLeadSearchParams());

      act(() => {
        result.current.setSearch('');
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?page=1', {
        scroll: false,
      });
    });

    it('removes search param when only whitespace', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams('search=ENEOS')
      );

      const { result } = renderHook(() => useLeadSearchParams());

      act(() => {
        result.current.setSearch('   ');
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?page=1', {
        scroll: false,
      });
    });
  });

  // ==========================================================================
  // AC#4: Reset page to 1 when search changes
  // ==========================================================================
  describe('AC#4: Page reset', () => {
    it('resets page to 1 when search changes', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams('page=5&limit=20')
      );

      const { result } = renderHook(() => useLeadSearchParams());

      act(() => {
        result.current.setSearch('test');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        '/leads?page=1&limit=20&search=test',
        { scroll: false }
      );
    });
  });

  // ==========================================================================
  // Preserve other params
  // ==========================================================================
  describe('Preserve other params', () => {
    it('preserves limit param when updating search', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams('limit=50')
      );

      const { result } = renderHook(() => useLeadSearchParams());

      act(() => {
        result.current.setSearch('ENEOS');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        '/leads?limit=50&search=ENEOS&page=1',
        { scroll: false }
      );
    });

    it('preserves other custom params', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams('customParam=value&limit=20')
      );

      const { result } = renderHook(() => useLeadSearchParams());

      act(() => {
        result.current.setSearch('test');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        '/leads?customParam=value&limit=20&search=test&page=1',
        { scroll: false }
      );
    });
  });

  // ==========================================================================
  // AC#5: clearSearch
  // ==========================================================================
  describe('AC#5: clearSearch', () => {
    it('removes search param from URL', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams('search=ENEOS&page=3&limit=20')
      );

      const { result } = renderHook(() => useLeadSearchParams());

      act(() => {
        result.current.clearSearch();
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?page=1&limit=20', {
        scroll: false,
      });
    });

    it('resets page to 1 when clearing search', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams('search=test&page=10')
      );

      const { result } = renderHook(() => useLeadSearchParams());

      act(() => {
        result.current.clearSearch();
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?page=1', {
        scroll: false,
      });
    });

    it('works when no search param exists', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams('page=2')
      );

      const { result } = renderHook(() => useLeadSearchParams());

      act(() => {
        result.current.clearSearch();
      });

      expect(mockReplace).toHaveBeenCalledWith('/leads?page=1', {
        scroll: false,
      });
    });
  });
});
