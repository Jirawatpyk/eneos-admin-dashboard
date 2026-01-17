/**
 * Lead Table Component
 * Story 4.1: Lead List Table
 *
 * AC#2: Table Columns - Company, Contact Name, Email, Phone, Status, Sales Owner, Campaign, Created Date
 * AC#3: Data Display - Proper formatting for each column
 * AC#4: Status Badge Colors
 * AC#7: Responsive Design - horizontal scroll with sticky first column
 * AC#8: Default Sort - Created Date descending
 * AC#9: TanStack Table Integration
 */
'use client';

import { useMemo } from 'react';
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
  onSortingChange: (sorting: SortingState) => void;
  onRowClick: (lead: Lead) => void;
}

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

export function LeadTable({ data, sorting, onSortingChange, onRowClick }: LeadTableProps) {
  // Define columns (AC#2)
  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: 'company',
        header: ({ column }) => (
          <SortableHeader column={column} tooltip={LEAD_COLUMN_TOOLTIPS.company}>
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
        header: ({ column }) => (
          <SortableHeader column={column} tooltip={LEAD_COLUMN_TOOLTIPS.customerName}>
            Contact Name
          </SortableHeader>
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <SortableHeader column={column} tooltip={LEAD_COLUMN_TOOLTIPS.email}>
            Email
          </SortableHeader>
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
        header: ({ column }) => (
          <SortableHeader column={column} tooltip={LEAD_COLUMN_TOOLTIPS.phone}>
            Phone
          </SortableHeader>
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatThaiPhone(getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <SortableHeader column={column} tooltip={LEAD_COLUMN_TOOLTIPS.status}>
            Status
          </SortableHeader>
        ),
        cell: ({ row }) => <LeadStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'salesOwnerName',
        header: ({ column }) => (
          <SortableHeader column={column} tooltip={LEAD_COLUMN_TOOLTIPS.salesOwnerName}>
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
        header: ({ column }) => (
          <SortableHeader column={column} tooltip={LEAD_COLUMN_TOOLTIPS.campaignName}>
            Campaign
          </SortableHeader>
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <SortableHeader
            column={column}
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
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange(newSorting);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
