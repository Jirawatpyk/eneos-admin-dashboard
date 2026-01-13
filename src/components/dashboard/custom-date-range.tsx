/**
 * Custom Date Range Picker Component
 * Story 2.7: Date Filter
 *
 * AC#5: Custom Date Range - select start and end date
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CustomDateRangeProps {
  className?: string;
}

/**
 * Custom Date Range Picker
 * Allows users to select a custom date range for filtering
 */
export function CustomDateRange({ className }: CustomDateRangeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);

  // Initialize date range from URL params if present
  useEffect(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (fromParam && toParam) {
      const from = new Date(fromParam);
      const to = new Date(toParam);

      if (isValid(from) && isValid(to)) {
        setDate({ from, to });
      }
    }
  }, [searchParams]);

  /**
   * Apply the selected custom date range
   * Updates URL with period=custom and from/to params
   */
  const applyCustomRange = () => {
    if (!date?.from || !date?.to) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('period', 'custom');
    params.set('from', date.from.toISOString());
    params.set('to', date.to.toISOString());

    router.push(`/dashboard?${params.toString()}`);
    setOpen(false);
  };

  /**
   * Clear custom range and reset to default
   */
  const clearCustomRange = () => {
    setDate(undefined);
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', 'month');
    params.delete('from');
    params.delete('to');
    router.push(`/dashboard?${params.toString()}`);
    setOpen(false);
  };

  /**
   * Format the date range display text
   */
  const getDisplayText = () => {
    if (!date?.from) return 'Pick a date range';
    if (!date?.to) return format(date.from, 'LLL dd, y');
    return `${format(date.from, 'LLL dd')} - ${format(date.to, 'LLL dd, y')}`;
  };

  return (
    <div className={cn('flex items-center gap-2', className)} data-testid="custom-date-range">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[260px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
            data-testid="custom-date-trigger"
            aria-label="Select custom date range"
            aria-haspopup="dialog"
          >
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            {getDisplayText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
            data-testid="custom-date-calendar"
          />
          <div className="flex justify-end gap-2 p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCustomRange}
              data-testid="custom-date-clear"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              data-testid="custom-date-cancel"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={applyCustomRange}
              disabled={!date?.from || !date?.to}
              data-testid="custom-date-apply"
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
