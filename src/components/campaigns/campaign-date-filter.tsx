/**
 * Campaign Date Filter Component
 * Story 5.7: Campaign Detail Sheet
 *
 * AC#13: Date range filter for event log (From/To date pickers)
 * - Validates From <= To via disabled dates
 * - Clear button to reset filter
 */
'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface CampaignDateFilterProps {
  /** Start date (null = no start filter) */
  dateFrom: Date | null;
  /** End date (null = no end filter) */
  dateTo: Date | null;
  /** Callback when start date changes */
  onDateFromChange: (date: Date | null) => void;
  /** Callback when end date changes */
  onDateToChange: (date: Date | null) => void;
}

export function CampaignDateFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: CampaignDateFilterProps) {
  const hasFilter = dateFrom || dateTo;

  const clearDates = () => {
    onDateFromChange(null);
    onDateToChange(null);
  };

  return (
    <div className="flex items-center gap-2" data-testid="campaign-date-filter">
      {/* From Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'w-[130px] justify-start text-left font-normal',
              !dateFrom && 'text-muted-foreground'
            )}
            data-testid="date-from-trigger"
          >
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            {dateFrom ? format(dateFrom, 'MMM dd') : 'From'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateFrom ?? undefined}
            onSelect={(date) => onDateFromChange(date ?? null)}
            disabled={(date) => (dateTo ? date > dateTo : false)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground">-</span>

      {/* To Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'w-[130px] justify-start text-left font-normal',
              !dateTo && 'text-muted-foreground'
            )}
            data-testid="date-to-trigger"
          >
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            {dateTo ? format(dateTo, 'MMM dd') : 'To'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateTo ?? undefined}
            onSelect={(date) => onDateToChange(date ?? null)}
            disabled={(date) => (dateFrom ? date < dateFrom : false)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Clear Button */}
      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearDates}
          className="h-8 px-2"
          aria-label="Clear date filter"
          data-testid="date-filter-clear"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
