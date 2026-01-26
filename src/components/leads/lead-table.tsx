/**
 * Lead Table Component
 * Story 4.1: Lead List Table
 * Story 4.7: Sort Columns - AC#1-9
 * Story 4.9: Bulk Select - AC#1, AC#2, AC#3
 *
 * AC#2: Table Columns - Company, Name, Email, Phone, Status, Sales Owner, Date
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
 *
 * Story 4.9:
 * AC#1: Selection checkbox column as first column (40px, sticky)
 * AC#2: Individual row selection with visual highlight
 * AC#3: Select all checkbox in header with indeterminate state
 */
'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type VisibilityState,
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
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle, Mail, MapPin } from 'lucide-react';
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
  // Story 4.9: Selection props
  /** Set of selected row IDs */
  selectedIds: Set<number>;
  /** Called when a row checkbox is toggled */
  onToggleSelection: (rowId: number) => void;
  /** Called when header checkbox is clicked */
  onSelectAll: (rowIds: number[]) => void;
  /** True if all visible rows are selected */
  isAllSelected: boolean;
  /** True if some (but not all) visible rows are selected */
  isSomeSelected: boolean;
  // Tech Debt: Column visibility toggle
  /** Column visibility state from TanStack Table */
  columnVisibility?: VisibilityState;
}

/**
 * Story 4.9: Table meta type for accessing selection state in column definitions
 * TanStack Table uses meta to pass arbitrary data to columns
 */
