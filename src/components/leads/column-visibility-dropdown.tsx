/**
 * Column Visibility Dropdown Component
 * Technical Debt: Table Column Toggle Feature
 *
 * Allows users to show/hide columns in the lead table.
 * Persists preferences to localStorage.
 */
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Columns, RotateCcw } from 'lucide-react';
import {
  COLUMN_DEFINITIONS,
  TOGGLEABLE_COLUMNS,
} from '@/hooks/use-column-visibility';

// ===========================================
// Types
// ===========================================

interface ColumnVisibilityDropdownProps {
  /** Function to check if a column is visible */
  isColumnVisible: (columnId: string) => boolean;
  /** Function to toggle column visibility */
  toggleColumnVisibility: (columnId: string) => void;
  /** Function to reset all columns to visible */
  resetColumnVisibility: () => void;
  /** Number of hidden columns */
  hiddenColumnCount: number;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
}

// ===========================================
// Component
// ===========================================

/**
 * Dropdown for toggling column visibility
 * Shows checkboxes for each toggleable column with a reset option.
 *
 * Features:
 * - Checkbox for each column
 * - Badge showing hidden column count
 * - Reset to default option
 * - Keyboard accessible
 *
 * @example
 * ```tsx
 * <ColumnVisibilityDropdown
 *   isColumnVisible={isColumnVisible}
 *   toggleColumnVisibility={toggleColumnVisibility}
 *   resetColumnVisibility={resetColumnVisibility}
 *   hiddenColumnCount={2}
 * />
 * ```
 */
export function ColumnVisibilityDropdown({
  isColumnVisible,
  toggleColumnVisibility,
  resetColumnVisibility,
  hiddenColumnCount,
  disabled,
}: ColumnVisibilityDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2"
          aria-label={`Toggle column visibility. ${hiddenColumnCount} column${hiddenColumnCount !== 1 ? 's' : ''} hidden.`}
          data-testid="column-visibility-trigger"
        >
          <Columns className="h-4 w-4" aria-hidden="true" />
          Columns
          {hiddenColumnCount > 0 && (
            <span className="ml-1 rounded-full bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
              {hiddenColumnCount} hidden
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48"
        data-testid="column-visibility-content"
      >
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {TOGGLEABLE_COLUMNS.map((columnId) => (
          <DropdownMenuCheckboxItem
            key={columnId}
            checked={isColumnVisible(columnId)}
            onCheckedChange={() => toggleColumnVisibility(columnId)}
            data-testid={`column-visibility-${columnId}`}
          >
            {COLUMN_DEFINITIONS[columnId]}
          </DropdownMenuCheckboxItem>
        ))}

        {hiddenColumnCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={resetColumnVisibility}
              className="text-blue-600 dark:text-blue-400"
              data-testid="column-visibility-reset"
            >
              <RotateCcw className="mr-2 h-3 w-3" aria-hidden="true" />
              Reset to default
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
