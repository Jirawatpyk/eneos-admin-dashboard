/**
 * Sales Period Filter Hook
 * Story 3.6: Period Filter for Sales Performance
 *
 * AC#3: Filter Application - Calculate date ranges for different periods
 * AC#8: Integration - Returns period, from, to for API calls
 *
 * Supported periods:
 * - week: Monday of current week to now
 * - month: Start of current month to now (default)
 * - quarter: Start of current quarter to now
 * - lastQuarter: Previous quarter (full)
 * - custom: From URL params
 */
'use client';

import { useSearchParams } from 'next/navigation';
import {
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  endOfDay,
} from 'date-fns';
import { isValidSalesPeriod, type SalesPeriod } from '@/components/sales/sales-period-filter';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface UseSalesPeriodFilterReturn {
  period: SalesPeriod;
  from: Date;
  to: Date;
  isCustom: boolean;
}

const DEFAULT_PERIOD: SalesPeriod = 'month';

/**
 * Calculate date range based on period
 */
function calculateDateRange(period: SalesPeriod, searchParams: URLSearchParams): DateRange {
  const now = new Date();

  switch (period) {
    case 'week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }), // Monday start per AC#2
        to: endOfDay(now),
      };

    case 'month':
      return {
        from: startOfMonth(now),
        to: endOfDay(now),
      };

    case 'quarter':
      return {
        from: startOfQuarter(now),
        to: endOfDay(now),
      };

    case 'lastQuarter': {
      const lastQ = subQuarters(now, 1);
      return {
        from: startOfQuarter(lastQ),
        to: endOfQuarter(lastQ),
      };
    }

    case 'custom': {
      // Parse custom dates from URL params
      const fromParam = searchParams.get('from');
      const toParam = searchParams.get('to');

      const from = fromParam ? new Date(fromParam) : startOfMonth(now);
      const to = toParam ? new Date(toParam) : endOfDay(now);

      // Validate dates - fall back to month range if invalid
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
 * Hook for managing sales period filter state and date calculations
 *
 * @returns Current period, calculated date range, and custom flag
 *
 * @example
 * ```tsx
 * const { period, from, to, isCustom } = useSalesPeriodFilter();
 * // Use from and to for API calls
 * ```
 */
export function useSalesPeriodFilter(): UseSalesPeriodFilterReturn {
  const searchParams = useSearchParams();

  // Get and validate period from URL
  const urlPeriod = searchParams.get('period');
  const period: SalesPeriod = isValidSalesPeriod(urlPeriod) ? urlPeriod : DEFAULT_PERIOD;

  // Calculate date range
  const { from, to } = calculateDateRange(period, searchParams);

  return {
    period,
    from,
    to,
    isCustom: period === 'custom',
  };
}
