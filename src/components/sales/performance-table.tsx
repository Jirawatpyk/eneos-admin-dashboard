/**
 * Performance Table Component
 * Story 3.1: Sales Team Performance Table
 *
 * AC#1: Table display with "Sales Team Performance" header
 * AC#2: Columns with proper alignment and tooltips
 * AC#3: Data accuracy (from backend)
 * AC#4: Conversion rate formatting
 * AC#5: Response time formatting
 * AC#6: Column sorting with TanStack Table
 * AC#7: Row click for detail panel
 * AC#9: Responsive design with sticky first column
 */
'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Users, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatResponseTime,
  getConversionRateValue,
  getResponseTimeValue,
  getResponseTimeStatus,
  getResponseTimeBgColor,
} from '@/lib/format-sales';
import { SalesDetailSheet } from './sales-detail-sheet';
import { ConversionProgressBar } from './conversion-progress-bar';
import { TargetProgressCell } from './target-progress-cell';
import type { SalesPersonMetrics } from '@/types/sales';

// ===========================================
// Types
// ===========================================

interface PerformanceTableProps {
  data: SalesPersonMetrics[];
  /** User ID to highlight (from summary card click) */
  highlightedUserId?: string | null;
  /** Story 3.7: Per-person prorated target for closed deals */
  closedTarget?: number;
  /** Story 3.7: Enable target comparison in Closed column */
  showTargetComparison?: boolean;
}

// ===========================================
// Column Tooltips (AC#2)
// ===========================================

const COLUMN_TOOLTIPS: Record<string, string> = {
  name: 'Sales team member name',
  claimed: 'Number of leads assigned to this person',
  contacted: 'Number of leads contacted',
  closed: 'Number of successful sales closures',
  lost: 'Number of lost deals',
  unreachable: 'Number of leads that could not be reached',
  conversionRate: 'Target: 30% | Calculation: Closed ÷ Claimed × 100',
  avgResponseTime: 'Average time to first contact after lead assignment',
};

// ===========================================
// Helper Components
// ===========================================

interface SortableHeaderProps {
  column: {
    getIsSorted: () => false | 'asc' | 'desc';
    toggleSorting: (desc?: boolean) => void;
  };
  children: React.ReactNode;
  tooltip: string;
  className?: string;
}

