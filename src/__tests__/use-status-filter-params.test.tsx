/**
 * useStatusFilterParams Hook Tests
 * Story 4.4: Filter by Status - AC#7 URL State Sync
 *
 * Tests for:
 * - Reading status from URL (comma-separated)
 * - Updating URL when filter changes
 * - Preserving other params when updating
 * - Resetting page to 1 when filter changes
 * - Validating status values
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStatusFilterParams } from '@/hooks/use-status-filter-params';

// Mock next/navigation
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/leads',
}));

describe('useStatusFilterParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    mockSearchParams.delete('status');
    mockSearchParams.delete('page');
    mockSearchParams.delete('search');
  });

  describe('AC#7: Reading Status from URL', () => {
    it('returns empty array when no status param', () => {
      const { result } = renderHook(() => useStatusFilterParams());

      expect(result.current.statuses).toEqual([]);
      expect(result.current.hasStatusFilter).toBe(false);
    });

    it('parses single status from URL', () => {
      mockSearchParams.set('status', 'new');

      const { result } = renderHook(() => useStatusFilterParams());

      expect(result.current.statuses).toEqual(['new']);
      expect(result.current.hasStatusFilter).toBe(true);
    });

    it('parses comma-separated statuses from URL', () => {
      mockSearchParams.set('status', 'new,claimed,closed');

      const { result } = renderHook(() => useStatusFilterParams());

      expect(result.current.statuses).toEqual(['new', 'claimed', 'closed']);
      expect(result.current.hasStatusFilter).toBe(true);
    });

    it('filters out invalid status values', () => {
      mockSearchParams.set('status', 'new,invalid,closed,bad');

      const { result } = renderHook(() => useStatusFilterParams());

      expect(result.current.statuses).toEqual(['new', 'closed']);
    });

    it('handles empty status param', () => {
      mockSearchParams.set('status', '');

      const { result } = renderHook(() => useStatusFilterParams());

      expect(result.current.statuses).toEqual([]);
    });
  });

  describe('AC#7: Updating URL', () => {
    it('updates URL with single status', () => {
      const { result } = renderHook(() => useStatusFilterParams());

      act(() => {
        result.current.setStatuses(['new']);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('status=new'),
        expect.anything()
      );
    });

    it('updates URL with comma-separated statuses', () => {
      const { result } = renderHook(() => useStatusFilterParams());

      act(() => {
        result.current.setStatuses(['new', 'claimed']);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('status=new%2Cclaimed'),
        expect.anything()
      );
    });

    it('removes status param when clearing filter', () => {
      mockSearchParams.set('status', 'new');

      const { result } = renderHook(() => useStatusFilterParams());

      act(() => {
        result.current.setStatuses([]);
      });

      expect(mockReplace).toHaveBeenCalled();
      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).not.toContain('status=');
    });

    it('resets page to 1 when filter changes', () => {
      mockSearchParams.set('page', '5');

      const { result } = renderHook(() => useStatusFilterParams());

      act(() => {
        result.current.setStatuses(['new']);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.anything()
      );
    });

    it('preserves search param when updating status', () => {
      mockSearchParams.set('search', 'ENEOS');

      const { result } = renderHook(() => useStatusFilterParams());

      act(() => {
        result.current.setStatuses(['closed']);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('search=ENEOS'),
        expect.anything()
      );
    });
  });

  describe('AC#6: Clear Statuses', () => {
    it('clears statuses and resets page', () => {
      mockSearchParams.set('status', 'new,claimed');
      mockSearchParams.set('page', '3');

      const { result } = renderHook(() => useStatusFilterParams());

      act(() => {
        result.current.clearStatuses();
      });

      expect(mockReplace).toHaveBeenCalled();
      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).not.toContain('status=');
      expect(calledUrl).toContain('page=1');
    });

    it('preserves other params when clearing', () => {
      mockSearchParams.set('status', 'new');
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('limit', '50');

      const { result } = renderHook(() => useStatusFilterParams());

      act(() => {
        result.current.clearStatuses();
      });

      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).toContain('search=test');
      expect(calledUrl).toContain('limit=50');
    });
  });

  describe('hasStatusFilter', () => {
    it('returns false when no filter', () => {
      const { result } = renderHook(() => useStatusFilterParams());

      expect(result.current.hasStatusFilter).toBe(false);
    });

    it('returns true when filter active', () => {
      mockSearchParams.set('status', 'new');

      const { result } = renderHook(() => useStatusFilterParams());

      expect(result.current.hasStatusFilter).toBe(true);
    });
  });

  describe('AC#5: Combined Filters Integration', () => {
    it('preserves search param when setting status filter', () => {
      mockSearchParams.set('search', 'ENEOS');
      mockSearchParams.set('page', '2');

      const { result } = renderHook(() => useStatusFilterParams());

      act(() => {
        result.current.setStatuses(['contacted']);
      });

      // Verify URL includes both search AND status
      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).toContain('search=ENEOS');
      expect(calledUrl).toContain('status=contacted');
      expect(calledUrl).toContain('page=1'); // Reset to page 1
    });

    it('maintains status when search would be updated externally', () => {
      mockSearchParams.set('status', 'new,claimed');
      mockSearchParams.set('search', 'test');

      const { result } = renderHook(() => useStatusFilterParams());

      // Status should be preserved from URL
      expect(result.current.statuses).toEqual(['new', 'claimed']);
      expect(result.current.hasStatusFilter).toBe(true);
    });
  });

  describe('Status Validation', () => {
    it('only accepts valid LeadStatus values', () => {
      mockSearchParams.set('status', 'new,claimed,contacted,closed,lost,unreachable');

      const { result } = renderHook(() => useStatusFilterParams());

      expect(result.current.statuses).toHaveLength(6);
    });

    it('handles case-insensitive status values', () => {
      mockSearchParams.set('status', 'NEW,Claimed,CLOSED');

      const { result } = renderHook(() => useStatusFilterParams());

      expect(result.current.statuses).toEqual(['new', 'claimed', 'closed']);
    });

    it('handles whitespace in status values', () => {
      mockSearchParams.set('status', ' new , claimed ');

      const { result } = renderHook(() => useStatusFilterParams());

      expect(result.current.statuses).toEqual(['new', 'claimed']);
    });
  });
});