interface TableMeta {
  selectedIds: Set<number>;
  onToggleSelection: (rowId: number) => void;
  onSelectAll: (rowIds: number[]) => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
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
            // Note: aria-sort moved to parent th via aria-label (aria-sort only valid on columnheader role)
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
 * - Used for columns: customerName, email, phone
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

export function LeadTable({
  data,
  sorting,
  onSortingChange,
  onRowClick,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  isAllSelected,
  isSomeSelected,
  columnVisibility,
}: LeadTableProps) {
  // Define columns (AC#2)
  // Story 4.7 AC#1: Only company, status, salesOwnerName, createdAt are sortable
  // Story 4.9 AC#1: Checkbox column as first column
  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      // Story 4.9 AC#1: Selection checkbox column (first position)
      {
        id: 'select',
        header: ({ table }) => {
          const meta = table.options.meta as TableMeta;
          const allRowIds = table.getRowModel().rows.map((row) => row.original.row);

          // AC#3: Determine checked state: true | false | 'indeterminate'
          const checkedState = meta.isAllSelected
            ? true
            : meta.isSomeSelected
              ? 'indeterminate'
              : false;

          return (
            <Checkbox
              checked={checkedState}
              onCheckedChange={() => meta.onSelectAll(allRowIds)}
              aria-label="Select all leads on this page"
              onClick={(e) => e.stopPropagation()}
              data-testid="select-all-checkbox"
            />
          );
        },
        cell: ({ row, table }) => {
          const meta = table.options.meta as TableMeta;
          return (
            <Checkbox
              checked={meta.selectedIds.has(row.original.row)}
              onCheckedChange={() => meta.onToggleSelection(row.original.row)}
              aria-label={`Select ${row.original.company}`}
              onClick={(e) => e.stopPropagation()}
              data-testid={`select-checkbox-${row.original.row}`}
            />
          );
        },
        enableSorting: false,
        size: 40,
      },
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
            {/* Story 4.15 AC#1: DBD Sector badge (replaced Industry badge) */}
            {row.original.dbdSector && (
              <Badge className="ml-2 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                {row.original.dbdSector}
              </Badge>
            )}
            {/* Story 4.15 AC#3: Location moved to separate column */}
          </div>
        ),
      },
      // Story 4.15 AC#2: Capital Column - Registered Capital
      {
        accessorKey: 'capital',
        enableSorting: true,
        header: () => (
          <SortableHeader
            columnId="capital"
            sorting={sorting}
            onSort={onSortingChange}
            tooltip={LEAD_COLUMN_TOOLTIPS.capital}
          >
            Capital
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const capital = row.original.capital;
          const displayValue = capital && capital !== 'ไม่ระบุ' ? capital : '-';
          return (
            <span className="block whitespace-nowrap min-w-[140px]">
              {displayValue}
            </span>
          );
        },
        // Story 4.16 AC#8: Mobile column visibility meta
        meta: {
          headerClassName: 'hidden md:table-cell',
          cellClassName: 'hidden md:table-cell',
        },
      },
      // Story 4.15 AC#3: Location Column - Province with fallback to City
      {
        accessorKey: 'province', // Use province as primary accessor
        id: 'location', // Custom ID for column visibility
        enableSorting: false,
        header: () => (
          <PlainHeader tooltip={LEAD_COLUMN_TOOLTIPS.location}>
            Location
          </PlainHeader>
        ),
        cell: ({ row }) => {
          const location = row.original.province || row.original.city;
          return (
            <span className="block min-w-[120px]">
              {location ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {location}
                </span>
              ) : (
                '-'
              )}
            </span>
          );
        },
        // Story 4.16 AC#8: Mobile column visibility meta
        meta: {
          headerClassName: 'hidden md:table-cell',
          cellClassName: 'hidden md:table-cell',
        },
      },
      {
        accessorKey: 'customerName',
        // Story 4.7 AC#1: Non-sortable column
        enableSorting: false,
        header: () => (
          <PlainHeader tooltip={LEAD_COLUMN_TOOLTIPS.customerName}>
            Contact
          </PlainHeader>
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{getValue() as string}</span>
        ),
        // Story 4.16 AC#8: Mobile column visibility meta
        meta: {
          headerClassName: 'hidden md:table-cell',
          cellClassName: 'hidden md:table-cell',
        },
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
        // Story 4.16 AC#8: Mobile column visibility meta
        meta: {
          headerClassName: 'hidden md:table-cell',
          cellClassName: 'hidden md:table-cell',
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
        // Story 4.16 AC#8: Mobile column visibility meta
        meta: {
          headerClassName: 'hidden md:table-cell',
          cellClassName: 'hidden md:table-cell',
        },
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
            Date
          </SortableHeader>
        ),
        cell: ({ getValue }) => (
          <span className="text-right block whitespace-nowrap tabular-nums">
            {formatLeadDate(getValue() as string)}
          </span>
        ),
        // Story 4.16 AC#8: Mobile column visibility meta
        meta: {
          headerClassName: 'hidden md:table-cell',
          cellClassName: 'hidden md:table-cell',
        },
      },
    ],
    [sorting, onSortingChange]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      // Tech Debt: Column visibility toggle
      columnVisibility,
    },
    getCoreRowModel: getCoreRowModel(),
    // Story 4.7 AC#8: Server-side sorting - don't use client-side sorting
    manualSorting: true,
    // Story 4.9: Pass selection state to columns via meta
    meta: {
      selectedIds,
      onToggleSelection,
      onSelectAll,
      isAllSelected,
      isSomeSelected,
    } as TableMeta,
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
        {/* Story 4.15 AC#5: Responsive design with horizontal scroll for grounding fields */}
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    // Story 4.7 AC#9: aria-sort on columnheader for accessibility
                    const isSortable = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();
                    const ariaSort = isSortable
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : sortDirection === 'desc'
                          ? 'descending'
                          : 'none'
                      : undefined;

                    // Story 4.16 AC#8: Extract mobile visibility classes from column meta
                    const columnMeta = header.column.columnDef.meta as { headerClassName?: string; cellClassName?: string } | undefined;
                    const mobileHeaderClass = columnMeta?.headerClassName || '';

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          // Story 4.9 AC#1: Checkbox column sticky (40px width)
                          index === 0 && 'sticky left-0 z-10 bg-background w-10',
                          // AC#7: Sticky second column (Company) - positioned after checkbox
                          index === 1 && 'sticky left-10 z-10 bg-background',
                          index === header.getContext().table.getAllColumns().length - 1 && 'text-right',
                          // Story 4.16 AC#8: Mobile column visibility
                          mobileHeaderClass
                        )}
                        aria-sort={ariaSort}
                        data-testid={isSortable ? `column-header-${header.id}` : undefined}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50 transition-colors',
                    // Story 4.9 AC#2: Visual highlight for selected rows
                    selectedIds.has(row.original.row) && 'bg-blue-50 dark:bg-blue-950/50'
                  )}
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
                  data-selected={selectedIds.has(row.original.row)}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    // Story 4.16 AC#8: Extract mobile visibility classes from column meta
                    const columnMeta = cell.column.columnDef.meta as { headerClassName?: string; cellClassName?: string } | undefined;
                    const mobileCellClass = columnMeta?.cellClassName || '';

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          // Story 4.9 AC#1: Checkbox column sticky (40px width)
                          index === 0 && 'sticky left-0 z-10 bg-card w-10',
                          // AC#7: Sticky second column (Company)
                          index === 1 && 'sticky left-10 z-10 bg-card',
                          // Story 4.16 AC#8: Mobile column visibility
                          mobileCellClass
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
