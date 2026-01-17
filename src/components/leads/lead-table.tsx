/**
 * Lead Table Component
 * Story 4.1: Lead List Table
 * Story 4.7: Sort Columns - AC#1-9
 *
 * AC#2: Table Columns - Company, Contact Name, Email, Phone, Status, Sales Owner, Campaign, Created Date
 * AC#3: Data Display - Proper formatting for each column
 * AC#4: Status Badge Colors
 * AC#7: Responsive Design - horizontal scroll with sticky first column
 * AC#8: Default Sort - Created Date descending
 * AC#9: TanStack Table Integration
 *
 * Story 4.7:
 * AC#1: Sortable columns with indicators (Company, Status, Sales Owner, Created Date)
 * AC#2: Click to toggle ascending/descending
 * AC#3: Sort indicator display (▲/▼/↕)
 * AC#8: Server-side sorting (manualSorting: true)
 * AC#9: Accessibility (aria-sort, keyboard support)
 */
'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
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
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatThaiPhone, formatLeadDate } from '@/lib/format-lead';
import { LEAD_COLUMN_TOOLTIPS } from '@/lib/leads-constants';
import { LeadStatusBadge } from './lead-status-badge';
import type { Lead } from '@/types/lead';

// ===========================================
// Types
// ===========================================

interface LeadTableProps {
  data: Lead[];
  sorting: SortingState;
  /** Story 4.7 AC#2: Called with column ID when sort header is clicked */
  onSortingChange: (columnId: string) => void;
  onRowClick: (lead: Lead) => void;
}

// ===========================================
// Helper Components
// ===========================================

/**
 * Story 4.7 AC#1, AC#3, AC#9: Sortable Header Component
 * - Shows sort indicators (▲/▼/↕)
 * - Clickable with pointer cursor and hover state
 * - Keyboard accessible (Enter/Space)
 * - aria-sort attribute for screen readers
 */
interface SortableHeaderProps {
  columnId: string;
  sorting: SortingState;
  onSort: (columnId: string) => void;
  children: React.ReactNode;
  tooltip: string;
  className?: string;
}

function SortableHeader({ columnId, sorting, onSort, children, tooltip, className }: SortableHeaderProps) {
  // Check if this column is currently sorted
  const sortState = sorting.find(s => s.id === columnId);
  const isSorted = !!sortState;
  const isAsc = sortState?.desc === false;
  const isDesc = sortState?.desc === true;

  // AC#9: aria-sort attribute
  const ariaSort = isSorted ? (isAsc ? 'ascending' : 'descending') : 'none';

  // AC#3: Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(columnId);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex items-center gap-1 font-medium transition-colors',
              'hover:bg-muted/50 hover:text-foreground px-3 py-2 -mx-3 rounded',
              'cursor-pointer',
              // Issue #1: Focus visible state for accessibility (project-context.md)
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              // Issue #2: Touch target minimum 44x44px (px-3 py-2 ensures adequate size)
              'min-h-[44px]',
              isSorted && 'text-primary',
              className
            )}
            onClick={() => onSort(columnId)}
            onKeyDown={handleKeyDown}
            aria-sort={ariaSort}
            aria-label={`Sort by ${children}${isSorted ? (isAsc ? ', currently ascending' : ', currently descending') : ''}`}
            tabIndex={0}
            // Issue #4: Removed redundant role="button" - implicit on <button>
            data-testid={`sort-header-${columnId}`}
          >
            {children}
            {/* AC#3: Sort indicator */}
            {isAsc ? (
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            ) : isDesc ? (
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" aria-hidden="true" />
            )}
            <HelpCircle className="h-3 w-3 opacity-40" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Story 4.7 AC#1: Non-sortable Header Component
 * - Displays column name with tooltip
 * - No sort functionality or indicators
 * - Used for columns: customerName, email, phone, campaignName
 */
interface PlainHeaderProps {
  /** Column header text */
  children: React.ReactNode;
  /** Tooltip description for the column */
  tooltip: string;
  /** Additional CSS classes */
  className?: string;
}

function PlainHeader({ children, tooltip, className }: PlainHeaderProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('flex items-center gap-1 font-medium', className)}>
            {children}
            <HelpCircle className="h-3 w-3 opacity-40" aria-hidden="true" />
          </span>
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

