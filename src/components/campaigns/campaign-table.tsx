/**
 * Campaign Table Component
 * Story 5.4: Campaign Table
 * Story 5.5: Open Rate & Click Rate Display - RatePerformanceBadge integration
 * Story 5.7: Campaign Detail Sheet - Row click to open detail sheet
 *
 * AC#1: Campaign Table Display - columns: Campaign Name, Delivered, Opened, Clicked, Open Rate, Click Rate, Last Updated
 * AC#2: Data from Backend API with formatting
 * AC#4: Sorting with indicators
 * AC#8: Responsive Layout with horizontal scroll
 * AC#3 (5.5): Rate Performance Indicators with color coding
 * AC#4 (5.5): Benchmark Tooltips
 * AC#7 (5.5): Empty Rate Handling
 * AC#1 (5.7): Row click opens Campaign Detail Sheet
 */
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useCampaignsTable } from '@/hooks/use-campaigns-table';
import { COLUMN_TO_SORT_BY } from './sortable-header';
import { createCampaignColumns } from './campaign-table-columns';
import { CampaignTablePagination } from './campaign-table-pagination';
import { CampaignTableSkeleton } from './campaign-table-skeleton';
import { CampaignsError } from './campaigns-error';
import { CampaignDetailSheet } from './campaign-detail-sheet';
import type { CampaignStatsItem, CampaignSortBy } from '@/types/campaigns';

/**
 * Props for CampaignTable
 * Story 5.8: Accept date filter params
 */
interface CampaignTableProps {
  dateFrom?: string;
  dateTo?: string;
}

export function CampaignTable({ dateFrom, dateTo }: CampaignTableProps) {
  // Pagination state (AC#3)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Sorting state (AC#4)
  const [sortBy, setSortBy] = useState<CampaignSortBy>('Last_Updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Story 5.7: Detail sheet state (AC#1)
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignStatsItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Story 5.8 Fix #2: Reset page to 1 when date filter changes
  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo]);

  // Fetch data with TanStack Query (Story 5.8: pass date filter params)
  const { data, isLoading, isFetching, isError, error, refetch } = useCampaignsTable({
    page,
    limit: pageSize,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
  });

  // Handle sort click (AC#4)
  const handleSort = useCallback((columnId: string) => {
    const columnSortBy = COLUMN_TO_SORT_BY[columnId];
    if (!columnSortBy) return;

    setSortBy((prevSortBy) => {
      if (prevSortBy === columnSortBy) {
        // Toggle order
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        return prevSortBy;
      } else {
        // New column, default to descending
        setSortOrder('desc');
        return columnSortBy;
      }
    });
    // Reset to first page when sorting changes
    setPage(1);
  }, []);

  // Define columns (AC#1, AC#2) - extracted to campaign-table-columns.tsx
  const columns = useMemo(
    () => createCampaignColumns({ sortBy, sortOrder, handleSort }),
    [sortBy, sortOrder, handleSort]
  );

  // TanStack Table instance
  const table = useReactTable({
    data: data?.data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true, // Server-side sorting
    manualPagination: true, // Server-side pagination
  });

  // Extract campaigns and pagination from nested response
  const campaigns = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  // AC#5: Loading State
  if (isLoading) {
    return <CampaignTableSkeleton />;
  }

  // AC#7: Error State
  if (isError) {
    return <CampaignsError message={error?.message} onRetry={refetch} />;
  }

  // AC#6: Empty State
  if (campaigns.length === 0) {
    return (
      <Card data-testid="campaign-table-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" aria-hidden="true" />
            All Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No campaigns yet</p>
            <p className="text-sm mt-1">
              Campaign data will appear here once Brevo sends events
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="campaign-table">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5" aria-hidden="true" />
          All Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Single TooltipProvider for all rate badges (performance: avoids per-badge context) */}
        <TooltipProvider>
        {/* AC#8: Responsive with horizontal scroll */}
        <div className={cn('overflow-x-auto -mx-6 px-6', isFetching && 'opacity-70')}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        // AC#8: Sticky first column (Campaign Name) on mobile
                        index === 0 && 'sticky left-0 z-10 bg-background',
                        index === table.getAllColumns().length - 1 && 'text-right'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original.campaignId}
                  data-testid={`campaign-row-${row.original.campaignId}`}
                  onClick={() => {
                    setSelectedCampaign(row.original);
                    setIsSheetOpen(true);
                  }}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        // AC#8: Sticky first column on mobile
                        index === 0 && 'sticky left-0 z-10 bg-card'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </TooltipProvider>

        {/* AC#3: Pagination */}
        <CampaignTablePagination
          page={page}
          pageSize={pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 1}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1); // Reset to first page
          }}
          isFetching={isFetching}
        />
      </CardContent>

      {/* Story 5.7 AC#1: Campaign Detail Sheet */}
      {/* key forces remount when campaign changes, resetting all internal state (Fix #6) */}
      <CampaignDetailSheet
        key={selectedCampaign?.campaignId ?? 'none'}
        campaign={selectedCampaign}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </Card>
  );
}
