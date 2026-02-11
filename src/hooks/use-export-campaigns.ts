/**
 * Export Campaigns Hook
 * Story 5.9: Campaign Export
 *
 * AC#3: Export with Current Filters - respects dateFrom/dateTo
 * AC#6: Loading State - isExporting state
 * AC#7: Success Feedback - toast notification on success
 * AC#8: Empty Data Handling - info toast for no data
 * AC#9: Error Handling - error toast on failure
 *
 * Manages export state, fetches data, and triggers download with user feedback.
 */
'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchCampaignStats } from '@/lib/api/campaigns';
import { exportCampaignsToExcel, exportCampaignsToCSV } from '@/lib/export-campaigns';
import type { CampaignStatsItem } from '@/types/campaigns';

// ===========================================
// Constants
// ===========================================

/**
 * Brief delay to show loading state for better UX feedback
 * Without this, exports complete too fast for users to see the spinner
 */
const EXPORT_UI_DELAY_MS = 100;

/**
 * Maximum number of campaigns to fetch for export
 * Backend MAX_LIMIT is 100 — exceeding this causes 400 Bad Request
 */
const EXPORT_FETCH_LIMIT = 100;

// ===========================================
// Types
// ===========================================

/**
 * Export format options
 */
export type CampaignExportFormat = 'excel' | 'csv';

/**
 * Hook options
 */
export interface UseExportCampaignsOptions {
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Hook return type
 */
export interface UseExportCampaignsReturn {
  /** Export campaigns to specified format */
  exportCampaigns: (format: CampaignExportFormat) => Promise<void>;
  /** Whether export is in progress */
  isExporting: boolean;
}

// ===========================================
// Hook Implementation
// ===========================================

/**
 * Hook for exporting campaign data to Excel or CSV
 *
 * Features:
 * - AC#3: Fetches campaigns with date filter applied
 * - AC#6: Loading state during export
 * - AC#7: Success toast notification
 * - AC#8: Info toast when no campaigns to export
 * - AC#9: Error toast on failure
 *
 * @param options - Date filter options
 * @returns Export function and loading state
 *
 * @example
 * ```tsx
 * const { exportCampaigns, isExporting } = useExportCampaigns({
 *   dateFrom: '2026-01-01',
 *   dateTo: '2026-01-31',
 * });
 *
 * <Button
 *   onClick={() => exportCampaigns('excel')}
 *   disabled={isExporting}
 * >
 *   {isExporting ? <Loader2 className="animate-spin" /> : 'Export'}
 * </Button>
 * ```
 */
export function useExportCampaigns(
  options: UseExportCampaignsOptions = {}
): UseExportCampaignsReturn {
  const { dateFrom, dateTo } = options;
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  /**
   * Export campaigns to specified format
   * AC#6: Shows loading state during generation
   * AC#7: Shows toast notification on success
   * AC#8: Shows info toast for empty data
   * AC#9: Shows error toast on failure
   */
  const exportCampaigns = useCallback(
    async (format: CampaignExportFormat) => {
      setIsExporting(true);

      try {
        // AC#3: Fetch all campaigns matching current filter
        const response = await fetchCampaignStats({
          limit: EXPORT_FETCH_LIMIT,
          dateFrom,
          dateTo,
        });

        const campaigns: CampaignStatsItem[] = response.data.data;

        // AC#8: Handle empty results
        if (campaigns.length === 0) {
          toast({
            title: 'No campaigns to export',
            description: 'There are no campaigns matching your current filters.',
          });
          return;
        }

        // Small delay for UX (shows loading state)
        await new Promise((resolve) => setTimeout(resolve, EXPORT_UI_DELAY_MS));

        // Generate export file
        if (format === 'excel') {
          exportCampaignsToExcel(campaigns, dateFrom, dateTo);
        } else {
          exportCampaignsToCSV(campaigns, dateFrom, dateTo);
        }

        // AC#7: Success toast
        toast({
          title: 'Export complete',
          description: `Exported ${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''} to ${format === 'excel' ? 'Excel' : 'CSV'}.`,
        });
      } catch (error) {
        // AC#9: Error handling
        console.error('Campaign export failed:', error);

        toast({
          title: 'Export failed',
          description: 'Please try again. If the problem persists, contact support.',
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    },
    [dateFrom, dateTo, toast]
  );

  return {
    exportCampaigns,
    isExporting,
  };
}
