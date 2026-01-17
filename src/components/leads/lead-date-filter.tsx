/**
 * Lead Date Filter Component
 * Story 4.6: Filter by Date
 *
 * AC#1: Date Filter Display
 * - Shows "Date" filter button next to owner filter
 * - Displays calendar icon (lucide-react Calendar)
 * - Shows "All Time" by default
 *
 * AC#2: Date Preset Options
 * - 7 preset options: Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month, Custom Range
 *
 * AC#3: Preset Filter Application
 * - Clicking preset applies date range
 * - Button label updates to show date range
 *
 * AC#4: Custom Date Range
 * - Calendar for start/end date selection
 * - Month navigation
 * - Apply/Cancel buttons
 *
 * AC#7: Clear Filter
 * - "All Time" option clears filter
 * - Clear button (X) when filter active
 *
 * AC#9: Accessibility
 * - Keyboard navigation
 * - Screen reader announcements
 *
 * @note Calendar uses react-day-picker which has issues in jsdom.
 *       Use E2E tests (Playwright) for Calendar interactions.
 *       Unit tests cover presets and URL logic only.
 */
'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  DATE_PRESET_OPTIONS,
  getPresetDateRange,
  formatDateRangeLabel,
  formatDateForApi,
  type DatePreset,
  type DateRange,
} from '@/lib/date-presets';

/**
 * Check if a date range matches a preset
 * AC#9: For aria-selected to indicate current selection
 */
function matchesPreset(value: DateRange | null, preset: DatePreset): boolean {
  if (!value) return false;
  const presetRange = getPresetDateRange(preset);
  if (!presetRange) return false;

  // Compare by formatted date string (YYYY-MM-DD) to ignore time differences
  return (
    formatDateForApi(value.from) === formatDateForApi(presetRange.from) &&
    formatDateForApi(value.to) === formatDateForApi(presetRange.to)
  );
}

