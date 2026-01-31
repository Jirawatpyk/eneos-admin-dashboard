/**
 * useCampaignDateFilter Hook
 * Story 5.8: Campaign Date Filter
 *
 * AC#3: Filter Application - calculates date ranges for API calls
 * AC#4: URL Sync - reads period from URL search params
 * AC#7: Clear Filter - returns undefined dates for "allTime"
 *
 * Pattern reused from: src/hooks/use-date-filter.ts (Story 2-7)
 */

import { useSearchParams } from 'next/navigation';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfMonth,
  subMonths,
} from 'date-fns';
import { isValidCampaignPeriod } from '@/components/campaigns/campaign-period-filter';
import type { CampaignPeriod } from '@/types/campaigns';

export interface CampaignDateFilterResult {
  period: CampaignPeriod;
  dateFrom?: string;  // ISO 8601
  dateTo?: string;    // ISO 8601
}

const DEFAULT_PERIOD: CampaignPeriod = 'allTime';

/**
 * Calculate date range based on campaign period
 */
function calculateDateRange(
  period: CampaignPeriod,
  searchParams: URLSearchParams
): { dateFrom?: string; dateTo?: string } {
  const now = new Date();

  switch (period) {
    case 'allTime':
      return { dateFrom: undefined, dateTo: undefined };

    case 'today':
      return {
        dateFrom: startOfDay(now).toISOString(),
        dateTo: endOfDay(now).toISOString(),
      };

    case 'week':
      return {
        dateFrom: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        dateTo: endOfDay(now).toISOString(),
      };

    case 'month':
      return {
        dateFrom: startOfMonth(now).toISOString(),
        dateTo: endOfDay(now).toISOString(),
      };

    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      return {
        dateFrom: startOfMonth(lastMonth).toISOString(),
        dateTo: endOfMonth(lastMonth).toISOString(),
      };
    }

    case 'custom': {
      const fromParam = searchParams.get('from');
      const toParam = searchParams.get('to');

      if (fromParam && toParam) {
        const from = new Date(fromParam);
        const to = new Date(toParam);
        // Story 5.8 Fix #9: Validate dates are valid AND from <= to
        if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to) {
          return {
            dateFrom: from.toISOString(),
            dateTo: to.toISOString(),
          };
        }
      }
      // If custom but no valid dates (or invalid order), treat as all time
      return { dateFrom: undefined, dateTo: undefined };
    }

    default:
      return { dateFrom: undefined, dateTo: undefined };
  }
}

/**
 * Hook for managing campaign date filter state and calculations
 *
 * @returns Current period and calculated date range (ISO 8601 strings)
 *
 * @example
 * ```tsx
 * const { period, dateFrom, dateTo } = useCampaignDateFilter();
 * // Pass dateFrom/dateTo to campaign hooks for API filtering
 * ```
 */
export function useCampaignDateFilter(): CampaignDateFilterResult {
  const searchParams = useSearchParams();

  // Get and validate period from URL
  const urlPeriod = searchParams.get('period');
  const period: CampaignPeriod = isValidCampaignPeriod(urlPeriod)
    ? urlPeriod
    : DEFAULT_PERIOD;

  // Calculate date range
  const { dateFrom, dateTo } = calculateDateRange(period, searchParams);

  return {
    period,
    dateFrom,
    dateTo,
  };
}
