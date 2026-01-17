/**
 * Search URL State Hook
 * Story 4.3: Search - AC#7
 *
 * Syncs search state with URL searchParams for shareable links
 * Uses Next.js App Router navigation hooks
 *
 * AC#7: URL State Sync
 * - Read `search` from URL searchParams
 * - Update URL when search changes (using router.replace)
 * - Preserve other params (page, limit) when updating search
 * - Reset page to 1 when search changes
 *
 * @note Requires Suspense wrapper due to useSearchParams
 */
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Return type for useLeadSearchParams hook
 */
export interface UseLeadSearchParamsReturn {
  /** Current search term from URL */
  search: string;
  /** Update search term in URL (resets page to 1) */
  setSearch: (search: string) => void;
  /** Clear search from URL */
  clearSearch: () => void;
}

/**
 * Hook for syncing search state with URL
 * Requires Suspense wrapper due to useSearchParams
 *
 * @example
 * ```tsx
 * function LeadsPage() {
 *   return (
 *     <Suspense fallback={<Loading />}>
 *       <LeadsContent />
 *     </Suspense>
 *   );
 * }
 *
 * function LeadsContent() {
 *   const { search, setSearch, clearSearch } = useLeadSearchParams();
 *   const debouncedSearch = useDebounce(search, 300);
 *   const { data } = useLeads({ search: debouncedSearch });
 *   // ...
 * }
 * ```
 */
export function useLeadSearchParams(): UseLeadSearchParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // AC#7: Read search from URL
  const search = useMemo(
    () => searchParams.get('search') || '',
    [searchParams]
  );

  /**
   * Update search in URL
   * AC#7: Preserves other params (limit) but resets page to 1
   */
  const setSearch = useCallback(
    (newSearch: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newSearch.trim()) {
        params.set('search', newSearch.trim());
      } else {
        // AC#5: Remove search param when empty
        params.delete('search');
      }

      // AC#4: Reset page to 1 when search changes
      params.set('page', '1');

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Clear search from URL
   * AC#5: Removes search param and resets to page 1
   */
  const clearSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  return { search, setSearch, clearSearch };
}
