'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Info } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { validateDateRange } from '@/lib/export-date-presets';

interface ExportDateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  onClear: () => void;
  presetLabel?: string;
}

export function ExportDateRangePicker({
  value,
  onChange,
  onClear,
  presetLabel,
}: ExportDateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(value);

  // Sync draft when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setDraft(value);
    setOpen(isOpen);
  };

  const validation = draft ? validateDateRange(draft) : { valid: true };

  const handleApply = () => {
    if (draft?.from && draft?.to && validation.valid) {
      onChange(draft);
      setOpen(false);
    }
  };

  const handleClear = () => {
    setDraft(undefined);
    onClear();
    setOpen(false);
  };

  const displayText = value?.from
    ? value.to
      ? `${format(value.from, 'LLL dd, y')} - ${format(value.to, 'LLL dd, y')}`
      : format(value.from, 'LLL dd, y')
    : 'All dates (no filter)';

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
          aria-label="Select custom date range"
          data-testid="date-range-trigger"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
          {presetLabel && (
            <span
              className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              data-testid="preset-badge"
            >
              {presetLabel}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={draft?.from}
          selected={draft}
          onSelect={setDraft}
          numberOfMonths={2}
          disabled={{ after: new Date() }}
          data-testid="date-range-calendar"
        />
        {!validation.valid && (
          <div
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950"
            data-testid="date-range-validation"
          >
            <Info className="h-4 w-4 shrink-0" />
            {validation.error}
          </div>
        )}
        <div className="flex justify-end gap-2 p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            data-testid="date-range-clear"
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            data-testid="date-range-cancel"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!draft?.from || !draft?.to || !validation.valid}
            data-testid="date-range-apply"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
