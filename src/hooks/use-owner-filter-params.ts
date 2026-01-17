/**
 * Owner Filter URL State Hook
 * Story 4.5: Filter by Owner - AC#8
 *
 * Syncs owner filter state with URL searchParams for shareable links
 * Uses Next.js App Router navigation hooks
 *
 * AC#8: URL State Sync
 * - Read `owner` from URL searchParams (comma-separated)
 * - Update URL when filter changes (using router.replace)
 * - Preserve other params (page, limit, search, status) when updating
 * - Reset page to 1 when filter changes
 *
 * Special Values:
 * - 'unassigned': Filter for leads without owner (salesOwnerId is null)
 *
 * @note Requires Suspense wrapper due to useSearchParams
 */
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/** Special value for leads without owner */
export const UNASSIGNED_VALUE = 'unassigned';

/**
 * Return type for useOwnerFilterParams hook
 */
export interface UseOwnerFilterParamsReturn {
  /** Current selected owner IDs from URL (empty array = all) */
  owners: string[];
  /** Update owner filter in URL (resets page to 1) */
  setOwners: (owners: string[]) => void;
  /** Clear owner filter from URL */
  clearOwners: () => void;
  /** Check if any owner filter is active */
  hasOwnerFilter: boolean;
}

/**
 * Parse owner IDs from URL param (comma-separated)
 */
function parseOwners(ownerParam: string): string[] {
  if (!ownerParam) return [];

  return ownerParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean); // Remove empty strings
}

/**
 * Hook for syncing owner filter state with URL
 * Requires Suspense wrapper due to useSearchParams
 *
 * @example
 * ```tsx
 * function LeadsContent() {
 *   const { owners, setOwners, clearOwners, hasOwnerFilter } = useOwnerFilterParams();
 *   const { data } = useLeads({ owner: owners });
 *
 *   return (
 *     <LeadOwnerFilter
 *       value={owners}
 *       onChange={setOwners}
 *     />
 *   );
 * }
 * ```
 */
export function useOwnerFilterParams(): UseOwnerFilterParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // AC#8: Read owner from URL (comma-separated)
  const owners = useMemo(
    () => parseOwners(searchParams.get('owner') || ''),
    [searchParams]
  );

  const hasOwnerFilter = owners.length > 0;

  /**
   * Update owner filter in URL
   * AC#8: Preserves other params (limit, search, status) but resets page to 1
   * AC#7: Resets page to 1 when filter changes
   */
  const setOwners = useCallback(
    (newOwners: string[]) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newOwners.length > 0) {
        // AC#4, AC#8: Join with comma for URL
        params.set('owner', newOwners.join(','));
      } else {
        // AC#7: Remove owner param when cleared
        params.delete('owner');
      }

      // AC#7: Reset page to 1 when filter changes
      params.set('page', '1');

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Clear owner filter from URL
   * AC#7: Removes owner param and resets to page 1
   */
  const clearOwners = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('owner');
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  return { owners, setOwners, clearOwners, hasOwnerFilter };
}
