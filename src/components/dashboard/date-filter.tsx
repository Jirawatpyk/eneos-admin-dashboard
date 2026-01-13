/**
 * Date Filter Component
 * Story 2.7: Date Filter
 *
 * AC#1: Filter Dropdown Display - dropdown in header, default "This Month"
 * AC#2: Filter Options - Today, This Week, This Month, Last Month, Custom Range
 * AC#4: URL Sync - updates URL with query param
 * AC#6: Visual Feedback - shows selected option, indicator for non-default
 */
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CustomDateRange } from './custom-date-range';

/**
 * Period options for the date filter
 * Default is 'month' (This Month)
 */
export const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
] as const;

export type Period = (typeof PERIOD_OPTIONS)[number]['value'];

const DEFAULT_PERIOD: Period = 'month';

/**
 * Check if a string is a valid Period value
 */
export function isValidPeriod(value: string | null): value is Period {
  if (!value) return false;
  return PERIOD_OPTIONS.some((opt) => opt.value === value);
}

/**
 * Get label for a period value
 */
function getPeriodLabel(period: Period): string {
  return PERIOD_OPTIONS.find((opt) => opt.value === period)?.label ?? 'This Month';
}

interface DateFilterProps {
  className?: string;
}

/**
 * Date Filter Component
 * Allows users to filter dashboard data by time period
 */
export function DateFilter({ className }: DateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current period from URL or use default (validate against allowed values)
  const urlPeriod = searchParams.get('period');
  const currentPeriod: Period = isValidPeriod(urlPeriod) ? urlPeriod : DEFAULT_PERIOD;
  const isNonDefault = currentPeriod !== DEFAULT_PERIOD;

  /**
   * Handle period change - update URL with new period
   */
  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);

    // Clear custom date params if not custom
    if (period !== 'custom') {
      params.delete('from');
      params.delete('to');
    }

    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className={cn('flex items-center gap-2', className)} data-testid="date-filter">
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger
          className={cn(
            'w-[180px]',
            isNonDefault && 'border-primary'
          )}
          data-filter-active={isNonDefault ? 'true' : undefined}
        >
          <Calendar
            className="mr-2 h-4 w-4"
            data-testid="date-filter-icon"
            aria-hidden="true"
          />
          <SelectValue placeholder="Select period">
            {getPeriodLabel(currentPeriod)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Show custom date range picker when custom is selected */}
      {currentPeriod === 'custom' && <CustomDateRange />}
    </div>
  );
}
