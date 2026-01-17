/**
 * Status Filter URL State Hook
 * Story 4.4: Filter by Status - AC#7
 *
 * Syncs status filter state with URL searchParams for shareable links
 * Uses Next.js App Router navigation hooks
 *
 * AC#7: URL State Sync
 * - Read `status` from URL searchParams (comma-separated)
 * - Update URL when filter changes (using router.replace)
 * - Preserve other params (page, limit, search) when updating
 * - Reset page to 1 when filter changes
 * - Validate status values against allowed list
 *
 * @note Requires Suspense wrapper due to useSearchParams
 */
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { LeadStatus } from '@/types/lead';
import { ALL_LEAD_STATUSES } from '@/lib/leads-constants';

/**
 * Return type for useStatusFilterParams hook
 */
export interface UseStatusFilterParamsReturn {
  /** Current selected statuses from URL (empty array = all) */
  statuses: LeadStatus[];
  /** Update status filter in URL (resets page to 1) */
  setStatuses: (statuses: LeadStatus[]) => void;
  /** Clear status filter from URL */
  clearStatuses: () => void;
  /** Check if any status filter is active */
  hasStatusFilter: boolean;
}

/**
 * Validate and filter status values
 * AC#7: Validate status values against allowed list
 */
function parseStatuses(statusParam: string): LeadStatus[] {
  if (!statusParam) return [];

  return statusParam
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is LeadStatus =>
      (ALL_LEAD_STATUSES as readonly string[]).includes(s)
    );
}

/**
 * Hook for syncing status filter state with URL
 * Requires Suspense wrapper due to useSearchParams
 *
 * @example
 * ```tsx
 * function LeadsContent() {
 *   const { statuses, setStatuses, clearStatuses, hasStatusFilter } = useStatusFilterParams();
 *   const { data } = useLeads({ status: statuses });
 *   // ...
 * }
 * ```
 */
export function useStatusFilterParams(): UseStatusFilterParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // AC#7: Read status from URL (comma-separated, validated)
  const statuses = useMemo(
    () => parseStatuses(searchParams.get('status') || ''),
    [searchParams]
  );

  const hasStatusFilter = statuses.length > 0;

  /**
   * Update status filter in URL
   * AC#7: Preserves other params (limit, search) but resets page to 1
   * AC#6: Resets page to 1 when filter changes
   */
  const setStatuses = useCallback(
    (newStatuses: LeadStatus[]) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newStatuses.length > 0) {
        // AC#4: Join with comma for URL
        params.set('status', newStatuses.join(','));
      } else {
        // AC#6: Remove status param when cleared
        params.delete('status');
      }

      // AC#6: Reset page to 1 when filter changes
      params.set('page', '1');

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Clear status filter from URL
   * AC#6: Removes status param and resets to page 1
   */
  const clearStatuses = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  return { statuses, setStatuses, clearStatuses, hasStatusFilter };
}
