/**
 * Campaign Table Column Definitions
 * Extracted from campaign-table.tsx (Fix #7: reduce file size)
 *
 * AC#1: Column definitions for Campaign Name, Delivered, Opened, Clicked, Open Rate, Click Rate, Last Updated
 * AC#2: Data formatting
 */
'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { SortableHeader } from './sortable-header';
import { RatePerformanceBadge } from './rate-performance-badge';
import type { CampaignStatsItem, CampaignSortBy } from '@/types/campaigns';

interface ColumnFactoryParams {
  sortBy: CampaignSortBy;
  sortOrder: 'asc' | 'desc';
  handleSort: (columnId: string) => void;
}

/**
 * Creates column definitions for the campaign table.
 * Uses factory pattern to inject sort state without re-creating on every render.
 */
export function createCampaignColumns({
  sortBy,
  sortOrder,
  handleSort,
}: ColumnFactoryParams): ColumnDef<CampaignStatsItem>[] {
  return [
    {
      accessorKey: 'campaignName',
      header: () => (
        <SortableHeader
          columnId="campaignName"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={handleSort}
        >
          Campaign Name
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-medium min-w-[200px] block">
          {row.getValue('campaignName')}
        </span>
      ),
    },
    {
      accessorKey: 'delivered',
      header: () => (
        <SortableHeader
          columnId="delivered"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={handleSort}
        >
          Delivered
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.getValue<number>('delivered').toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'uniqueOpens',
      header: () => (
        <SortableHeader
          columnId="uniqueOpens"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={handleSort}
        >
          Opened
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.getValue<number>('uniqueOpens').toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'uniqueClicks',
      header: () => (
        <SortableHeader
          columnId="uniqueClicks"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={handleSort}
        >
          Clicked
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.getValue<number>('uniqueClicks').toLocaleString()}
        </span>
      ),
    },
    {
      // Story 5.5 AC#3: Rate Performance Indicators with color coding
      accessorKey: 'openRate',
      header: () => (
        <SortableHeader
          columnId="openRate"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={handleSort}
        >
          Open Rate
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <RatePerformanceBadge
          value={row.getValue<number>('openRate')}
          type="open"
          delivered={row.original.delivered}
        />
      ),
    },
    {
      // Story 5.5 AC#3: Rate Performance Indicators with color coding
      accessorKey: 'clickRate',
      header: () => (
        <SortableHeader
          columnId="clickRate"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={handleSort}
        >
          Click Rate
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <RatePerformanceBadge
          value={row.getValue<number>('clickRate')}
          type="click"
          delivered={row.original.delivered}
        />
      ),
    },
    {
      accessorKey: 'lastUpdated',
      header: () => (
        <SortableHeader
          columnId="lastUpdated"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={handleSort}
          className="justify-end"
        >
          Last Updated
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue<string>('lastUpdated');
        return (
          <span className="text-right block whitespace-nowrap text-muted-foreground">
            {dateValue && !isNaN(new Date(dateValue).getTime())
              ? formatDistanceToNow(new Date(dateValue), { addSuffix: true })
              : '-'}
          </span>
        );
      },
    },
  ];
}