function SortableHeader({ column, children, tooltip, className }: SortableHeaderProps) {
  const sorted = column.getIsSorted();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-1 font-medium hover:text-foreground transition-colors',
              className
            )}
            onClick={() => column.toggleSorting(sorted === 'asc')}
            aria-label={`Sort by ${children}`}
          >
            {children}
            {sorted === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : sorted === 'desc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
            <HelpCircle className="h-3 w-3 opacity-40" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ===========================================
// Main Component
// ===========================================

export function PerformanceTable({
  data,
  highlightedUserId,
  closedTarget,
  showTargetComparison = false,
}: PerformanceTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPerson, setSelectedPerson] = useState<SalesPersonMetrics | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // AC#6: Initialize sorting state from URL or default to conversionRate DESC
  const initialSortId = searchParams.get('sortBy') || 'conversionRate';
  const initialSortDesc = searchParams.get('sortDir') !== 'asc';

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialSortId, desc: initialSortDesc },
  ]);

  // AC#6: Persist sort state in URL params (shareable)
  const handleSortingChange = (updater: SortingState | ((prev: SortingState) => SortingState)) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
    setSorting(newSorting);

    if (newSorting.length > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sortBy', newSorting[0].id);
      params.set('sortDir', newSorting[0].desc ? 'desc' : 'asc');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  // AC#7: Handle row click
  const handleRowClick = (person: SalesPersonMetrics) => {
    setSelectedPerson(person);
    setSheetOpen(true);
  };

  // Define columns
  const columns = useMemo<ColumnDef<SalesPersonMetrics>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <SortableHeader column={column} tooltip={COLUMN_TOOLTIPS.name}>
            Name
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue('name')}</span>
        ),
      },
      {
        accessorKey: 'claimed',
        header: ({ column }) => (
          <SortableHeader
            column={column}
            tooltip={COLUMN_TOOLTIPS.claimed}
            className="justify-end"
          >
            Claimed
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="text-right block">
            {(row.getValue('claimed') as number).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'contacted',
        header: ({ column }) => (
          <SortableHeader
            column={column}
            tooltip={COLUMN_TOOLTIPS.contacted}
            className="justify-end"
          >
            Contacted
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="text-right block">
            {(row.getValue('contacted') as number).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'closed',
        header: ({ column }) => (
          <SortableHeader
            column={column}
            tooltip={
              showTargetComparison && closedTarget
                ? `Target: ${Math.round(closedTarget)}/person | ${COLUMN_TOOLTIPS.closed}`
                : COLUMN_TOOLTIPS.closed
            }
            className="justify-end"
          >
            Closed
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const closedValue = row.getValue('closed') as number;

          // Story 3.7 AC#3, AC#4: Show target comparison if enabled
          if (showTargetComparison && closedTarget != null && closedTarget > 0) {
            return (
              <TargetProgressCell
                actual={closedValue}
                target={closedTarget}
                metricLabel="closed"
              />
            );
          }

          // Default: just show the number
          return (
            <span className="text-right block">
              {closedValue.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: 'lost',
        header: ({ column }) => (
          <SortableHeader
            column={column}
            tooltip={COLUMN_TOOLTIPS.lost}
            className="justify-end"
          >
            Lost
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="text-right block">
            {(row.getValue('lost') as number).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'unreachable',
        header: ({ column }) => (
          <SortableHeader
            column={column}
            tooltip={COLUMN_TOOLTIPS.unreachable}
            className="justify-end"
          >
            Unreachable
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="text-right block">
            {(row.getValue('unreachable') as number).toLocaleString()}
          </span>
        ),
      },
      {
        id: 'conversionRate',
        accessorFn: (row) => getConversionRateValue(row.closed, row.claimed),
        header: ({ column }) => (
          <SortableHeader
            column={column}
            tooltip={COLUMN_TOOLTIPS.conversionRate}
            className="justify-end"
          >
            Conv. Rate
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const rate = row.getValue('conversionRate') as number;
          // AC#5 (Story 3.2): Visual progress bar with percentage
          return <ConversionProgressBar rate={rate} />;
        },
        sortingFn: 'basic',
      },
      {
        id: 'avgResponseTime',
        accessorFn: (row) => getResponseTimeValue(row.avgResponseTime),
        header: ({ column }) => (
          <SortableHeader
            column={column}
            tooltip={COLUMN_TOOLTIPS.avgResponseTime}
            className="justify-end"
          >
            Avg Response
          </SortableHeader>
        ),
        // AC#4 (Story 3.4): Color indicators for response time
        cell: ({ row }) => {
          const responseTime = row.original.avgResponseTime;
          const status = getResponseTimeStatus(responseTime);
          return (
            <div className="flex items-center justify-end gap-2">
              {status && (
                <span
                  className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    getResponseTimeBgColor(status)
                  )}
                  aria-hidden="true"
                  data-testid={`response-time-indicator-${status}`}
                />
              )}
              <span className="text-right tabular-nums">
                {formatResponseTime(responseTime)}
              </span>
            </div>
          );
        },
        sortingFn: 'basic',
      },
    ],
    [showTargetComparison, closedTarget]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <Card data-testid="performance-table">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" aria-hidden="true" />
            Sales Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* AC#9: Responsive with horizontal scroll */}
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          // AC#9: Sticky first column
                          index === 0 && 'sticky left-0 z-10 bg-background',
                          index > 0 && 'text-right'
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'cursor-pointer hover:bg-muted/50 transition-colors',
                      highlightedUserId === row.original.userId &&
                        'bg-primary/20 ring-2 ring-primary ring-inset animate-pulse'
                    )}
                    onClick={() => handleRowClick(row.original)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRowClick(row.original);
                      }
                    }}
                    data-testid={`performance-row-${row.original.userId}`}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          // AC#9: Sticky first column
                          index === 0 && 'sticky left-0 z-10 bg-background'
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* AC#7: Detail Sheet */}
      <SalesDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        salesPerson={selectedPerson}
      />
    </>
  );
}
