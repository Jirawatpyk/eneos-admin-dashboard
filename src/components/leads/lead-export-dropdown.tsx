/**
 * Lead Export Dropdown Component
 * Story 4.10: Quick Export
 *
 * AC#1: Export Button in Selection Toolbar - with download icon, shows count
 * AC#2: Export Format Options - Excel (.xlsx), CSV
 * AC#6: Export Progress Feedback - loading spinner, disabled during export
 * AC#8: Large Selection Warning - confirmation for >100 leads
 * AC#10: Accessibility - keyboard accessible
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
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useExportLeads, type ExportFormat } from '@/hooks/use-export-leads';
import { ExportConfirmationDialog } from './export-confirmation-dialog';
import type { Lead } from '@/types/lead';

// ===========================================
// Constants
// ===========================================

/**
 * Threshold for showing large selection confirmation
 * AC#8: >100 leads triggers confirmation
 */
const LARGE_SELECTION_THRESHOLD = 100;

// ===========================================
// Types
// ===========================================

interface LeadExportDropdownProps {
  /** Leads to export */
  leads: Lead[];
  /** Whether export is disabled externally */
  disabled?: boolean;
}

// ===========================================
// Component
// ===========================================

/**
 * Export dropdown for selected leads
 * Shows Excel and CSV options with loading state and large selection confirmation.
 *
 * Features:
 * - AC#1: Download icon, shows "Export ({count})"
 * - AC#2: Excel first, then CSV
 * - AC#6: Loading spinner during export
 * - AC#8: Confirmation for >100 leads
 *
 * @example
 * ```tsx
 * <LeadExportDropdown
 *   leads={selectedLeads}
 *   disabled={selectedLeads.length === 0}
 * />
 * ```
 */
export function LeadExportDropdown({ leads, disabled }: LeadExportDropdownProps) {
  const { exportLeads, isExporting } = useExportLeads();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);

  const isDisabled = disabled || isExporting || leads.length === 0;

  /**
   * Handle export option click
   * AC#8: Shows confirmation for large selections
   */
  const handleExport = (format: ExportFormat) => {
    if (leads.length > LARGE_SELECTION_THRESHOLD) {
      setPendingFormat(format);
      setShowConfirmation(true);
      return;
    }
    void exportLeads(leads, format);
  };

  /**
   * Handle confirmation dialog confirm
   */
  const handleConfirmExport = () => {
    if (pendingFormat) {
      void exportLeads(leads, pendingFormat);
    }
    setShowConfirmation(false);
    setPendingFormat(null);
  };

  return (
    <>
      {/* AC#10: Screen reader announcement for export status */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {isExporting ? `Exporting ${leads.length} leads...` : ''}
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
                ? 'Exporting leads...'
                : `Export ${leads.length} lead${leads.length !== 1 ? 's' : ''}`
            }
            aria-busy={isExporting}
            data-testid="lead-export-dropdown-trigger"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            Export ({leads.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" data-testid="lead-export-dropdown-content">
          {/* AC#2: Excel is first/default option */}
          <DropdownMenuItem
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            data-testid="lead-export-option-excel"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
            Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            data-testid="lead-export-option-csv"
          >
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            CSV (.csv)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AC#8: Large selection confirmation */}
      <ExportConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        count={leads.length}
        onConfirm={handleConfirmExport}
      />
    </>
  );
}
