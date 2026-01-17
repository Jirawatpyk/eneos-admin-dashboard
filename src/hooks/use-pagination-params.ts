/**
 * Pagination URL State Hook
 * Story 4.2: Pagination - AC#4
 *
 * Syncs pagination state with URL searchParams for shareable links
 * Uses Next.js App Router navigation hooks
 */
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/** Default pagination values */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/** Valid page size options - AC#2 */
export const VALID_LIMITS = [10, 20, 25, 50] as const;
export type ValidLimit = (typeof VALID_LIMITS)[number];

/**
 * Return type for usePaginationParams hook
 */
export interface UsePaginationParamsReturn {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: ValidLimit;
  /** Update page number in URL */
  setPage: (page: number) => void;
  /** Update limit and reset to page 1 - AC#2 */
  setLimit: (limit: ValidLimit) => void;
}

/**
 * Parse page number from URL, ensuring valid positive integer
 */
function parsePageParam(value: string | null): number {
  if (!value) return DEFAULT_PAGE;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return DEFAULT_PAGE;
  return parsed;
}

/**
 * Parse limit from URL, ensuring it's a valid option
 */
function parseLimitParam(value: string | null): ValidLimit {
  if (!value) return DEFAULT_LIMIT;
  const parsed = parseInt(value, 10);
  if (VALID_LIMITS.includes(parsed as ValidLimit)) {
    return parsed as ValidLimit;
  }
  return DEFAULT_LIMIT;
}

/**
 * Hook for syncing pagination state with URL
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
 *   const { page, limit, setPage, setLimit } = usePaginationParams();
 *   const { data } = useLeads({ page, limit });
 *   // ...
 * }
 * ```
 */
export function usePaginationParams(): UsePaginationParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current values from URL - AC#4
  const page = useMemo(
    () => parsePageParam(searchParams.get('page')),
    [searchParams]
  );

  const limit = useMemo(
    () => parseLimitParam(searchParams.get('limit')),
    [searchParams]
  );

  /**
   * Update page in URL - AC#3
   * Uses router.replace to avoid adding to history on every page change
   */
  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(Math.max(1, newPage)));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Update limit and reset to page 1 - AC#2
   * Always resets to page 1 when page size changes
   */
  const setLimit = useCallback(
    (newLimit: ValidLimit) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('limit', String(newLimit));
      params.set('page', '1'); // Always reset to page 1 when limit changes
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return { page, limit, setPage, setLimit };
}