export function LeadTable({ data, sorting, onSortingChange, onRowClick }: LeadTableProps) {
  // Define columns (AC#2)
  // Story 4.7 AC#1: Only company, status, salesOwnerName, createdAt are sortable
  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: 'company',
        // Story 4.7 AC#1: Sortable column
        enableSorting: true,
        header: () => (
          <SortableHeader
            columnId="company"
            sorting={sorting}
            onSort={onSortingChange}
            tooltip={LEAD_COLUMN_TOOLTIPS.company}
          >
            Company
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <div className="min-w-[200px]">
            <span className="font-medium">{row.original.company}</span>
            {row.original.industryAI && (
              <Badge variant="outline" className="ml-2 text-xs">
                {row.original.industryAI}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'customerName',
        // Story 4.7 AC#1: Non-sortable column
        enableSorting: false,
        header: () => (
          <PlainHeader tooltip={LEAD_COLUMN_TOOLTIPS.customerName}>
            Contact Name
          </PlainHeader>
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'email',
        // Story 4.7 AC#1: Non-sortable column
        enableSorting: false,
        header: () => (
          <PlainHeader tooltip={LEAD_COLUMN_TOOLTIPS.email}>
            Email
          </PlainHeader>
        ),
        cell: ({ getValue }) => {
          const email = getValue() as string;
          return (
            <a
              href={`mailto:${email}`}
              className="text-blue-600 hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Send email to ${email}`}
            >
              <Mail className="h-3 w-3" aria-hidden="true" />
              {email}
            </a>
          );
        },
      },
      {
        accessorKey: 'phone',
        // Story 4.7 AC#1: Non-sortable column
        enableSorting: false,
        header: () => (
          <PlainHeader tooltip={LEAD_COLUMN_TOOLTIPS.phone}>
            Phone
          </PlainHeader>
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatThaiPhone(getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        // Story 4.7 AC#1: Sortable column
        enableSorting: true,
        header: () => (
          <SortableHeader
            columnId="status"
            sorting={sorting}
            onSort={onSortingChange}
            tooltip={LEAD_COLUMN_TOOLTIPS.status}
          >
            Status
          </SortableHeader>
        ),
        cell: ({ row }) => <LeadStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'salesOwnerName',
        // Story 4.7 AC#1: Sortable column
        enableSorting: true,
        header: () => (
          <SortableHeader
            columnId="salesOwnerName"
            sorting={sorting}
            onSort={onSortingChange}
            tooltip={LEAD_COLUMN_TOOLTIPS.salesOwnerName}
          >
            Sales Owner
          </SortableHeader>
        ),
        cell: ({ getValue }) => (
          <span className={cn(!getValue() && 'text-muted-foreground')}>
            {(getValue() as string | null) || 'Unassigned'}
          </span>
        ),
      },
      {
        accessorKey: 'campaignName',
        // Story 4.7 AC#1: Non-sortable column
        enableSorting: false,
        header: () => (
          <PlainHeader tooltip={LEAD_COLUMN_TOOLTIPS.campaignName}>
            Campaign
          </PlainHeader>
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        // Story 4.7 AC#1: Sortable column
        enableSorting: true,
        header: () => (
          <SortableHeader
            columnId="createdAt"
            sorting={sorting}
            onSort={onSortingChange}
            tooltip={LEAD_COLUMN_TOOLTIPS.createdAt}
            className="justify-end"
          >
            Created Date
          </SortableHeader>
        ),
        cell: ({ getValue }) => (
          <span className="text-right block whitespace-nowrap tabular-nums">
            {formatLeadDate(getValue() as string)}
          </span>
        ),
      },
    ],
    [sorting, onSortingChange]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    // Story 4.7 AC#8: Server-side sorting - don't use client-side sorting
    manualSorting: true,
  });

  return (
    <Card data-testid="lead-table">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" aria-hidden="true" />
          Lead List
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* AC#7: Responsive with horizontal scroll */}
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        // AC#7: Sticky first column (Company)
                        index === 0 && 'sticky left-0 z-10 bg-background',
                        index === header.getContext().table.getAllColumns().length - 1 && 'text-right'
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
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onRowClick(row.original)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick(row.original);
                    }
                  }}
                  data-testid={`lead-row-${row.original.row}`}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        // AC#7: Sticky first column
                        index === 0 && 'sticky left-0 z-10 bg-background'
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
      </CardContent>
    </Card>
  );
}
