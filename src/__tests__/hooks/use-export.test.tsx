/**
 * Export Hook Tests - PDF Preview
 * Story 6.2: Export to PDF
 *
 * AC#1: Preview PDF Button
 * AC#6: Loading States
 * AC#7: Error Handling
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExport } from '@/hooks/use-export';

// Mock toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useExport - PDF Preview', () => {
  const mockExportParams = {
    format: 'pdf' as const,
    status: 'all' as const,
    owner: 'all',
    campaign: 'all',
  };

  const mockBlob = new Blob(['%PDF-1.4 fake content'], { type: 'application/pdf' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Basic hook initialization
  describe('initialization', () => {
    it('returns previewPdf function', () => {
      const { result } = renderHook(() => useExport());

      expect(result.current.previewPdf).toBeDefined();
      expect(typeof result.current.previewPdf).toBe('function');
    });

    it('returns isPreviewing state initialized to false', () => {
      const { result } = renderHook(() => useExport());

      expect(result.current.isPreviewing).toBe(false);
    });

    it('returns cancelPreview function', () => {
      const { result } = renderHook(() => useExport());

      expect(result.current.cancelPreview).toBeDefined();
      expect(typeof result.current.cancelPreview).toBe('function');
    });
  });

  // AC#6: Loading States
  describe('loading states', () => {
    it('sets isPreviewing to true during preview request', async () => {
      // Create a promise that we can resolve manually
      let resolveResponse: (value: Response) => void;
      const responsePromise = new Promise<Response>((resolve) => {
        resolveResponse = resolve;
      });
      mockFetch.mockReturnValue(responsePromise);

      const { result } = renderHook(() => useExport());

      // Start preview but don't await
      act(() => {
        result.current.previewPdf(mockExportParams);
      });

      // Should be previewing immediately
      expect(result.current.isPreviewing).toBe(true);

      // Resolve the fetch
      await act(async () => {
        resolveResponse!(
          new Response(mockBlob, {
            status: 200,
            headers: { 'Content-Disposition': 'attachment; filename="leads_export_2026-01-31.pdf"' },
          })
        );
      });
    });

    it('resets isPreviewing to false after successful preview', async () => {
      mockFetch.mockResolvedValue(
        new Response(mockBlob, {
          status: 200,
          headers: { 'Content-Disposition': 'attachment; filename="leads_export_2026-01-31.pdf"' },
        })
      );

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.previewPdf(mockExportParams);
      });

      expect(result.current.isPreviewing).toBe(false);
    });

    it('resets isPreviewing to false after error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useExport());

      await act(async () => {
        try {
          await result.current.previewPdf(mockExportParams);
        } catch {
          // Expected error
        }
      });

      expect(result.current.isPreviewing).toBe(false);
    });
  });

  // AC#1: Preview PDF Button - returns blob and filename
  describe('preview functionality', () => {
    it('returns blob and filename on successful preview', async () => {
      mockFetch.mockResolvedValue(
        new Response(mockBlob, {
          status: 200,
          headers: { 'Content-Disposition': 'attachment; filename="leads_export_2026-01-31.pdf"' },
        })
      );

      const { result } = renderHook(() => useExport());

      let previewResult: { blob: Blob; filename: string } | undefined;
      await act(async () => {
        previewResult = await result.current.previewPdf(mockExportParams);
      });

      expect(previewResult).toBeDefined();
      // Check blob has expected properties (instanceof may fail across realms in test env)
      expect(previewResult!.blob).toHaveProperty('size');
      expect(previewResult!.blob).toHaveProperty('type');
      expect(previewResult!.filename).toBe('leads_export_2026-01-31.pdf');
    });

    it('generates default filename when Content-Disposition header is missing', async () => {
      mockFetch.mockResolvedValue(
        new Response(mockBlob, {
          status: 200,
        })
      );

      const { result } = renderHook(() => useExport());

      let previewResult: { blob: Blob; filename: string } | undefined;
      await act(async () => {
        previewResult = await result.current.previewPdf(mockExportParams);
      });

      expect(previewResult).toBeDefined();
      expect(previewResult!.filename).toMatch(/^preview_\d+\.pdf$/);
    });

    it('forces PDF format in API call', async () => {
      mockFetch.mockResolvedValue(
        new Response(mockBlob, {
          status: 200,
        })
      );

      const { result } = renderHook(() => useExport());

      // Even if xlsx format is passed, previewPdf should force PDF format
      await act(async () => {
        await result.current.previewPdf({ ...mockExportParams, format: 'xlsx' });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('format=pdf'),
        expect.any(Object)
      );
    });
  });

  // AC#7: Error Handling
  describe('error handling', () => {
    it('throws error on non-ok response', async () => {
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ message: 'Server error' }), {
          status: 500,
          statusText: 'Internal Server Error',
        })
      );

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await expect(result.current.previewPdf(mockExportParams)).rejects.toThrow();
      });
    });

    it('shows error toast on failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useExport());

      await act(async () => {
        try {
          await result.current.previewPdf(mockExportParams);
        } catch {
          // Expected error
        }
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Preview Failed',
          variant: 'destructive',
        })
      );
    });
  });

  // AbortController support
  describe('cancellation', () => {
    it('can cancel preview request', async () => {
      // Use a simpler mock that doesn't cause unhandled rejections
      mockFetch.mockImplementation((_url, options) => {
        return new Promise((resolve, reject) => {
          // Immediate check if already aborted
          if (options?.signal?.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }
          // Listen for abort
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      });

      const { result } = renderHook(() => useExport());

      // Start preview - catch the rejection to prevent unhandled error
      let previewPromise: Promise<{ blob: Blob; filename: string }>;
      act(() => {
        previewPromise = result.current.previewPdf(mockExportParams);
        previewPromise.catch(() => {
          // Expected abort error - swallow it
        });
      });

      // Cancel it
      await act(async () => {
        result.current.cancelPreview();
        // Wait a tick for abort to process
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(result.current.isPreviewing).toBe(false);
    });
  });

  // isExporting and isPreviewing are independent
  describe('state independence', () => {
    it('isPreviewing and isExporting are independent states', async () => {
      mockFetch.mockResolvedValue(
        new Response(mockBlob, {
          status: 200,
        })
      );

      const { result } = renderHook(() => useExport());

      expect(result.current.isExporting).toBe(false);
      expect(result.current.isPreviewing).toBe(false);

      // Only one should be true at a time based on which function is called
      await act(async () => {
        await result.current.previewPdf(mockExportParams);
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.isPreviewing).toBe(false);
    });
  });
});
