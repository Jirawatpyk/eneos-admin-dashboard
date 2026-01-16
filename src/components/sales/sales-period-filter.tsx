/**
 * Sales Period Filter Component
 * Story 3.6: Period Filter for Sales Performance
 *
 * AC#1: Period Filter Display - dropdown in header, default "This Month"
 * AC#2: Filter Options - This Week, This Month, This Quarter, Last Quarter, Custom Range
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
import { CustomDateRange } from '@/components/sales/custom-date-range';

/**
 * Period options for the sales performance filter
 * Includes Quarter options per AC#2
 * Default is 'month' (This Month)
 */
export const SALES_PERIOD_OPTIONS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'lastQuarter', label: 'Last Quarter' },
  { value: 'custom', label: 'Custom Range' },
] as const;

export type SalesPeriod = (typeof SALES_PERIOD_OPTIONS)[number]['value'];

const DEFAULT_PERIOD: SalesPeriod = 'month';

/**
 * Check if a string is a valid SalesPeriod value
 */
export function isValidSalesPeriod(value: string | null): value is SalesPeriod {
  if (!value) return false;
  return SALES_PERIOD_OPTIONS.some((opt) => opt.value === value);
}

/**
 * Get label for a period value
 */
function getPeriodLabel(period: SalesPeriod): string {
  return SALES_PERIOD_OPTIONS.find((opt) => opt.value === period)?.label ?? 'This Month';
}

interface SalesPeriodFilterProps {
  className?: string;
  /** Base path for URL navigation (defaults to /sales) */
  basePath?: string;
}

/**
 * Sales Period Filter Component
 * Allows users to filter sales performance data by time period
 */
export function SalesPeriodFilter({ className, basePath = '/sales' }: SalesPeriodFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current period from URL or use default (validate against allowed values)
  const urlPeriod = searchParams.get('period');
  const currentPeriod: SalesPeriod = isValidSalesPeriod(urlPeriod) ? urlPeriod : DEFAULT_PERIOD;
  const isNonDefault = currentPeriod !== DEFAULT_PERIOD;

  /**
   * Handle period change - update URL with new period
   */
  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);

    // Clear custom date params if not custom (AC#4: Clear from/to params when switching from custom)
    if (period !== 'custom') {
      params.delete('from');
      params.delete('to');
    }

    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className={cn('flex items-center gap-2', className)} data-testid="sales-period-filter">
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
            data-testid="sales-period-icon"
            aria-hidden="true"
          />
          <SelectValue placeholder="Select period">
            {getPeriodLabel(currentPeriod)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SALES_PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Show custom date range picker when custom is selected (AC#5) */}
      {currentPeriod === 'custom' && <CustomDateRange basePath={basePath} />}
    </div>
  );
}
