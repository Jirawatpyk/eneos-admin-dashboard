/**
 * Debounce Hook Tests
 * Story 4.3: Search
 *
 * Tests for AC#2: Real-time Search with Debounce
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce, useDebouncedValue } from '@/hooks/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ==========================================================================
  // AC#2: Debounce Behavior
  // ==========================================================================
  describe('AC#2: Debounce delay', () => {
    it('returns initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 300));

      expect(result.current).toBe('initial');
    });

    it('does NOT update immediately when value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      // Should still be initial (not updated yet)
      expect(result.current).toBe('initial');
    });

    it('updates after 300ms delay (default)', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      // Fast-forward 300ms
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('updated');
    });

    it('does NOT update before delay completes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      // Fast-forward 299ms (1ms before delay)
      act(() => {
        vi.advanceTimersByTime(299);
      });

      expect(result.current).toBe('initial');
    });

    it('cancels pending debounce when value changes again', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      // First update
      rerender({ value: 'update1' });

      // Wait 200ms
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Second update (should cancel first)
      rerender({ value: 'update2' });

      // Wait another 100ms (300ms total from first update, but only 100ms from second)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should still not be updated (only 100ms since second update)
      expect(result.current).toBe('initial');

      // Wait final 200ms
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Now should be update2 (300ms since second update)
      expect(result.current).toBe('update2');
    });

    it('uses custom delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      // 300ms not enough for 500ms delay
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe('initial');

      // 500ms should be enough
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe('updated');
    });
  });

  // ==========================================================================
  // Type Safety
  // ==========================================================================
  describe('Type Safety', () => {
    it('works with string values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'test' } }
      );

      rerender({ value: 'updated' });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('updated');
    });

    it('works with number values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 0 } }
      );

      rerender({ value: 42 });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(42);
    });

    it('works with object values', () => {
      const obj1 = { name: 'initial' };
      const obj2 = { name: 'updated' };

      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: obj1 } }
      );

      rerender({ value: obj2 });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toEqual(obj2);
    });
  });
});

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ==========================================================================
  // AC#2: isPending State
  // ==========================================================================
  describe('AC#2: isPending state', () => {
    it('returns isPending=false initially', () => {
      const { result } = renderHook(() => useDebouncedValue('initial', 300));

      expect(result.current.isPending).toBe(false);
      expect(result.current.debouncedValue).toBe('initial');
    });

    it('sets isPending=true when value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      expect(result.current.isPending).toBe(true);
      expect(result.current.debouncedValue).toBe('initial');
    });

    it('sets isPending=false after debounce completes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.debouncedValue).toBe('updated');
    });

    it('stays pending when value changes multiple times', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'initial' } }
      );

      // Multiple rapid changes
      rerender({ value: 'update1' });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'update2' });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'update3' });

      // Should still be pending
      expect(result.current.isPending).toBe(true);

      // Wait for final debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.debouncedValue).toBe('update3');
    });
  });

  // ==========================================================================
  // Default Delay
  // ==========================================================================
  describe('Default delay', () => {
    it('uses 300ms as default delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      // Before 300ms
      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(result.current.debouncedValue).toBe('initial');

      // After 300ms
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.debouncedValue).toBe('updated');
    });
  });
});
