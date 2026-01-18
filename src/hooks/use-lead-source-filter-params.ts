/**
 * Lead Source Filter URL State Hook
 * Story 4.14: Filter by Lead Source - AC#5, AC#6
 *
 * Syncs lead source filter state with URL searchParams for shareable links
 * Uses Next.js App Router navigation hooks
 *
 * AC#5: URL State Sync
 * - Read `leadSource` from URL searchParams
 * - Update URL when filter changes (using router.replace)
 * - Preserve other params (page, limit, search) when updating
 * - Reset page to 1 when filter changes
 *
 * AC#6: Persist State Across Navigation
 * - URL params persist filter state across navigation
 *
 * @note Requires Suspense wrapper due to useSearchParams
 */
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Special value for filtering leads with null/empty leadSource
 * Exported for test mocks and component consistency
 */
export const UNKNOWN_SOURCE = '__unknown__';

/**
 * Return type for useLeadSourceFilterParams hook
 */
export interface UseLeadSourceFilterParamsReturn {
  /** Current selected source from URL (null = all sources) */
  leadSource: string | null;
  /** Update lead source filter in URL (resets page to 1) */
  setLeadSource: (source: string | null) => void;
  /** Clear lead source filter from URL */
  clearLeadSource: () => void;
  /** Check if any lead source filter is active */
  hasLeadSourceFilter: boolean;
}

/**
 * Hook for syncing lead source filter state with URL
 * Requires Suspense wrapper due to useSearchParams
 *
 * @example
 * ```tsx
 * function LeadsContent() {
 *   const { leadSource, setLeadSource, clearLeadSource, hasLeadSourceFilter } = useLeadSourceFilterParams();
 *   const { data } = useLeads({ leadSource });
 *   // ...
 * }
 * ```
 */
export function useLeadSourceFilterParams(): UseLeadSourceFilterParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // AC#5: Read leadSource from URL (null means all sources)
  const leadSource = useMemo(() => {
    const value = searchParams.get('leadSource');
    return value || null;
  }, [searchParams]);

  const hasLeadSourceFilter = leadSource !== null;

  /**
   * Update lead source filter in URL
   * AC#5: Preserves other params (limit, search) but resets page to 1
   * AC#6: Updates URL for shareable link
   */
  const setLeadSource = useCallback(
    (newSource: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newSource) {
        // AC#4: Set the lead source param
        params.set('leadSource', newSource);
      } else {
        // Remove leadSource param when cleared
        params.delete('leadSource');
      }

      // Reset page to 1 when filter changes
      params.set('page', '1');

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Clear lead source filter from URL
   * Removes leadSource param and resets to page 1
   */
  const clearLeadSource = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('leadSource');
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  return { leadSource, setLeadSource, clearLeadSource, hasLeadSourceFilter };
}
