/**
 * Export All Button Component
 * Technical Debt: Export All Feature (Story 4-10 Task 6)
 *
 * AC#5: Export All Visible (Alternative)
 * - Appears when no leads are selected
 * - Exports all leads matching current filters
 * - Shows confirmation for large datasets (>500 leads)
 * - Respects current sort order
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
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useExportAllLeads, type ExportFormat } from '@/hooks/use-export-all-leads';
import type { LeadsQueryParams } from '@/types/lead';

// ===========================================
// Constants
// ===========================================

/**
 * Threshold for showing large dataset confirmation
 * AC#5: >500 leads triggers confirmation
 */
const LARGE_DATASET_THRESHOLD = 500;

// ===========================================
// Types
// ===========================================

interface ExportAllButtonProps {
  /** Current filter parameters (without pagination) */
  filters: Omit<LeadsQueryParams, 'page' | 'limit'>;
  /** Total count of leads matching filters */
  totalCount: number;
  /** Whether button is disabled externally */
  disabled?: boolean;
  /** Render as icon-only (for mobile) */
  iconOnly?: boolean;
}

// ===========================================
// Component
// ===========================================

/**
 * Export All button for table toolbar
 * Exports all leads matching current filters to Excel or CSV.
 *
 * Features:
 * - Dropdown with Excel and CSV options
 * - Loading state with progress
 * - Confirmation dialog for large datasets
 * - Keyboard accessible
 *
 * @example
 * ```tsx
 * <ExportAllButton
 *   filters={{ status: ['new'], search: 'test' }}
 *   totalCount={150}
 * />
 * ```
 */
export function ExportAllButton({
  filters,
  totalCount,
  disabled,
  iconOnly = false,
}: ExportAllButtonProps) {
  const { isExporting, progress, exportAllLeads } = useExportAllLeads();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);

  const isDisabled = disabled || isExporting || totalCount === 0;

  /**
   * Handle export option click
   * Shows confirmation for large datasets
   */
  const handleExport = (format: ExportFormat) => {
    if (totalCount > LARGE_DATASET_THRESHOLD) {
      setPendingFormat(format);
      setShowConfirmation(true);
      return;
    }
    void exportAllLeads(filters, format);
  };

  /**
   * Handle confirmation dialog confirm
   */
  const handleConfirmExport = () => {
    if (pendingFormat) {
      void exportAllLeads(filters, pendingFormat);
    }
    setShowConfirmation(false);
    setPendingFormat(null);
  };

  /**
   * Get button label based on state
   */
  const getButtonLabel = () => {
    if (isExporting && progress) {
      return `Exporting ${progress.loaded}/${progress.total}...`;
    }
    return `Export All (${totalCount})`;
  };

  return (
    <>
      {/* Screen reader announcement */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {isExporting
          ? `Exporting ${progress?.loaded ?? 0} of ${progress?.total ?? totalCount} leads...`
          : ''}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size={iconOnly ? 'icon' : 'sm'}
            disabled={isDisabled}
            className={iconOnly ? '' : 'gap-2'}
            aria-label={
              isExporting
                ? 'Exporting all leads...'
                : `Export all ${totalCount} lead${totalCount !== 1 ? 's' : ''}`
            }
            aria-busy={isExporting}
            data-testid="export-all-button"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {!iconOnly && getButtonLabel()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" data-testid="export-all-dropdown-content">
          <DropdownMenuItem
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            data-testid="export-all-option-excel"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
            Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            data-testid="export-all-option-csv"
          >
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            CSV (.csv)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Large dataset confirmation dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export {totalCount} leads?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to export a large dataset. This may take a moment and
              generate a large file. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExport}>
              Export anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
