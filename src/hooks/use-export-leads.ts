/**
 * Export Leads Hook
 * Story 4.10: Quick Export
 *
 * AC#6: Export Progress Feedback - loading state during generation
 * AC#7: Download Handling - triggers browser download, toast notifications
 *
 * Manages export state and triggers download with user feedback.
 */
'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { exportLeadsToExcel, exportLeadsToCSV } from '@/lib/export-leads';
import type { Lead } from '@/types/lead';

// ===========================================
// Constants
// ===========================================

/**
 * Brief delay to show loading state for better UX feedback
 * Without this, exports complete too fast for users to see the spinner
 */
const EXPORT_UI_DELAY_MS = 100;

// ===========================================
// Types
// ===========================================

/**
 * Export format options
 */
export type ExportFormat = 'excel' | 'csv';

/**
 * Hook return type
 */
export interface UseExportLeadsReturn {
  /** Export leads to specified format */
  exportLeads: (leads: Lead[], format: ExportFormat) => Promise<void>;
  /** Whether export is in progress */
  isExporting: boolean;
}

// ===========================================
// Hook Implementation
// ===========================================

/**
 * Hook for exporting lead data to Excel or CSV
 *
 * Features:
 * - AC#6: Loading state during export generation
 * - AC#7: Success/error toast notifications
 * - Handles empty lead array with warning
 *
 * @example
 * ```tsx
 * const { exportLeads, isExporting } = useExportLeads();
 *
 * <Button
 *   onClick={() => exportLeads(selectedLeads, 'excel')}
 *   disabled={isExporting}
 * >
 *   {isExporting ? <Loader2 className="animate-spin" /> : 'Export'}
 * </Button>
 * ```
 */
export function useExportLeads(): UseExportLeadsReturn {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  /**
   * Export leads to specified format
   * AC#6: Shows loading state during generation
   * AC#7: Shows toast notification on success/failure
   */
  const exportLeads = useCallback(
    async (leads: Lead[], format: ExportFormat) => {
      // Check for empty array
      if (leads.length === 0) {
        toast({
          title: 'No leads to export',
          description: 'Please select leads to export.',
          variant: 'destructive',
        });
        return;
      }

      setIsExporting(true);

      try {
        // Small delay for UX (shows loading state)
        await new Promise((resolve) => setTimeout(resolve, EXPORT_UI_DELAY_MS));

        if (format === 'excel') {
          exportLeadsToExcel(leads);
        } else {
          exportLeadsToCSV(leads);
        }

        // AC#7: Success toast
        toast({
          title: 'Export complete',
          description: `Exported ${leads.length} lead${leads.length !== 1 ? 's' : ''} to ${format === 'excel' ? 'Excel' : 'CSV'}.`,
        });
      } catch (error) {
        console.error('Export failed:', error);

        // AC#7: Error toast with retry suggestion
        toast({
          title: 'Export failed',
          description: 'Unable to generate export file. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    },
    [toast]
  );

  return {
    exportLeads,
    isExporting,
  };
}
