/**
 * Export All Leads Hook
 * Technical Debt: Export All Feature (Story 4-10 Task 6)
 *
 * Provides functionality to export all leads matching current filters.
 * Handles loading state, progress tracking, and error handling.
 */
'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { fetchAllLeadsForExport, ExportAllError } from '@/lib/api/export-all-leads';
import { exportLeadsToExcel, exportLeadsToCSV } from '@/lib/export-leads';
import type { LeadsQueryParams } from '@/types/lead';

export type ExportFormat = 'excel' | 'csv';

interface ExportProgress {
  loaded: number;
  total: number;
}

interface UseExportAllLeadsReturn {
  /** Whether export is in progress */
  isExporting: boolean;
  /** Current export progress */
  progress: ExportProgress | null;
  /** Export all leads with current filters */
  exportAllLeads: (
    filters: Omit<LeadsQueryParams, 'page' | 'limit'>,
    format: ExportFormat
  ) => Promise<void>;
}

/**
 * Hook for exporting all filtered leads
 *
 * @example
 * ```tsx
 * const { isExporting, progress, exportAllLeads } = useExportAllLeads();
 *
 * const handleExportAll = () => {
 *   exportAllLeads({ status: ['new'], search: 'test' }, 'excel');
 * };
 * ```
 */
export function useExportAllLeads(): UseExportAllLeadsReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  const exportAllLeads = useCallback(
    async (
      filters: Omit<LeadsQueryParams, 'page' | 'limit'>,
      format: ExportFormat
    ): Promise<void> => {
      setIsExporting(true);
      setProgress({ loaded: 0, total: 0 });

      try {
        // Fetch all leads with progress tracking
        const { leads, total } = await fetchAllLeadsForExport(
          filters,
          (loaded, totalCount) => {
            setProgress({ loaded, total: totalCount });
          }
        );

        if (leads.length === 0) {
          toast({
            title: 'No leads to export',
            description: 'No leads match the current filters.',
            variant: 'destructive',
          });
          return;
        }

        // Export based on format
        if (format === 'excel') {
          exportLeadsToExcel(leads);
        } else {
          exportLeadsToCSV(leads);
        }

        toast({
          title: 'Export complete',
          description: `Exported ${total} lead${total !== 1 ? 's' : ''} to ${format === 'excel' ? 'Excel' : 'CSV'}.`,
        });
      } catch (error) {
        console.error('Export all leads error:', error);

        const message =
          error instanceof ExportAllError
            ? error.message
            : 'Failed to export leads. Please try again.';

        toast({
          title: 'Export failed',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
        setProgress(null);
      }
    },
    []
  );

  return {
    isExporting,
    progress,
    exportAllLeads,
  };
}
