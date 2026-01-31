/**
 * Campaign Period Filter Component
 * Story 5.8: Campaign Date Filter
 *
 * AC#1: Filter dropdown above Campaign Table, default "All Time"
 * AC#2: Filter options: All Time, Today, This Week, This Month, Last Month, Custom Range
 * AC#4: URL Sync - updates URL with query params
 * AC#6: Visual Feedback - border highlight for non-default filter
 * AC#7: Clear Filter - selecting "All Time" clears filter
 *
 * Pattern reused from: src/components/dashboard/date-filter.tsx (Story 2-7)
 */
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CampaignCustomDateRange } from './campaign-custom-date-range';
import type { CampaignPeriod } from '@/types/campaigns';

/**
 * Period options for the campaign date filter
 * Default is 'allTime' (no date filter)
 */
export const CAMPAIGN_PERIOD_OPTIONS: { value: CampaignPeriod; label: string }[] = [
  { value: 'allTime', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

const DEFAULT_PERIOD: CampaignPeriod = 'allTime';

/**
 * Check if a string is a valid CampaignPeriod value
 */
export function isValidCampaignPeriod(value: string | null): value is CampaignPeriod {
  if (!value) return false;
  return CAMPAIGN_PERIOD_OPTIONS.some((opt) => opt.value === value);
}

/**
 * Get label for a period value
 */
function getPeriodLabel(period: CampaignPeriod): string {
  return CAMPAIGN_PERIOD_OPTIONS.find((opt) => opt.value === period)?.label ?? 'All Time';
}

interface CampaignPeriodFilterProps {
  className?: string;
}

/**
 * Campaign Period Filter Component
 * Allows users to filter campaign data by time period
 */
export function CampaignPeriodFilter({ className }: CampaignPeriodFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current period from URL or use default
  const urlPeriod = searchParams.get('period');
  const currentPeriod: CampaignPeriod = isValidCampaignPeriod(urlPeriod)
    ? urlPeriod
    : DEFAULT_PERIOD;
  const isFiltered = currentPeriod !== DEFAULT_PERIOD;

  /**
   * Handle period change - update URL with new period
   * AC#4: URL sync, AC#7: Clear filter on allTime
   */
  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (period === 'allTime') {
      // AC#7: Clear all filter params
      params.delete('period');
      params.delete('from');
      params.delete('to');
    } else {
      params.set('period', period);
      // Clear custom date params if switching away from custom
      if (period !== 'custom') {
        params.delete('from');
        params.delete('to');
      }
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      data-testid="campaign-period-filter"
    >
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger
          className={cn(
            'w-[180px]',
            isFiltered && 'border-primary'
          )}
          data-filter-active={isFiltered ? 'true' : undefined}
        >
          <Calendar
            className="mr-2 h-4 w-4"
            data-testid="campaign-period-filter-icon"
            aria-hidden="true"
          />
          <SelectValue placeholder="Select period">
            {getPeriodLabel(currentPeriod)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CAMPAIGN_PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Show custom date range picker when custom is selected (AC#5) */}
      {currentPeriod === 'custom' && <CampaignCustomDateRange />}
    </div>
  );
}
