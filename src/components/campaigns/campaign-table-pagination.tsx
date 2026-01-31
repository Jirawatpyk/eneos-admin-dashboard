/**
 * Campaign Table Pagination Component
 * Story 5.4: Campaign Table
 *
 * AC#3: Pagination controls with page size selector (10, 20, 50)
 * Pattern: Reuse from lead-pagination.tsx
 */
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/** AC#3: Page size options */
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export interface CampaignTablePaginationProps {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange: (size: number) => void;
  /** Whether data is currently being fetched */
  isFetching?: boolean;
}

export function CampaignTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
}: CampaignTablePaginationProps) {
  // Hide pagination when no data
  if (total === 0) {
    return null;
  }

  // Calculate display range
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // Navigation state
  const isFirstPage = page === 1;
  const isLastPage = page >= totalPages;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-2',
        isFetching && 'opacity-70'
      )}
      data-testid="campaign-table-pagination"
    >
      {/* Show item range */}
      <div className="text-sm text-muted-foreground" data-testid="pagination-range">
        Showing {start} to {end} of {total} campaigns
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* AC#3: Page size selector (10, 20, 50) */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            disabled={isFetching}
          >
            <SelectTrigger
              className="w-[70px] h-9"
              data-testid="pagination-page-size-select"
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

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={isFirstPage || isFetching}
            aria-label="Go to previous page"
            data-testid="pagination-previous"
            className="min-h-[44px] sm:min-h-0"
          >
            <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground px-2" data-testid="pagination-info">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={isLastPage || isFetching}
            aria-label="Go to next page"
            data-testid="pagination-next"
            className="min-h-[44px] sm:min-h-0"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
