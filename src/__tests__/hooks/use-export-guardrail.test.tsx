/**
 * Export Hook Guardrail Tests
 * Story 6.2: Export to PDF - TEA Automation
 *
 * Coverage gaps addressed:
 * - exportData() successful download flow
 * - exportData() error handling and toast
 * - buildQueryParams() date range formatting (indirect)
 * - extractFilename() edge cases (indirect)
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

// Mock URL APIs
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

describe('useExport - Guardrail Tests', () => {
  const mockBlob = new Blob(['file-content'], { type: 'application/octet-stream' });

  // Track the anchor element created for download
  let capturedLink: HTMLAnchorElement | null = null;
  let mockClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    capturedLink = null;
    mockClick = vi.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    // Intercept anchor creation to track download behavior
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        capturedLink = element as HTMLAnchorElement;
        // Mock click to prevent actual navigation
        element.click = mockClick as unknown as typeof element.click;
      }
      return element;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── exportData() - Successful Download Flow ──────────────────────
  describe('exportData - download flow', () => {
    it('[P1] downloads file with correct filename from Content-Disposition', async () => {
      // GIVEN: API returns file with Content-Disposition header
      mockFetch.mockResolvedValue(
        new Response(mockBlob, {
          status: 200,
          headers: { 'Content-Disposition': 'attachment; filename="leads_2026-01-31.xlsx"' },
        })
      );

      const { result } = renderHook(() => useExport());

      // WHEN: exportData is called
      await act(async () => {
        await result.current.exportData({
          format: 'xlsx',
          status: 'all',
          owner: 'all',
          campaign: 'all',
        });
      });

      // THEN: File download is triggered with correct filename
      expect(capturedLink).not.toBeNull();
      expect(capturedLink!.download).toBe('leads_2026-01-31.xlsx');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('[P1] shows success toast after export', async () => {
      // GIVEN: API returns successful response
      mockFetch.mockResolvedValue(
        new Response(mockBlob, {
          status: 200,
          headers: { 'Content-Disposition': 'attachment; filename="export.csv"' },
        })
      );

      const { result } = renderHook(() => useExport());

      // WHEN: exportData completes
      await act(async () => {
        await result.current.exportData({
          format: 'csv',
          status: 'all',
          owner: 'all',
          campaign: 'all',
        });
      });

      // THEN: Success toast is shown
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Export Successful',
        })
      );
    });

    it('[P1] sets isExporting during export request', async () => {
      // GIVEN: A delayed response
      let resolveResponse: (value: Response) => void;
      const responsePromise = new Promise<Response>((resolve) => {
        resolveResponse = resolve;
      });
      mockFetch.mockReturnValue(responsePromise);

      const { result } = renderHook(() => useExport());

      // WHEN: Export starts but hasn't completed
      act(() => {
        result.current.exportData({
          format: 'xlsx',
          status: 'all',
          owner: 'all',
          campaign: 'all',
        });
      });

      // THEN: isExporting is true
      expect(result.current.isExporting).toBe(true);

      // Cleanup: resolve the fetch
      await act(async () => {
        resolveResponse!(
          new Response(mockBlob, {
            status: 200,
            headers: { 'Content-Disposition': 'attachment; filename="export.xlsx"' },
          })
        );
      });
    });

    it('[P1] resets isExporting after successful export', async () => {
      // GIVEN: Successful response
      mockFetch.mockResolvedValue(
        new Response(mockBlob, { status: 200 })
      );

      const { result } = renderHook(() => useExport());

      // WHEN: Export completes
      await act(async () => {
        await result.current.exportData({
          format: 'xlsx',
          status: 'all',
          owner: 'all',
          campaign: 'all',
        });
      });

      // THEN: isExporting is false
      expect(result.current.isExporting).toBe(false);
    });
  });

  // ── exportData() - Error Handling ──────────────────────────────
  describe('exportData - error handling', () => {
    it('[P1] throws and shows error toast on non-ok response', async () => {
      // GIVEN: API returns 500 error
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ message: 'Server error' }), {
          status: 500,
          statusText: 'Internal Server Error',
        })
      );

      const { result } = renderHook(() => useExport());

      // WHEN: exportData is called
      await act(async () => {
        await expect(
          result.current.exportData({
            format: 'xlsx',
            status: 'all',
            owner: 'all',
            campaign: 'all',
          })
        ).rejects.toThrow();
      });

      // THEN: Error toast shown
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Export Failed',
          variant: 'destructive',
        })
      );
    });

    it('[P1] resets isExporting after error', async () => {
      // GIVEN: Network error
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useExport());

      // WHEN: exportData fails
      await act(async () => {
        try {
          await result.current.exportData({
            format: 'xlsx',
            status: 'all',
            owner: 'all',
            campaign: 'all',
          });
        } catch {
          // Expected
        }
      });

      // THEN: isExporting is reset
      expect(result.current.isExporting).toBe(false);
    });

    it('[P2] sets error state on failure', async () => {
      // GIVEN: Network error
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const { result } = renderHook(() => useExport());

      // WHEN: exportData fails
      await act(async () => {
        try {
          await result.current.exportData({
            format: 'xlsx',
            status: 'all',
            owner: 'all',
            campaign: 'all',
          });
        } catch {
          // Expected
        }
      });

      // THEN: error state is set
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Connection refused');
    });
  });

  // ── buildQueryParams() - Date Range (Indirect) ─────────────────
  describe('query params with date range (indirect)', () => {
    it('[P1] includes startDate and endDate when date range is provided', async () => {
      // GIVEN: Export params with date range
      mockFetch.mockResolvedValue(
        new Response(mockBlob, { status: 200 })
      );

      const { result } = renderHook(() => useExport());

      // WHEN: exportData is called with date range
      await act(async () => {
        await result.current.exportData({
          format: 'xlsx',
          status: 'new',
          owner: 'owner-1',
          campaign: 'camp-1',
          dateRange: {
            from: new Date(2026, 0, 1), // Jan 1, 2026
            to: new Date(2026, 0, 31),  // Jan 31, 2026
          },
        });
      });

      // THEN: Fetch URL includes date params formatted as YYYY-MM-DD
      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain('startDate=2026-01-01');
      expect(fetchUrl).toContain('endDate=2026-01-31');
    });

    it('[P2] handles date range with only "from" date', async () => {
      // GIVEN: Date range with only from date
      mockFetch.mockResolvedValue(
        new Response(mockBlob, { status: 200 })
      );

      const { result } = renderHook(() => useExport());

      // WHEN: Only from date is provided
      await act(async () => {
        await result.current.exportData({
          format: 'xlsx',
          status: 'all',
          owner: 'all',
          campaign: 'all',
          dateRange: {
            from: new Date(2026, 5, 15), // Jun 15, 2026
          },
        });
      });

      // THEN: startDate is included, endDate is not
      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain('startDate=2026-06-15');
      expect(fetchUrl).not.toContain('endDate=');
    });

    it('[P2] passes all filter params to API', async () => {
      // GIVEN: Specific filters
      mockFetch.mockResolvedValue(
        new Response(mockBlob, { status: 200 })
      );

      const { result } = renderHook(() => useExport());

      // WHEN: exportData with specific filters
      await act(async () => {
        await result.current.exportData({
          format: 'csv',
          status: 'contacted',
          owner: 'owner-123',
          campaign: 'camp-456',
        });
      });

      // THEN: All params are in URL
      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain('format=csv');
      expect(fetchUrl).toContain('status=contacted');
      expect(fetchUrl).toContain('owner=owner-123');
      expect(fetchUrl).toContain('campaign=camp-456');
    });
  });

  // ── extractFilename() - Edge Cases (Indirect) ──────────────────
  describe('filename extraction edge cases (indirect)', () => {
    it('[P2] uses fallback filename when Content-Disposition is absent', async () => {
      // GIVEN: Response without Content-Disposition header
      mockFetch.mockResolvedValue(
        new Response(mockBlob, { status: 200 })
      );

      const { result } = renderHook(() => useExport());

      // WHEN: exportData is called
      await act(async () => {
        await result.current.exportData({
          format: 'xlsx',
          status: 'all',
          owner: 'all',
          campaign: 'all',
        });
      });

      // THEN: Fallback filename is used
      expect(capturedLink).not.toBeNull();
      expect(capturedLink!.download).toMatch(/^preview_\d+\.xlsx$/);
    });

    it('[P2] extracts unquoted filename from Content-Disposition', async () => {
      // GIVEN: Unquoted filename in header
      mockFetch.mockResolvedValue(
        new Response(mockBlob, {
          status: 200,
          headers: { 'Content-Disposition': 'attachment; filename=report.xlsx' },
        })
      );

      const { result } = renderHook(() => useExport());

      // WHEN: exportData is called
      await act(async () => {
        await result.current.exportData({
          format: 'xlsx',
          status: 'all',
          owner: 'all',
          campaign: 'all',
        });
      });

      // THEN: Unquoted filename is extracted correctly
      expect(capturedLink).not.toBeNull();
      expect(capturedLink!.download).toBe('report.xlsx');
    });
  });

  // ── previewPdf() - AbortError suppression ──────────────────────
  describe('previewPdf - abort error handling', () => {
    it('[P2] does not show toast when preview is aborted', async () => {
      // GIVEN: Fetch that will be aborted
      mockFetch.mockImplementation((_url: string, options?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          if (options?.signal?.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      });

      const { result } = renderHook(() => useExport());

      // WHEN: Preview is started then cancelled
      let previewPromise: Promise<{ blob: Blob; filename: string }>;
      act(() => {
        previewPromise = result.current.previewPdf({
          format: 'pdf',
          status: 'all',
          owner: 'all',
          campaign: 'all',
        });
        previewPromise.catch(() => {
          // Expected abort error
        });
      });

      await act(async () => {
        result.current.cancelPreview();
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // THEN: No error toast for abort
      expect(mockToast).not.toHaveBeenCalled();
    });
  });
});
