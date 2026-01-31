/**
 * Sortable Header Component
 * Extracted from campaign-table.tsx (Fix #7: reduce file size)
 *
 * AC#4: Sorting with indicators
 * Shows sort indicators: ArrowUp (asc) / ArrowDown (desc) / ArrowUpDown (unsorted)
 */
'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CampaignSortBy } from '@/types/campaigns';

/**
 * Map column accessor to backend sortBy field
 */
export const COLUMN_TO_SORT_BY: Record<string, CampaignSortBy> = {
  campaignName: 'Campaign_Name',
  delivered: 'Delivered',
  uniqueOpens: 'Opened',
  uniqueClicks: 'Clicked',
  openRate: 'Open_Rate',
  clickRate: 'Click_Rate',
  lastUpdated: 'Last_Updated',
};

export interface SortableHeaderProps {
  columnId: string;
  currentSortBy: CampaignSortBy;
  currentSortOrder: 'asc' | 'desc';
  onSort: (columnId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function SortableHeader({
  columnId,
  currentSortBy,
  currentSortOrder,
  onSort,
  children,
  className,
}: SortableHeaderProps) {
  const columnSortBy = COLUMN_TO_SORT_BY[columnId];
  const isActive = currentSortBy === columnSortBy;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(columnId);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(columnId)}
      onKeyDown={handleKeyDown}
      className={cn(
        '-ml-4 h-auto py-2',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive && 'text-primary',
        className
      )}
      aria-label={`Sort by ${children}${isActive ? (currentSortOrder === 'asc' ? ', currently ascending' : ', currently descending') : ''}`}
      data-testid={`sort-header-${columnId}`}
    >
      {children}
      {isActive ? (
        currentSortOrder === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      )}
    </Button>
  );
}
