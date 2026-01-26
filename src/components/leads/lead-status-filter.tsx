/**
 * Lead Status Filter Component
 * Story 4.4: Filter by Status
 *
 * AC#1: Filter Dropdown Display
 * - Shows "Status" filter dropdown next to search
 * - Displays filter icon (lucide-react Filter)
 *
 * AC#2: Status Options
 * - All 6 statuses with colored badges
 * - "All Statuses" option at top
 *
 * AC#3: Multi-Select Filter
 * - Toggle selection on click
 * - Checkmarks for selected items
 * - "X selected" indicator
 *
 * AC#8: Filter Badge/Indicator
 * - Visual indicator when filter active
 * - Quick clear (X) button
 *
 * AC#9: Accessibility
 * - Keyboard navigation with Enter/Space
 * - Arrow key navigation
 * - Screen reader announcements
 */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { LeadStatusBadge } from './lead-status-badge';
import { LEAD_STATUS_OPTIONS } from '@/lib/leads-constants';
import type { LeadStatus } from '@/types/lead';

interface LeadStatusFilterProps {
  /** Currently selected statuses (empty = all) */
  value: LeadStatus[];
  /** Callback when selection changes */
  onChange: (statuses: LeadStatus[]) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Story 4.16: Full width button for mobile filter sheet */
  fullWidth?: boolean;
}

export function LeadStatusFilter({
  value,
  onChange,
  className,
  disabled = false,
  fullWidth = false,
}: LeadStatusFilterProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedCount = value.length;
  const hasSelection = selectedCount > 0;

  // AC#3: Toggle status on click (add/remove from array)
  const toggleStatus = useCallback(
    (status: LeadStatus) => {
      if (value.includes(status)) {
        onChange(value.filter((s) => s !== status));
      } else {
        onChange([...value, status]);
      }
    },
    [value, onChange]
  );

  // AC#6: Handle "All Statuses" to clear selection
  const clearAll = useCallback(() => {
    onChange([]);
    setOpen(false);
  }, [onChange]);

  // AC#8: Quick clear button handler
  const handleQuickClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
    },
    [onChange]
  );

  // AC#9: Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalOptions = LEAD_STATUS_OPTIONS.length + 1; // +1 for "All Statuses"

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % totalOptions);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex === 0) {
            clearAll();
          } else if (focusedIndex > 0) {
            const statusIndex = focusedIndex - 1;
            toggleStatus(LEAD_STATUS_OPTIONS[statusIndex].value);
          }
          break;
        case 'Escape':
          setOpen(false);
          break;
      }
    },
    [focusedIndex, clearAll, toggleStatus]
  );

  // Focus management for keyboard navigation
  useEffect(() => {
    if (open && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.focus();
    }
  }, [open, focusedIndex]);

  // Reset focus when popover opens
  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
    }
  }, [open]);

  // AC#1: Get display text for button
  const getButtonText = () => {
    if (!hasSelection) return 'Status';
    if (selectedCount === 1) {
      const status = LEAD_STATUS_OPTIONS.find((o) => o.value === value[0]);
      return status?.labelTh || 'Status';
    }
    return `${selectedCount} selected`;
  };

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      data-testid="lead-status-filter"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* AC#1: Filter button with icon */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-9 border-dashed gap-2',
              hasSelection && 'border-primary bg-primary/5',
              fullWidth && 'w-full justify-start'
            )}
            disabled={disabled}
            aria-label={`Filter by status${hasSelection ? `, ${selectedCount} selected` : ''}`}
            aria-expanded={open}
            aria-haspopup="listbox"
            data-testid="status-filter-trigger"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span>{getButtonText()}</span>
            {/* AC#8: Badge showing count when active */}
            {hasSelection && selectedCount > 1 && (
              <span
                className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground"
                aria-hidden="true"
              >
                {selectedCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={cn('p-2', fullWidth ? 'w-[var(--radix-popover-trigger-width)]' : 'w-56')}
          align="start"
          onKeyDown={handleKeyDown}
          role="listbox"
          aria-label="Status filter options"
          aria-multiselectable="true"
        >
          <div className="space-y-1">
            {/* AC#2: All Statuses option at top */}
            <button
              ref={(el) => {
                optionsRef.current[0] = el;
              }}
              type="button"
              className={cn(
                'flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent focus:bg-accent focus:outline-none',
                focusedIndex === 0 && 'bg-accent'
              )}
              onClick={clearAll}
              role="option"
              aria-selected={!hasSelection}
              data-testid="status-option-all"
            >
              <span className="flex-1 text-left font-medium">All Statuses</span>
              {!hasSelection && (
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
            </button>

            {/* Divider */}
            <div className="my-1 h-px bg-border" role="separator" />

            {/* AC#2: Status options with colored badges */}
            {LEAD_STATUS_OPTIONS.map((option, index) => {
              const isSelected = value.includes(option.value);
              const optionIndex = index + 1; // +1 because "All Statuses" is at index 0

              return (
                <button
                  ref={(el) => {
                    optionsRef.current[optionIndex] = el;
                  }}
                  type="button"
                  key={option.value}
                  className={cn(
                    'flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent focus:bg-accent focus:outline-none',
                    focusedIndex === optionIndex && 'bg-accent'
                  )}
                  onClick={() => toggleStatus(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  data-testid={`status-option-${option.value}`}
                >
                  {/* AC#2: Status badge with color */}
                  <span className="flex-1">
                    <LeadStatusBadge status={option.value} />
                  </span>
                  {/* AC#3: Checkmark for selected items */}
                  {isSelected && (
                    <Check
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* AC#8: Active filter indicator with clear button */}
      {hasSelection && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleQuickClear}
          aria-label={`Clear status filter (${selectedCount} selected)`}
          data-testid="status-filter-clear"
        >
          <span className="mr-1">{selectedCount} selected</span>
          <X className="h-3 w-3" aria-hidden="true" />
        </Button>
      )}

      {/* AC#9: ARIA live region for screen reader announcements */}
      <span
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="status-filter-announcement"
      >
        {hasSelection
          ? `${selectedCount} status${selectedCount > 1 ? 'es' : ''} selected`
          : 'No status filter active, showing all leads'}
      </span>
    </div>
  );
}
