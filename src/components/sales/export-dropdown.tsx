/**
 * Export Dropdown Component
 * Story 3.8: Export Individual Performance Report
 *
 * AC#1: Export Button - visible but not dominant, with download icon
 * AC#2: Export Format Options - Excel first, PDF (disabled)
 * AC#6: Export Progress Feedback - loading indicator, disabled during generation
 * AC#9: Empty Data Handling - disabled with tooltip when no data
 * AC#10: Accessibility - keyboard accessible, aria labels, screen reader announcements
 */
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useExportIndividual } from '@/hooks/use-export-individual';
import type { SalesPersonMetrics } from '@/types/sales';
import type { ExportTargetData } from '@/lib/export-utils';

interface ExportDropdownProps {
  /** Sales person data to export */
  data: SalesPersonMetrics;
  /** Optional target comparison data */
  target?: ExportTargetData;
  /** Whether export should be disabled (e.g., no data for period) */
  disabled?: boolean;
  /** Reason why export is disabled (shown in tooltip) */
  disabledReason?: string;
}

/**
 * Export Dropdown Component
 * Provides options to export individual performance report to different formats.
 *
 * @example
 * ```tsx
 * <ExportDropdown
 *   data={salesPerson}
 *   disabled={salesPerson.claimed === 0}
 *   disabledReason="No data for this period"
 * />
 * ```
 */
export function ExportDropdown({
  data,
  target,
  disabled = false,
  disabledReason,
}: ExportDropdownProps) {
  const { exportToExcel, exportToPDF, isExporting } = useExportIndividual();

  const isDisabled = disabled || isExporting;

  // Button content with loading state
  const buttonContent = (
    <Button
      variant="outline"
      size="sm"
      disabled={isDisabled}
      aria-label={
        isExporting
          ? 'Exporting report...'
          : disabled
            ? disabledReason ?? 'Export not available'
            : 'Export report'
      }
      aria-busy={isExporting}
      data-testid="export-dropdown-trigger"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="ml-2 hidden sm:inline">Export</span>
    </Button>
  );

  // If disabled, wrap in tooltip to show reason
  if (disabled && disabledReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{buttonContent}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{disabledReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{buttonContent}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="export-dropdown-content">
        <DropdownMenuItem
          onClick={() => exportToExcel(data, target)}
          disabled={isExporting}
          data-testid="export-option-excel"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" aria-hidden="true" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportToPDF(data)}
          disabled
          data-testid="export-option-pdf"
        >
          <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
          PDF (Coming Soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
