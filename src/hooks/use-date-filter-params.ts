/**
 * Date Filter URL State Hook
 * Story 4.6: Filter by Date - AC#8
 *
 * Syncs date filter state with URL searchParams for shareable links
 * Uses Next.js App Router navigation hooks
 *
 * AC#8: URL State Sync
 * - Read `from` and `to` from URL searchParams (YYYY-MM-DD format)
 * - Update URL when filter changes (using router.replace)
 * - Preserve other params (page, limit, search, status, owner) when updating
 * - Reset page to 1 when filter changes
 * - Validate date format and handle invalid params
 *
 * @note Requires Suspense wrapper due to useSearchParams
 */
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { parseISO, isValid } from 'date-fns';
import { formatDateForApi, type DateRange } from '@/lib/date-presets';

/**
 * Return type for useDateFilterParams hook
 */
export interface UseDateFilterParamsReturn {
  /** Current date range from URL (null = all time) */
  dateRange: DateRange | null;
  /** Update date filter in URL (resets page to 1) */
  setDateRange: (range: DateRange | null) => void;
  /** Clear date filter from URL */
  clearDateRange: () => void;
  /** Check if any date filter is active */
  hasDateFilter: boolean;
}

/**
 * Parse and validate dates from URL params
 * AC#8: Validate date format (YYYY-MM-DD)
 * AC#4: Validate end date >= start date
 */
function parseDateRange(fromParam: string | null, toParam: string | null): DateRange | null {
  // Both params required
  if (!fromParam || !toParam) {
    return null;
  }

  const from = parseISO(fromParam);
  const to = parseISO(toParam);

  // Validate both dates are valid
  if (!isValid(from) || !isValid(to)) {
    return null;
  }

  // AC#4: Validate from <= to (reject invalid ranges)
  if (from > to) {
    return null;
  }

  return { from, to };
}

/**
 * Hook for syncing date filter state with URL
 * Requires Suspense wrapper due to useSearchParams
 *
 * @example
 * ```tsx
 * function LeadsContent() {
 *   const { dateRange, setDateRange, clearDateRange, hasDateFilter } = useDateFilterParams();
 *   const { data } = useLeads({
 *     from: dateRange?.from ? formatDateForApi(dateRange.from) : undefined,
 *     to: dateRange?.to ? formatDateForApi(dateRange.to) : undefined,
 *   });
 *
 *   return (
 *     <LeadDateFilter
 *       value={dateRange}
 *       onChange={setDateRange}
 *     />
 *   );
 * }
 * ```
 */
export function useDateFilterParams(): UseDateFilterParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // AC#8: Read from/to from URL and validate
  const dateRange = useMemo(
    () => parseDateRange(searchParams.get('from'), searchParams.get('to')),
    [searchParams]
  );

  const hasDateFilter = dateRange !== null;

  /**
   * Update date filter in URL
   * AC#8: Preserves other params (limit, search, status, owner) but resets page to 1
   * AC#7: Resets page to 1 when filter changes
   */
  const setDateRange = useCallback(
    (range: DateRange | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (range) {
        // AC#3: Format dates as YYYY-MM-DD for URL
        params.set('from', formatDateForApi(range.from));
        params.set('to', formatDateForApi(range.to));
      } else {
        // AC#7: Remove date params when cleared
        params.delete('from');
        params.delete('to');
      }

      // AC#7: Reset page to 1 when filter changes
      params.set('page', '1');

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Clear date filter from URL
   * AC#7: Removes from/to params and resets to page 1
   * (Delegates to setDateRange(null) to avoid duplicate logic)
   */
  const clearDateRange = useCallback(() => {
    setDateRange(null);
  }, [setDateRange]);

  return { dateRange, setDateRange, clearDateRange, hasDateFilter };
}
