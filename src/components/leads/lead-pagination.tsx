/**
 * Lead Pagination Component
 * Story 4.2: Pagination - AC#1, AC#2, AC#3, AC#7, AC#8
 *
 * Pagination controls for the leads table
 * Includes page navigation, page size selector, and item range display
 */
'use client';

import { ChevronFirst, ChevronLast } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getVisiblePages, getDisplayRange } from '@/lib/pagination-utils';
import { cn } from '@/lib/utils';

/** Valid page size options - AC#2 */
const PAGE_SIZE_OPTIONS = [10, 20, 25, 50] as const;

export interface LeadPaginationProps {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes - AC#3 */
  onPageChange: (page: number) => void;
  /** Callback when page size changes - AC#2 */
  onLimitChange: (limit: number) => void;
  /** Whether data is currently being fetched - AC#5 */
  isFetching?: boolean;
  /** Maximum visible page numbers (default: 5) - AC#8 */
  maxVisiblePages?: number;
}

/**
 * Pagination component for lead list table
 * Hidden when total items is 0 - AC#6
 */
export function LeadPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  isFetching = false,
  maxVisiblePages = 5,
}: LeadPaginationProps) {
  // AC#6: Hide pagination when no data
  if (total === 0) {
    return null;
  }

  // Calculate display range - AC#1
  const { start, end } = getDisplayRange(page, limit, total);

  // Get visible page numbers with ellipsis - AC#8
  const visiblePages = getVisiblePages(page, totalPages, maxVisiblePages);

  // Navigation state - AC#3
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  // Keyboard handler - AC#7
  const handleKeyDown = (e: React.KeyboardEvent, targetPage: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPageChange(targetPage);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4',
        isFetching && 'opacity-70'
      )}
      data-testid="lead-pagination"
    >
      {/* AC#1: Show item range */}
      <div className="text-sm text-muted-foreground" data-testid="pagination-range">
        Showing {start}-{end} of {total} leads
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* AC#2: Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">Per page:</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
            disabled={isFetching}
          >
            <SelectTrigger
              className="w-[70px] h-9"
              data-testid="pagination-limit-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AC#1, AC#3: Pagination controls */}
        <Pagination>
          <PaginationContent>
            {/* AC#8: First button (hidden on mobile) */}
            <PaginationItem className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => onPageChange(1)}
                disabled={isFirstPage || isFetching}
                aria-label="Go to first page"
                data-testid="pagination-first"
              >
                <ChevronFirst className="h-4 w-4" />
              </Button>
            </PaginationItem>

            {/* Previous button - AC#3 */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => !isFirstPage && onPageChange(page - 1)}
                aria-disabled={isFirstPage || isFetching}
                tabIndex={isFirstPage ? -1 : 0}
                onKeyDown={(e) => !isFirstPage && handleKeyDown(e, page - 1)}
                className={cn(
                  isFirstPage && 'pointer-events-none opacity-50',
                  'min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0' // AC#8: Touch target
                )}
                data-testid="pagination-previous"
              />
            </PaginationItem>

            {/* Page numbers with ellipsis - AC#1, AC#8 */}
            {visiblePages.map((item, index) => (
              <PaginationItem
                key={item === 'ellipsis' ? `ellipsis-${index < visiblePages.length / 2 ? 'start' : 'end'}` : item}
                className={cn(
                  // AC#8: Collapse some numbers on mobile
                  item !== page &&
                    item !== 'ellipsis' &&
                    item !== 1 &&
                    item !== totalPages &&
                    'hidden sm:block'
                )}
              >
                {item === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => item !== page && onPageChange(item)}
                    isActive={item === page}
                    tabIndex={item === page || isFetching ? -1 : 0}
                    onKeyDown={(e) => item !== page && handleKeyDown(e, item)}
                    aria-current={item === page ? 'page' : undefined}
                    aria-disabled={isFetching}
                    className={cn(
                      'min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px]', // AC#8: Touch target
                      isFetching && 'pointer-events-none'
                    )}
                    data-testid={`pagination-page-${item}`}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Next button - AC#3 */}
            <PaginationItem>
              <PaginationNext
                onClick={() => !isLastPage && onPageChange(page + 1)}
                aria-disabled={isLastPage || isFetching}
                tabIndex={isLastPage ? -1 : 0}
                onKeyDown={(e) => !isLastPage && handleKeyDown(e, page + 1)}
                className={cn(
                  isLastPage && 'pointer-events-none opacity-50',
                  'min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0' // AC#8: Touch target
                )}
                data-testid="pagination-next"
              />
            </PaginationItem>

            {/* AC#8: Last button (hidden on mobile) */}
            <PaginationItem className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => onPageChange(totalPages)}
                disabled={isLastPage || isFetching}
                aria-label="Go to last page"
                data-testid="pagination-last"
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
