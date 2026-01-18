/**
 * useLeadSourceFilterParams Hook Tests
 * Story 4.14: Filter by Lead Source - AC#7 URL State Sync
 *
 * Tests for:
 * - Reading leadSource from URL
 * - Updating URL when filter changes
 * - Preserving other params when updating
 * - Resetting page to 1 when filter changes
 * - Clearing filter
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLeadSourceFilterParams } from '@/hooks/use-lead-source-filter-params';

// Mock next/navigation
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/leads',
}));

describe('useLeadSourceFilterParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    mockSearchParams.delete('leadSource');
    mockSearchParams.delete('page');
    mockSearchParams.delete('search');
    mockSearchParams.delete('status');
  });

  describe('AC#7: Reading leadSource from URL', () => {
    it('returns null when no leadSource param', () => {
      const { result } = renderHook(() => useLeadSourceFilterParams());

      expect(result.current.leadSource).toBeNull();
      expect(result.current.hasLeadSourceFilter).toBe(false);
    });

    it('parses leadSource from URL', () => {
      mockSearchParams.set('leadSource', 'Website');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      expect(result.current.leadSource).toBe('Website');
      expect(result.current.hasLeadSourceFilter).toBe(true);
    });

    it('handles __unknown__ special value', () => {
      mockSearchParams.set('leadSource', '__unknown__');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      expect(result.current.leadSource).toBe('__unknown__');
      expect(result.current.hasLeadSourceFilter).toBe(true);
    });

    it('handles empty leadSource param as null', () => {
      mockSearchParams.set('leadSource', '');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      expect(result.current.leadSource).toBeNull();
    });
  });

  describe('AC#7: Updating URL', () => {
    it('updates URL with leadSource', () => {
      const { result } = renderHook(() => useLeadSourceFilterParams());

      act(() => {
        result.current.setLeadSource('Email Campaign');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('leadSource=Email+Campaign'),
        expect.anything()
      );
    });

    it('removes leadSource param when setting null', () => {
      mockSearchParams.set('leadSource', 'Website');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      act(() => {
        result.current.setLeadSource(null);
      });

      expect(mockReplace).toHaveBeenCalled();
      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).not.toContain('leadSource=');
    });

    it('resets page to 1 when filter changes', () => {
      mockSearchParams.set('page', '5');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      act(() => {
        result.current.setLeadSource('Website');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.anything()
      );
    });

    it('preserves search param when updating leadSource', () => {
      mockSearchParams.set('search', 'ENEOS');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      act(() => {
        result.current.setLeadSource('Referral');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('search=ENEOS'),
        expect.anything()
      );
    });

    it('preserves status param when updating leadSource', () => {
      mockSearchParams.set('status', 'new,claimed');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      act(() => {
        result.current.setLeadSource('LinkedIn');
      });

      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).toContain('status=new%2Cclaimed');
      expect(calledUrl).toContain('leadSource=LinkedIn');
    });
  });

  describe('AC#6: Clear leadSource', () => {
    it('clears leadSource and resets page', () => {
      mockSearchParams.set('leadSource', 'Website');
      mockSearchParams.set('page', '3');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      act(() => {
        result.current.clearLeadSource();
      });

      expect(mockReplace).toHaveBeenCalled();
      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).not.toContain('leadSource=');
      expect(calledUrl).toContain('page=1');
    });

    it('preserves other params when clearing', () => {
      mockSearchParams.set('leadSource', 'Website');
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('limit', '50');
      mockSearchParams.set('status', 'new');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      act(() => {
        result.current.clearLeadSource();
      });

      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).toContain('search=test');
      expect(calledUrl).toContain('limit=50');
      expect(calledUrl).toContain('status=new');
      expect(calledUrl).not.toContain('leadSource=');
    });
  });

  describe('hasLeadSourceFilter', () => {
    it('returns false when no filter', () => {
      const { result } = renderHook(() => useLeadSourceFilterParams());

      expect(result.current.hasLeadSourceFilter).toBe(false);
    });

    it('returns true when filter active', () => {
      mockSearchParams.set('leadSource', 'Email');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      expect(result.current.hasLeadSourceFilter).toBe(true);
    });

    it('returns true for __unknown__ value', () => {
      mockSearchParams.set('leadSource', '__unknown__');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      expect(result.current.hasLeadSourceFilter).toBe(true);
    });
  });

  describe('AC#5: Combined Filters Integration', () => {
    it('preserves status param when setting leadSource filter', () => {
      mockSearchParams.set('status', 'contacted');
      mockSearchParams.set('page', '2');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      act(() => {
        result.current.setLeadSource('Website');
      });

      const calledUrl = mockReplace.mock.calls[0][0];
      expect(calledUrl).toContain('status=contacted');
      expect(calledUrl).toContain('leadSource=Website');
      expect(calledUrl).toContain('page=1'); // Reset to page 1
    });

    it('maintains leadSource when status would be updated externally', () => {
      mockSearchParams.set('leadSource', 'Referral');
      mockSearchParams.set('status', 'new,claimed');

      const { result } = renderHook(() => useLeadSourceFilterParams());

      // leadSource should be preserved from URL
      expect(result.current.leadSource).toBe('Referral');
      expect(result.current.hasLeadSourceFilter).toBe(true);
    });
  });

  describe('URL uses scroll: false option', () => {
    it('calls replace with scroll: false', () => {
      const { result } = renderHook(() => useLeadSourceFilterParams());

      act(() => {
        result.current.setLeadSource('Website');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.any(String),
        { scroll: false }
      );
    });
  });
});
