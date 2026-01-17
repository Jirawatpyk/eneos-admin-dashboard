/**
 * Lead Owner Filter Component
 * Story 4.5: Filter by Owner
 *
 * AC#1: Owner Filter Display
 * - Shows "Owner" filter dropdown next to status filter
 * - Displays user icon (lucide-react User icon)
 * - Shows "All Owners" by default
 *
 * AC#2: Owner Options
 * - "Unassigned" option at top (leads without owner)
 * - All sales team members from API
 * - "All Owners" option to clear filter
 *
 * AC#3: Multi-Select Filter
 * - Toggle selection on click
 * - Checkmarks for selected items
 * - "X selected" indicator
 *
 * AC#7: Clear Filter
 * - Quick clear (X) button when filter active
 *
 * AC#9: Accessibility
 * - Keyboard navigation with Enter/Space
 * - Arrow key navigation
 * - Screen reader announcements
 */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { User, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useSalesTeam } from '@/hooks/use-sales-team';
import { UNASSIGNED_VALUE } from '@/hooks/use-owner-filter-params';

interface LeadOwnerFilterProps {
  /** Currently selected owner IDs (empty = all) */
  value: string[];
  /** Callback when selection changes */
  onChange: (owners: string[]) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export function LeadOwnerFilter({
  value,
  onChange,
  className,
  disabled = false,
}: LeadOwnerFilterProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // AC#2: Fetch sales team members
  const { data: salesTeam, isLoading, isError } = useSalesTeam();

  const selectedCount = value.length;
  const hasSelection = selectedCount > 0;

  // Total options: "All Owners" + "Unassigned" + sales team members
  const totalOptions = 2 + (salesTeam?.length || 0);

  // AC#3: Toggle owner on click (add/remove from array)
  const toggleOwner = useCallback(
    (ownerId: string) => {
      if (value.includes(ownerId)) {
        onChange(value.filter((id) => id !== ownerId));
      } else {
        onChange([...value, ownerId]);
      }
    },
    [value, onChange]
  );

  // AC#7: Handle "All Owners" to clear selection
  const clearAll = useCallback(() => {
    onChange([]);
    setOpen(false);
  }, [onChange]);

  // AC#7: Quick clear button handler
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
            // "All Owners" option
            clearAll();
          } else if (focusedIndex === 1) {
            // "Unassigned" option
            toggleOwner(UNASSIGNED_VALUE);
          } else if (focusedIndex > 1 && salesTeam) {
            // Sales team member
            const memberIndex = focusedIndex - 2;
            if (memberIndex < salesTeam.length) {
              toggleOwner(salesTeam[memberIndex].id);
            }
          }
          break;
        case 'Escape':
          setOpen(false);
          break;
      }
    },
    [focusedIndex, totalOptions, clearAll, toggleOwner, salesTeam]
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
    if (!hasSelection) return 'Owner';
    if (selectedCount === 1) {
      // Show specific name for single selection
      if (value[0] === UNASSIGNED_VALUE) return 'Unassigned';
      const member = salesTeam?.find((m) => m.id === value[0]);
      return member?.name || 'Owner';
    }
    return `${selectedCount} selected`;
  };

  // Get owner name by ID (for accessibility labels)
  const getOwnerLabel = (ownerId: string): string => {
    if (ownerId === UNASSIGNED_VALUE) return 'Unassigned';
    return salesTeam?.find((m) => m.id === ownerId)?.name || ownerId;
  };

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      data-testid="lead-owner-filter"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* AC#1: Filter button with user icon */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-9 border-dashed gap-2',
              hasSelection && 'border-primary bg-primary/5'
            )}
            disabled={disabled}
            aria-label={`Filter by owner${hasSelection ? `, ${selectedCount} selected` : ''}`}
            aria-expanded={open}
            aria-haspopup="listbox"
            data-testid="owner-filter-trigger"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            <span>{getButtonText()}</span>
            {/* Badge showing count when active */}
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
          className="w-56 p-2"
          align="start"
          onKeyDown={handleKeyDown}
          role="listbox"
          aria-label="Owner filter options"
          aria-multiselectable="true"
        >
          <div className="space-y-1">
            {/* AC#2: All Owners option at top */}
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
              data-testid="owner-option-all"
            >
              <span className="flex-1 text-left font-medium">All Owners</span>
              {!hasSelection && (
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
            </button>

            {/* Divider */}
            <div className="my-1 h-px bg-border" role="separator" />

            {/* AC#2, AC#5: Unassigned option */}
            <button
              ref={(el) => {
                optionsRef.current[1] = el;
              }}
              type="button"
              className={cn(
                'flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent focus:bg-accent focus:outline-none',
                focusedIndex === 1 && 'bg-accent'
              )}
              onClick={() => toggleOwner(UNASSIGNED_VALUE)}
              role="option"
              aria-selected={value.includes(UNASSIGNED_VALUE)}
              data-testid="owner-option-unassigned"
            >
              <span className="flex-1 text-left text-muted-foreground italic">
                Unassigned
              </span>
              {value.includes(UNASSIGNED_VALUE) && (
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
            </button>

            {/* Divider */}
            <div className="my-1 h-px bg-border" role="separator" />

            {/* Loading state */}
            {isLoading && (
              <div
                className="px-2 py-1.5 text-sm text-muted-foreground"
                data-testid="owner-loading"
              >
                Loading team...
              </div>
            )}

            {/* Error state */}
            {isError && (
              <div
                className="px-2 py-1.5 text-sm text-destructive"
                data-testid="owner-error"
              >
                Failed to load team
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && salesTeam?.length === 0 && (
              <div
                className="px-2 py-1.5 text-sm text-muted-foreground"
                data-testid="owner-empty"
              >
                No team members found
              </div>
            )}

            {/* AC#2: Sales team members */}
            {salesTeam?.map((member, index) => {
              const isSelected = value.includes(member.id);
              const optionIndex = index + 2; // +2 for "All Owners" and "Unassigned"

              return (
                <button
                  ref={(el) => {
                    optionsRef.current[optionIndex] = el;
                  }}
                  type="button"
                  key={member.id}
                  className={cn(
                    'flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent focus:bg-accent focus:outline-none',
                    focusedIndex === optionIndex && 'bg-accent'
                  )}
                  onClick={() => toggleOwner(member.id)}
                  role="option"
                  aria-selected={isSelected}
                  data-testid={`owner-option-${member.id}`}
                >
                  <span className="flex-1 text-left">{member.name}</span>
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

      {/* AC#7: Active filter indicator with clear button */}
      {hasSelection && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleQuickClear}
          aria-label={`Clear owner filter: ${value.map(getOwnerLabel).join(', ')}`}
          data-testid="owner-filter-clear"
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
        data-testid="owner-filter-announcement"
      >
        {hasSelection
          ? `${selectedCount} owner${selectedCount > 1 ? 's' : ''} selected: ${value.map(getOwnerLabel).join(', ')}`
          : 'No owner filter active, showing all leads'}
      </span>
    </div>
  );
}
