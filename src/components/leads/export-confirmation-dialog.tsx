/**
 * Export Confirmation Dialog Component
 * Story 4.10: Quick Export - AC#8
 *
 * Shows a confirmation dialog when exporting large numbers of leads.
 * - AC#8: Confirmation for >100 leads selected
 */
'use client';

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

// ===========================================
// Types
// ===========================================

interface ExportConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Number of leads to be exported */
  count: number;
  /** Callback when user confirms export */
  onConfirm: () => void;
}

// ===========================================
// Component
// ===========================================

/**
 * Confirmation dialog for large selection exports
 * AC#8: Shows when exporting >100 leads
 *
 * @example
 * ```tsx
 * <ExportConfirmationDialog
 *   open={showConfirmation}
 *   onOpenChange={setShowConfirmation}
 *   count={150}
 *   onConfirm={handleConfirmExport}
 * />
 * ```
 */
export function ExportConfirmationDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
}: ExportConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="export-confirmation-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Export {count} leads?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to export a large number of leads. This may take a moment
            and result in a larger file size.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="export-confirmation-cancel">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            data-testid="export-confirmation-confirm"
          >
            Export anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
