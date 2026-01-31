/**
 * Campaign Export Dropdown Component
 * Story 5.9: Campaign Export
 *
 * AC#1: Export Button Placement - shows download icon in header
 * AC#2: Export Format Options - Excel (.xlsx), CSV (.csv)
 * AC#6: Loading State - spinner during export
 * AC#10: Large Dataset Confirmation - confirmation for >100 campaigns
 * AC#11: Accessibility - keyboard accessible, aria-labels
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useExportCampaigns, type CampaignExportFormat } from '@/hooks/use-export-campaigns';

// ===========================================
// Constants
// ===========================================

/**
 * Threshold for showing large export confirmation
 * AC#10: >100 campaigns triggers confirmation
 */
const LARGE_EXPORT_THRESHOLD = 100;

// ===========================================
// Types
// ===========================================

export interface CampaignExportDropdownProps {
  /** Start date filter (ISO format) */
  dateFrom?: string;
  /** End date filter (ISO format) */
  dateTo?: string;
  /** Number of campaigns available to export (for confirmation dialog) */
  campaignCount?: number;
  /** Whether export is disabled externally (e.g., data still loading) */
  disabled?: boolean;
}

// ===========================================
// Component
// ===========================================

/**
 * Export dropdown for campaign data
 * Shows Excel and CSV options with loading state and large export confirmation.
 *
 * Features:
 * - AC#1: FileDown icon in header
 * - AC#2: Excel first, then CSV
 * - AC#6: Loading spinner during export
 * - AC#10: Confirmation for >100 campaigns
 * - AC#11: Full keyboard and screen reader accessibility
 *
 * @example
 * ```tsx
 * <CampaignExportDropdown
 *   dateFrom={dateFrom}
 *   dateTo={dateTo}
 *   campaignCount={campaigns.length}
 *   disabled={isLoading}
 * />
 * ```
 */
export function CampaignExportDropdown({
  dateFrom,
  dateTo,
  campaignCount = 0,
  disabled = false,
}: CampaignExportDropdownProps) {
  const { exportCampaigns, isExporting } = useExportCampaigns({ dateFrom, dateTo });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<CampaignExportFormat | null>(null);

  const isDisabled = disabled || isExporting;

  /**
   * Handle export option click
   * AC#10: Shows confirmation for large exports
   */
  const handleExport = (format: CampaignExportFormat) => {
    if (campaignCount > LARGE_EXPORT_THRESHOLD) {
      setPendingFormat(format);
      setShowConfirmDialog(true);
      return;
    }
    void exportCampaigns(format);
  };

  /**
   * Handle confirmation dialog confirm
   */
  const handleConfirmExport = () => {
    if (pendingFormat) {
      void exportCampaigns(pendingFormat);
    }
    setShowConfirmDialog(false);
    setPendingFormat(null);
  };

  /**
   * Handle confirmation dialog cancel
   */
  const handleCancelExport = () => {
    setShowConfirmDialog(false);
    setPendingFormat(null);
  };

  return (
    <>
      {/* AC#11: Screen reader announcement for export status */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {isExporting ? 'Exporting campaigns...' : ''}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDisabled}
            className="gap-2"
            aria-label={
              isExporting
                ? 'Exporting campaigns...'
                : `Export ${campaignCount} campaign${campaignCount !== 1 ? 's' : ''}`
            }
            aria-busy={isExporting}
            data-testid="campaign-export-dropdown-trigger"
          >
            {/* AC#1: FileDown icon, AC#6: Loader during export */}
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <FileDown className="h-4 w-4" aria-hidden="true" />
            )}
            {/* AC#6: "Exporting..." text during export */}
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" data-testid="campaign-export-dropdown-content">
          {/* AC#2: Excel is first option */}
          <DropdownMenuItem
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            aria-label="Export to Excel"
            data-testid="campaign-export-option-excel"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
            Export to Excel (.xlsx)
          </DropdownMenuItem>
          {/* AC#2: CSV is second option */}
          <DropdownMenuItem
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            aria-label="Export to CSV"
            data-testid="campaign-export-option-csv"
          >
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            Export to CSV (.csv)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AC#10: Large export confirmation dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent data-testid="campaign-export-confirmation-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Export {campaignCount} campaigns?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to export a large number of campaigns. This may take a moment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelExport}
              data-testid="campaign-export-confirmation-cancel"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExport}
              data-testid="campaign-export-confirmation-confirm"
            >
              Export
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
