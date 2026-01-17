/**
 * Export Individual Performance Hook
 * Story 3.8: Export Individual Performance Report
 *
 * AC#6: Export Progress Feedback - loading state during generation
 * AC#7: Download Handling - triggers browser download, toast notifications
 *
 * Manages export state and triggers download with user feedback.
 */
'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { exportIndividualToExcel, type ExportTargetData } from '@/lib/export-utils';
import { useSalesPeriodFilter } from '@/hooks/use-sales-period-filter';
import type { SalesPersonMetrics } from '@/types/sales';

/**
 * Hook return type
 */
export interface UseExportIndividualReturn {
  /** Export to Excel format */
  exportToExcel: (data: SalesPersonMetrics, target?: ExportTargetData) => Promise<void>;
  /** Export to PDF format (placeholder for future) */
  exportToPDF: (data: SalesPersonMetrics) => void;
  /** Whether export is in progress */
  isExporting: boolean;
}

/**
 * Hook for exporting individual sales person performance report
 *
 * @example
 * ```tsx
 * const { exportToExcel, isExporting } = useExportIndividual();
 *
 * <Button
 *   onClick={() => exportToExcel(salesPerson)}
 *   disabled={isExporting}
 * >
 *   {isExporting ? <Loader2 className="animate-spin" /> : 'Export'}
 * </Button>
 * ```
 */
export function useExportIndividual(): UseExportIndividualReturn {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { period, from, to } = useSalesPeriodFilter();

  /**
   * Export to Excel format
   * AC#6: Shows loading state during generation
   * AC#7: Shows toast notification on success/failure
   */
  const exportToExcel = useCallback(
    async (data: SalesPersonMetrics, target?: ExportTargetData) => {
      setIsExporting(true);

      try {
        await exportIndividualToExcel(data, { period, from, to }, target);

        toast({
          title: 'Report downloaded',
          description: `${data.name}'s performance report has been exported.`,
        });
      } catch (error) {
        console.error('Export failed:', error);

        toast({
          title: 'Export failed',
          description: 'Unable to generate report. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    },
    [period, from, to, toast]
  );

  /**
   * Export to PDF format
   * AC#4: Optional Enhancement - PDF export (placeholder)
   */
  const exportToPDF = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_data: SalesPersonMetrics) => {
      toast({
        title: 'Coming Soon',
        description: 'PDF export will be available in a future update.',
      });
    },
    [toast]
  );

  return {
    exportToExcel,
    exportToPDF,
    isExporting,
  };
}
