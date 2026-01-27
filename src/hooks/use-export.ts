import { useState } from 'react';
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

export interface UseExportReturn {
  exportData: (params: ExportParams) => Promise<void>;
  isExporting: boolean;
  error: Error | null;
}

/**
 * Custom hook for exporting lead data
 * Task 3: Export button logic
 */
export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const exportData = async (params: ExportParams) => {
    setIsExporting(true);
    setError(null);

    try {
      // Build query params
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

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/i);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `leads-export-${new Date().getTime()}.${params.format}`;

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
      const error = err instanceof Error ? err : new Error('Export failed');
      setError(error);

      // Show error toast
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting,
    error,
  };
}
