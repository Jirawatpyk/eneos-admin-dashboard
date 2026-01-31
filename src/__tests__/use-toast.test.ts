/**
 * useToast Hook Tests
 * Tests for toast reducer and state management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reducer } from '../hooks/use-toast';

describe('toast reducer', () => {
  const baseState = { toasts: [] as Array<{ id: string; open?: boolean; title?: string }> };

  describe('[P1] ADD_TOAST', () => {
    it('should add toast to empty state', () => {
      const toast = { id: '1', title: 'Hello', open: true };
      const result = reducer(baseState as never, {
        type: 'ADD_TOAST',
        toast: toast as never,
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe('1');
    });

    it('should prepend new toast (newest first)', () => {
      const state = {
        toasts: [{ id: '1', title: 'First', open: true }],
      };
      const result = reducer(state as never, {
        type: 'ADD_TOAST',
        toast: { id: '2', title: 'Second', open: true } as never,
      });

      expect(result.toasts).toHaveLength(2);
      expect(result.toasts[0].id).toBe('2'); // Newest first
    });

    it('should enforce TOAST_LIMIT of 3', () => {
      const state = {
        toasts: [
          { id: '1', title: 'One', open: true },
          { id: '2', title: 'Two', open: true },
          { id: '3', title: 'Three', open: true },
        ],
      };
      const result = reducer(state as never, {
        type: 'ADD_TOAST',
        toast: { id: '4', title: 'Four', open: true } as never,
      });

      expect(result.toasts).toHaveLength(3);
      expect(result.toasts[0].id).toBe('4'); // Newest added
      expect(result.toasts[2].id).toBe('2'); // Oldest removed
    });
  });

  describe('[P1] UPDATE_TOAST', () => {
    it('should update matching toast', () => {
      const state = {
        toasts: [{ id: '1', title: 'Old Title', open: true }],
      };
      const result = reducer(state as never, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'New Title' } as never,
      });

      expect(result.toasts[0].title).toBe('New Title');
    });

    it('should not affect non-matching toasts', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Keep', open: true },
          { id: '2', title: 'Also Keep', open: true },
        ],
      };
      const result = reducer(state as never, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Changed' } as never,
      });

      expect(result.toasts[0].title).toBe('Changed');
      expect(result.toasts[1].title).toBe('Also Keep');
    });
  });

  describe('[P1] DISMISS_TOAST', () => {
    it('should set open=false for specific toast', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      };
      const result = reducer(state as never, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      });

      expect(result.toasts[0].open).toBe(false);
      expect(result.toasts[1].open).toBe(true);
    });

    it('should set open=false for all toasts when no ID', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      };
      const result = reducer(state as never, {
        type: 'DISMISS_TOAST',
        toastId: undefined,
      });

      expect(result.toasts[0].open).toBe(false);
      expect(result.toasts[1].open).toBe(false);
    });
  });

  describe('[P1] REMOVE_TOAST', () => {
    it('should remove specific toast', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      };
      const result = reducer(state as never, {
        type: 'REMOVE_TOAST',
        toastId: '1',
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe('2');
    });

    it('should remove all toasts when no ID', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      };
      const result = reducer(state as never, {
        type: 'REMOVE_TOAST',
        toastId: undefined,
      });

      expect(result.toasts).toHaveLength(0);
    });
  });
});

describe('toast function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('[P1] should be importable', async () => {
    const { toast } = await import('../hooks/use-toast');
    expect(typeof toast).toBe('function');
  });

  it('[P1] should return id, dismiss, and update', async () => {
    const { toast } = await import('../hooks/use-toast');
    const result = toast({ title: 'Test' } as never);

    expect(result.id).toBeDefined();
    expect(typeof result.dismiss).toBe('function');
    expect(typeof result.update).toBe('function');
  });
});