interface LeadDateFilterProps {
  /** Current date range (null = all time) */
  value: DateRange | null;
  /** Callback when date range changes */
  onChange: (range: DateRange | null) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export function LeadDateFilter({
  value,
  onChange,
  className,
  disabled = false,
}: LeadDateFilterProps) {
  const [open, setOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const hasSelection = value !== null;

  // Total options: "All Time" + 7 presets = 8
  const totalOptions = 1 + DATE_PRESET_OPTIONS.length;

  // AC#7: Reset state when popover closes
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowCalendar(false);
      setTempRange(null);
      setFocusedIndex(-1);
    }
  }, []);

  // AC#3: Handle preset click
  const handlePresetClick = useCallback((preset: DatePreset) => {
    if (preset === 'custom') {
      setShowCalendar(true);
      setTempRange(value);
      return;
    }

    const range = getPresetDateRange(preset);
    onChange(range);
    setOpen(false);
    setShowCalendar(false);
  }, [value, onChange]);

  // AC#4: Handle custom date range apply
  const handleApplyCustom = useCallback(() => {
    if (tempRange?.from && tempRange?.to) {
      onChange(tempRange);
      setOpen(false);
      setShowCalendar(false);
    }
  }, [tempRange, onChange]);

  // AC#4: Handle cancel custom
  const handleCancelCustom = useCallback(() => {
    setShowCalendar(false);
    setTempRange(null);
  }, []);

  // AC#7: Handle "All Time" to clear filter
  const handleClear = useCallback(() => {
    onChange(null);
    setOpen(false);
    setShowCalendar(false);
  }, [onChange]);

  // AC#7: Quick clear button handler
  const handleQuickClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  }, [onChange]);

  // AC#9: Keyboard navigation for presets
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showCalendar) return; // Let calendar handle its own keyboard nav

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
          // "All Time" option
          handleClear();
        } else if (focusedIndex > 0 && focusedIndex <= DATE_PRESET_OPTIONS.length) {
          // Preset option
          const preset = DATE_PRESET_OPTIONS[focusedIndex - 1];
          handlePresetClick(preset.value);
        }
        break;
      case 'Escape':
        if (showCalendar) {
          setShowCalendar(false);
        } else {
          setOpen(false);
        }
        break;
    }
  }, [focusedIndex, totalOptions, handleClear, handlePresetClick, showCalendar]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (open && !showCalendar && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.focus();
    }
  }, [open, showCalendar, focusedIndex]);

  // Reset focus when popover opens
  useEffect(() => {
    if (open && !showCalendar) {
      setFocusedIndex(0);
    }
  }, [open, showCalendar]);

  // AC#1: Get display text for button
  const buttonLabel = formatDateRangeLabel(value);

  // AC#9: Memoize which preset is currently selected for aria-selected
  const selectedPreset = useMemo(() => {
    if (!value) return null;
    for (const option of DATE_PRESET_OPTIONS) {
      if (matchesPreset(value, option.value)) {
        return option.value;
      }
    }
    return 'custom'; // Custom range if no preset matches
  }, [value]);

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      data-testid="lead-date-filter"
    >
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {/* AC#1: Filter button with calendar icon */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-9 border-dashed gap-2',
              hasSelection && 'border-primary bg-primary/5'
            )}
            disabled={disabled}
            aria-label={`Filter by date${hasSelection ? `, ${buttonLabel}` : ''}`}
            aria-expanded={open}
            aria-haspopup="dialog"
            data-testid="date-filter-trigger"
          >
            <CalendarIcon className="h-4 w-4" aria-hidden="true" />
            <span>{buttonLabel}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-2"
          align="start"
          onKeyDown={handleKeyDown}
          aria-label="Date filter options"
        >
          {!showCalendar ? (
            /* AC#2: Preset options */
            <div className="space-y-1" role="listbox" aria-label="Date presets">
              {/* AC#7: All Time option at top */}
              <button
                ref={(el) => { optionsRef.current[0] = el; }}
                type="button"
                className={cn(
                  'flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent focus:bg-accent focus:outline-none',
                  focusedIndex === 0 && 'bg-accent'
                )}
                onClick={handleClear}
                role="option"
                aria-selected={selectedPreset === null}
                data-testid="date-option-all"
              >
                <span className="flex-1 text-left font-medium">All Time</span>
              </button>

              {/* Divider */}
              <div className="my-1 h-px bg-border" role="separator" />

              {/* AC#2: Preset options */}
              {DATE_PRESET_OPTIONS.map((option, index) => {
                const optionIndex = index + 1;
                return (
                  <button
                    ref={(el) => { optionsRef.current[optionIndex] = el; }}
                    type="button"
                    key={option.value}
                    className={cn(
                      'flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent focus:bg-accent focus:outline-none',
                      focusedIndex === optionIndex && 'bg-accent'
                    )}
                    onClick={() => handlePresetClick(option.value)}
                    role="option"
                    aria-selected={selectedPreset === option.value}
                    data-testid={`date-option-${option.value}`}
                  >
                    <span className="flex-1 text-left">{option.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* AC#4: Custom date range picker */
            <div className="space-y-3" data-testid="date-custom-picker">
              <div className="text-sm font-medium text-muted-foreground px-2">
                Select date range
              </div>
              <Calendar
                mode="range"
                selected={{
                  from: tempRange?.from,
                  to: tempRange?.to,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setTempRange({ from: range.from, to: range.to });
                  } else if (range?.from) {
                    // Single date selected - set both to same date
                    setTempRange({ from: range.from, to: range.from });
                  }
                }}
                numberOfMonths={1}
                disabled={{ after: new Date() }}
                toDate={new Date()}
                data-testid="date-calendar"
              />
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelCustom}
                  data-testid="date-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyCustom}
                  disabled={!tempRange?.from || !tempRange?.to}
                  data-testid="date-apply"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* AC#7: Quick clear button when filter active */}
      {hasSelection && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={handleQuickClear}
          aria-label="Clear date filter"
          data-testid="date-filter-clear"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </Button>
      )}

      {/* AC#9: ARIA live region for screen reader announcements */}
      <span
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="date-filter-announcement"
      >
        {hasSelection
          ? `Date filter active: ${buttonLabel}`
          : 'No date filter active, showing all leads'}
      </span>
    </div>
  );
}
