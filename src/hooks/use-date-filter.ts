/**
 * useDateFilter Hook
 * Story 2.7: Date Filter
 *
 * Provides date range calculation based on selected period
 * Syncs with URL search params for persistence
 */
'use client';

import { useSearchParams } from 'next/navigation';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfMonth,
  subMonths,
} from 'date-fns';
import { isValidPeriod, type Period } from '@/components/dashboard/date-filter';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface UseDateFilterReturn {
  period: Period;
  dateRange: DateRange;
  isCustom: boolean;
}

const DEFAULT_PERIOD: Period = 'month';

/**
 * Calculate date range based on period
 */
function calculateDateRange(period: Period, searchParams: URLSearchParams): DateRange {
  const now = new Date();

  switch (period) {
    case 'today':
      return {
        from: startOfDay(now),
        to: endOfDay(now),
      };

    case 'week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }), // Monday start
        to: endOfDay(now),
      };

    case 'month':
      return {
        from: startOfMonth(now),
        to: endOfDay(now),
      };

    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    }

    case 'custom': {
      // Parse custom dates from URL params
      const fromParam = searchParams.get('from');
      const toParam = searchParams.get('to');

      const from = fromParam ? new Date(fromParam) : startOfMonth(now);
      const to = toParam ? new Date(toParam) : endOfDay(now);

      // Validate dates
      if (isNaN(from.getTime())) {
        return { from: startOfMonth(now), to: endOfDay(now) };
      }
      if (isNaN(to.getTime())) {
        return { from, to: endOfDay(now) };
      }

      return { from, to };
    }

    default:
      return {
        from: startOfMonth(now),
        to: endOfDay(now),
      };
  }
}

/**
 * Hook for managing date filter state and calculations
 *
 * @returns Current period, calculated date range, and custom flag
 *
 * @example
 * ```tsx
 * const { period, dateRange, isCustom } = useDateFilter();
 * // Use dateRange.from and dateRange.to for API calls
 * ```
 */
export function useDateFilter(): UseDateFilterReturn {
  const searchParams = useSearchParams();

  // Get and validate period from URL
  const urlPeriod = searchParams.get('period');
  const period: Period = isValidPeriod(urlPeriod) ? urlPeriod : DEFAULT_PERIOD;

  // Calculate date range
  const dateRange = calculateDateRange(period, searchParams);

  return {
    period,
    dateRange,
    isCustom: period === 'custom',
  };
}
