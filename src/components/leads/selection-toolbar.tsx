/**
 * Selection Toolbar Component
 * Story 4.9: Bulk Select - AC#4, AC#5
 * Story 4.10: Quick Export - AC#1 (Export button in toolbar)
 *
 * Features:
 * - AC#4: Display selection count "{count} leads selected"
 * - AC#4: Show "Clear selection" button
 * - AC#4: Subtle background color (bg-blue-50)
 * - AC#5: Clear all selections when button clicked
 * - Story 4.10 AC#1: Export button with count after selection
 * - Smooth enter/exit animation
 */
'use client';

import { Button } from '@/components/ui/button';
import { X, CheckSquare } from 'lucide-react';
import { LeadExportDropdown } from './lead-export-dropdown';
import type { Lead } from '@/types/lead';

// ===========================================
// Types
// ===========================================

interface SelectionToolbarProps {
  /** Number of selected leads */
  selectedCount: number;
  /** Selected leads data for export (Story 4.10) */
  selectedLeads: Lead[];
  /** Called when clear selection button is clicked */
  onClearSelection: () => void;
}

// ===========================================
// Component
// ===========================================

/**
 * Toolbar displayed above the table when items are selected
 * Story 4.10 AC#1: Export button positioned after selection count
 *
 * @example
 * ```tsx
 * <SelectionToolbar
 *   selectedCount={5}
 *   selectedLeads={leadsToExport}
 *   onClearSelection={() => clearSelection()}
 * />
 * ```
 */
export function SelectionToolbar({
  selectedCount,
  selectedLeads,
  onClearSelection,
}: SelectionToolbarProps) {
  // Don't render if nothing is selected
  if (selectedCount === 0) return null;

  return (
    <div
      className="flex items-center justify-between px-4 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg animate-in slide-in-from-top-2 duration-200"
      role="toolbar"
      aria-label="Selection actions"
      data-testid="selection-toolbar"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
        <CheckSquare className="h-4 w-4" aria-hidden="true" />
        <span data-testid="selection-count">
          {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        {/* Story 4.10 AC#1: Export dropdown after selection count */}
        <LeadExportDropdown leads={selectedLeads} />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900"
          data-testid="clear-selection-button"
        >
          <X className="h-4 w-4 mr-1" aria-hidden="true" />
          Clear selection
        </Button>
      </div>
    </div>
  );
}
