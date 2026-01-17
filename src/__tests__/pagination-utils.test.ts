/**
 * Pagination Utils Tests
 * Story 4.2: Pagination - AC#1, AC#8
 *
 * Tests for pagination utility functions
 */
import { describe, it, expect } from 'vitest';
import { getVisiblePages, getDisplayRange } from '@/lib/pagination-utils';

describe('getVisiblePages', () => {
  describe('small page counts (no ellipsis needed)', () => {
    it('returns all pages when totalPages <= maxVisible', () => {
      expect(getVisiblePages(1, 3, 5)).toEqual([1, 2, 3]);
    });

    it('returns all pages when totalPages equals maxVisible', () => {
      expect(getVisiblePages(1, 5, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns empty array for 0 pages', () => {
      expect(getVisiblePages(1, 0, 5)).toEqual([]);
    });

    it('returns single page for 1 total page', () => {
      expect(getVisiblePages(1, 1, 5)).toEqual([1]);
    });

    it('returns two pages for 2 total pages', () => {
      expect(getVisiblePages(1, 2, 5)).toEqual([1, 2]);
    });
  });

  describe('large page counts with ellipsis', () => {
    it('shows ellipsis at end when on first page', () => {
      const result = getVisiblePages(1, 10, 5);
      // With maxVisible=5, shows 1,2,3,4,...,10 (4 numbers + ellipsis + last = 5 slots max)
      expect(result).toEqual([1, 2, 3, 4, 'ellipsis', 10]);
    });

    it('shows ellipsis at end when on second page', () => {
      const result = getVisiblePages(2, 10, 5);
      expect(result).toEqual([1, 2, 3, 4, 'ellipsis', 10]);
    });

    it('shows ellipsis at start when on last page', () => {
      const result = getVisiblePages(10, 10, 5);
      expect(result).toEqual([1, 'ellipsis', 7, 8, 9, 10]);
    });

    it('shows ellipsis at start when near last page', () => {
      const result = getVisiblePages(9, 10, 5);
      expect(result).toEqual([1, 'ellipsis', 7, 8, 9, 10]);
    });

    it('shows ellipsis on both sides when in middle', () => {
      const result = getVisiblePages(5, 10, 5);
      // Shows current page with neighbors on both sides
      expect(result).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
    });

    it('shows ellipsis on both sides for page 6 of 10', () => {
      const result = getVisiblePages(6, 10, 5);
      expect(result).toEqual([1, 'ellipsis', 5, 6, 7, 'ellipsis', 10]);
    });
  });

  describe('boundary conditions', () => {
    it('handles page 3 of 10 correctly', () => {
      const result = getVisiblePages(3, 10, 5);
      // Near start, show more at beginning
      expect(result).toEqual([1, 2, 3, 4, 'ellipsis', 10]);
    });

    it('handles page 4 of 10 correctly', () => {
      const result = getVisiblePages(4, 10, 5);
      // In transition zone - shows neighbors
      expect(result).toEqual([1, 'ellipsis', 3, 4, 5, 'ellipsis', 10]);
    });

    it('handles page 7 of 10 correctly', () => {
      const result = getVisiblePages(7, 10, 5);
      // In middle-end transition zone
      expect(result).toEqual([1, 'ellipsis', 6, 7, 8, 'ellipsis', 10]);
    });

    it('handles page 8 of 10 correctly', () => {
      const result = getVisiblePages(8, 10, 5);
      // Near end, show more at end
      expect(result).toEqual([1, 'ellipsis', 7, 8, 9, 10]);
    });
  });

  describe('edge cases', () => {
    it('handles currentPage beyond totalPages', () => {
      const result = getVisiblePages(15, 10, 5);
      // Should treat as if on last page (clamped to 10)
      expect(result).toEqual([1, 'ellipsis', 7, 8, 9, 10]);
    });

    it('handles currentPage of 0 (invalid)', () => {
      const result = getVisiblePages(0, 10, 5);
      // Should treat as page 1
      expect(result).toEqual([1, 2, 3, 4, 'ellipsis', 10]);
    });

    it('handles negative currentPage', () => {
      const result = getVisiblePages(-1, 10, 5);
      // Should treat as page 1
      expect(result).toEqual([1, 2, 3, 4, 'ellipsis', 10]);
    });

    it('handles negative totalPages', () => {
      const result = getVisiblePages(1, -1, 5);
      expect(result).toEqual([]);
    });
  });

  describe('different maxVisible values', () => {
    it('works with maxVisible=7', () => {
      const result = getVisiblePages(5, 10, 7);
      // With more visible, shows more pages around current
      expect(result).toEqual([1, 'ellipsis', 3, 4, 5, 6, 7, 'ellipsis', 10]);
    });

    it('works with maxVisible=3', () => {
      const result = getVisiblePages(5, 10, 3);
      // With less visible, just shows current with ellipsis
      expect(result).toEqual([1, 'ellipsis', 5, 'ellipsis', 10]);
    });
  });
});

describe('getDisplayRange', () => {
  it('calculates range for first page', () => {
    expect(getDisplayRange(1, 20, 50)).toEqual({ start: 1, end: 20 });
  });

  it('calculates range for second page', () => {
    expect(getDisplayRange(2, 20, 50)).toEqual({ start: 21, end: 40 });
  });

  it('calculates range for last page (partial)', () => {
    expect(getDisplayRange(3, 20, 50)).toEqual({ start: 41, end: 50 });
  });

  it('handles empty data', () => {
    expect(getDisplayRange(1, 20, 0)).toEqual({ start: 0, end: 0 });
  });

  it('handles single item', () => {
    expect(getDisplayRange(1, 20, 1)).toEqual({ start: 1, end: 1 });
  });

  it('handles full page of items', () => {
    expect(getDisplayRange(1, 10, 10)).toEqual({ start: 1, end: 10 });
  });

  it('handles custom limit', () => {
    expect(getDisplayRange(1, 25, 100)).toEqual({ start: 1, end: 25 });
    expect(getDisplayRange(2, 25, 100)).toEqual({ start: 26, end: 50 });
    expect(getDisplayRange(4, 25, 100)).toEqual({ start: 76, end: 100 });
  });
});
