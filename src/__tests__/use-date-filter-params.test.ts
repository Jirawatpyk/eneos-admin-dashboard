/**
 * useDateFilterParams Hook Tests
 * Story 4.6: Filter by Date - AC#8
 *
 * Tests for:
 * - Reading from/to dates from URL
 * - Updating URL when filter changes
 * - Page reset on filter change
 * - Preserving other params
 * - Validating date format
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
import { useDateFilterParams } from '@/hooks/use-date-filter-params';

describe('useDateFilterParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    mockSearchParams.delete('from');
    mockSearchParams.delete('to');
    mockSearchParams.delete('page');
    mockSearchParams.delete('status');
    mockSearchParams.delete('owner');
    mockSearchParams.delete('search');
  });

  describe('Reading from URL', () => {
    it('returns null dateRange when no from/to params', () => {
      const { result } = renderHook(() => useDateFilterParams());

      expect(result.current.dateRange).toBeNull();
      expect(result.current.hasDateFilter).toBe(false);
    });

    it('parses valid date range from URL', () => {
      mockSearchParams.set('from', '2026-01-09');
      mockSearchParams.set('to', '2026-01-15');

      const { result } = renderHook(() => useDateFilterParams());

      expect(result.current.dateRange).not.toBeNull();
      expect(result.current.dateRange!.from.getFullYear()).toBe(2026);
      expect(result.current.dateRange!.from.getMonth()).toBe(0); // January
      expect(result.current.dateRange!.from.getDate()).toBe(9);
      expect(result.current.dateRange!.to.getDate()).toBe(15);
      expect(result.current.hasDateFilter).toBe(true);
    });

    it('returns null for partial params (only from)', () => {
      mockSearchParams.set('from', '2026-01-09');
      // No 'to' param

      const { result } = renderHook(() => useDateFilterParams());

      expect(result.current.dateRange).toBeNull();
      expect(result.current.hasDateFilter).toBe(false);
    });

    it('returns null for partial params (only to)', () => {
      mockSearchParams.set('to', '2026-01-15');
      // No 'from' param

      const { result } = renderHook(() => useDateFilterParams());

      expect(result.current.dateRange).toBeNull();
      expect(result.current.hasDateFilter).toBe(false);
    });

    it('returns null for invalid date format', () => {
      mockSearchParams.set('from', 'invalid');
      mockSearchParams.set('to', '2026-01-15');

      const { result } = renderHook(() => useDateFilterParams());

      expect(result.current.dateRange).toBeNull();
    });

    it('returns null for invalid to date format', () => {
      mockSearchParams.set('from', '2026-01-09');
      mockSearchParams.set('to', 'not-a-date');

      const { result } = renderHook(() => useDateFilterParams());

      expect(result.current.dateRange).toBeNull();
    });

    it('returns null when from > to (invalid range)', () => {
      // AC#4: Validate end date >= start date
      mockSearchParams.set('from', '2026-01-20'); // Later date
      mockSearchParams.set('to', '2026-01-10'); // Earlier date

      const { result } = renderHook(() => useDateFilterParams());

      expect(result.current.dateRange).toBeNull();
      expect(result.current.hasDateFilter).toBe(false);
    });
  });

  describe('Updating URL', () => {
    it('sets from and to params in URL', () => {
      const { result } = renderHook(() => useDateFilterParams());

      const dateRange = {
        from: new Date(2026, 0, 9), // Jan 9, 2026
        to: new Date(2026, 0, 15), // Jan 15, 2026
      };

      act(() => {
        result.current.setDateRange(dateRange);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('from=2026-01-09'),
        { scroll: false }
      );
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('to=2026-01-15'),
        { scroll: false }
      );
    });

    it('removes from and to params when null', () => {
      mockSearchParams.set('from', '2026-01-09');
      mockSearchParams.set('to', '2026-01-15');

      const { result } = renderHook(() => useDateFilterParams());

      act(() => {
        result.current.setDateRange(null);
      });

      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).not.toContain('from=');
      expect(calledUrl).not.toContain('to=');
    });

    it('resets page to 1 when filter changes', () => {
      mockSearchParams.set('page', '5');

      const { result } = renderHook(() => useDateFilterParams());

      const dateRange = {
        from: new Date(2026, 0, 9),
        to: new Date(2026, 0, 15),
      };

      act(() => {
        result.current.setDateRange(dateRange);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        { scroll: false }
      );
    });

    it('preserves other params (status, owner, search, limit)', () => {
      mockSearchParams.set('status', 'new,claimed');
      mockSearchParams.set('owner', 'user-1');
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('limit', '50');

      const { result } = renderHook(() => useDateFilterParams());

      const dateRange = {
        from: new Date(2026, 0, 9),
        to: new Date(2026, 0, 15),
      };

      act(() => {
        result.current.setDateRange(dateRange);
      });

      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).toContain('status=new%2Cclaimed');
      expect(calledUrl).toContain('owner=user-1');
      expect(calledUrl).toContain('search=test');
      expect(calledUrl).toContain('limit=50');
    });
  });

  describe('Clear Date Filter', () => {
    it('removes from and to params', () => {
      mockSearchParams.set('from', '2026-01-09');
      mockSearchParams.set('to', '2026-01-15');

      const { result } = renderHook(() => useDateFilterParams());

      act(() => {
        result.current.clearDateRange();
      });

      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).not.toContain('from=');
      expect(calledUrl).not.toContain('to=');
    });

    it('resets page to 1 when cleared', () => {
      mockSearchParams.set('from', '2026-01-09');
      mockSearchParams.set('to', '2026-01-15');
      mockSearchParams.set('page', '3');

      const { result } = renderHook(() => useDateFilterParams());

      act(() => {
        result.current.clearDateRange();
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        { scroll: false }
      );
    });
  });

  describe('hasDateFilter', () => {
    it('returns false when no date filter', () => {
      const { result } = renderHook(() => useDateFilterParams());

      expect(result.current.hasDateFilter).toBe(false);
    });

    it('returns true when date filter active', () => {
      mockSearchParams.set('from', '2026-01-09');
      mockSearchParams.set('to', '2026-01-15');

      const { result } = renderHook(() => useDateFilterParams());

      expect(result.current.hasDateFilter).toBe(true);
    });
  });

  describe('Combined Filters (AC#6)', () => {
    it('preserves all other filters when adding date filter', () => {
      // AC#6: Combined filters should work together
      mockSearchParams.set('status', 'new,claimed');
      mockSearchParams.set('owner', 'user-1,user-2');
      mockSearchParams.set('search', 'test company');
      mockSearchParams.set('limit', '50');
      mockSearchParams.set('sortBy', 'company');
      mockSearchParams.set('sortDir', 'asc');

      const { result } = renderHook(() => useDateFilterParams());

      const dateRange = {
        from: new Date(2026, 0, 1),
        to: new Date(2026, 0, 15),
      };

      act(() => {
        result.current.setDateRange(dateRange);
      });

      const calledUrl = mockReplace.mock.calls[0][0];

      // Verify date filter was added
      expect(calledUrl).toContain('from=2026-01-01');
      expect(calledUrl).toContain('to=2026-01-15');

      // Verify ALL other filters are preserved
      expect(calledUrl).toContain('status=new%2Cclaimed');
      expect(calledUrl).toContain('owner=user-1%2Cuser-2');
      expect(calledUrl).toContain('search=test+company');
      expect(calledUrl).toContain('limit=50');
      expect(calledUrl).toContain('sortBy=company');
      expect(calledUrl).toContain('sortDir=asc');

      // Verify page is reset
      expect(calledUrl).toContain('page=1');
    });

    it('preserves other filters when clearing date filter', () => {
      // AC#6: When date filter is cleared, other filters remain active
      mockSearchParams.set('status', 'new');
      mockSearchParams.set('owner', 'user-1');
      mockSearchParams.set('search', 'acme');
      mockSearchParams.set('from', '2026-01-01');
      mockSearchParams.set('to', '2026-01-15');
      mockSearchParams.set('page', '3');

      const { result } = renderHook(() => useDateFilterParams());

      act(() => {
        result.current.clearDateRange();
      });

      const calledUrl = mockReplace.mock.calls[0][0];

      // Verify date filter was removed
      expect(calledUrl).not.toContain('from=');
      expect(calledUrl).not.toContain('to=');

      // Verify other filters are preserved
      expect(calledUrl).toContain('status=new');
      expect(calledUrl).toContain('owner=user-1');
      expect(calledUrl).toContain('search=acme');

      // Page should reset to 1
      expect(calledUrl).toContain('page=1');
    });
  });
});
