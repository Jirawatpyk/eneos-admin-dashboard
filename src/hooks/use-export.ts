import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { DateRange } from 'react-day-picker';

export type ExportFormat = 'xlsx' | 'csv' | 'pdf';
export type ExportStatus = 'all' | 'new' | 'contacted' | 'closed' | 'lost' | 'unreachable';

export interface ExportParams {
  format: ExportFormat;
  dateRange?: DateRange;
  status: ExportStatus;
  owner: string;
  campaign: string;
}

export interface PreviewResult {
  blob: Blob;
  filename: string;
}

export interface UseExportReturn {
  exportData: (params: ExportParams) => Promise<void>;
  previewPdf: (params: ExportParams) => Promise<PreviewResult>;
  cancelPreview: () => void;
  isExporting: boolean;
  isPreviewing: boolean;
  error: Error | null;
}

/**
 * Build query params from export params
 */
function buildQueryParams(params: ExportParams): URLSearchParams {
  const queryParams = new URLSearchParams({
    format: params.format,
    status: params.status,
    owner: params.owner,
    campaign: params.campaign,
  });

  // Add date range if provided (format: YYYY-MM-DD to avoid timezone issues)
  if (params.dateRange?.from) {
    const year = params.dateRange.from.getFullYear();
    const month = String(params.dateRange.from.getMonth() + 1).padStart(2, '0');
    const day = String(params.dateRange.from.getDate()).padStart(2, '0');
    queryParams.append('startDate', `${year}-${month}-${day}`);
  }
  if (params.dateRange?.to) {
    const year = params.dateRange.to.getFullYear();
    const month = String(params.dateRange.to.getMonth() + 1).padStart(2, '0');
    const day = String(params.dateRange.to.getDate()).padStart(2, '0');
    queryParams.append('endDate', `${year}-${month}-${day}`);
  }

  return queryParams;
}

/**
 * Extract filename from Content-Disposition header
 */
function extractFilename(response: Response, fallbackFormat: string): string {
  const contentDisposition = response.headers.get('Content-Disposition');
  const filenameMatch = contentDisposition?.match(/filename="?([^";\s]+)"?/i);
  return filenameMatch
    ? filenameMatch[1]
    : `preview_${Date.now()}.${fallbackFormat}`;
}

/**
 * Custom hook for exporting lead data
 * Task 3: Export button logic
 * Story 6.2: Added PDF preview functionality
 */
export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // AbortController for preview cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  const exportData = useCallback(async (params: ExportParams) => {
    setIsExporting(true);
    setError(null);

    try {
      const queryParams = buildQueryParams(params);

      // Call API route (Task 4: Next.js API route proxy)
      const response = await fetch(`/api/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Export failed: ${response.statusText}`);
      }

      const filename = extractFilename(response, params.format);

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success toast
      toast({
        title: 'Export Successful',
        description: `File downloaded: ${filename}`,
      });
    } catch (err) {
      const exportError = err instanceof Error ? err : new Error('Export failed');
      setError(exportError);

      // Show error toast
      toast({
        title: 'Export Failed',
        description: exportError.message,
        variant: 'destructive',
      });

      throw exportError;
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  /**
   * Preview PDF - Returns blob and filename for modal display
   * Story 6.2: AC#1, AC#6, AC#7
   */
  const previewPdf = useCallback(async (params: ExportParams): Promise<PreviewResult> => {
    setIsPreviewing(true);
    setError(null);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      // Force PDF format for preview
      const queryParams = buildQueryParams({ ...params, format: 'pdf' });

      const response = await fetch(`/api/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Preview failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const filename = extractFilename(response, 'pdf');

      return { blob, filename };
    } catch (err) {
      // Don't show error toast for abort
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }

      const previewError = err instanceof Error ? err : new Error('Preview failed');
      setError(previewError);

      // Show error toast (AC#7)
      toast({
        title: 'Preview Failed',
        description: 'PDF generation failed. Try Excel/CSV.',
        variant: 'destructive',
      });

      throw previewError;
    } finally {
      setIsPreviewing(false);
      abortControllerRef.current = null;
    }
  }, [toast]);

  /**
   * Cancel ongoing preview request
   */
  const cancelPreview = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPreviewing(false);
  }, []);

  return {
    exportData,
    previewPdf,
    cancelPreview,
    isExporting,
    isPreviewing,
    error,
  };
}
