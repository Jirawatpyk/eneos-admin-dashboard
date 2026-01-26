/**
 * Lead Table Skeleton Component
 * Story 4.1: Lead List Table
 * Story 4.9: Added checkbox column
 * Story 4.15: Updated to 9 columns (added Capital, Location)
 * Story 4.16: Responsive mobile column visibility
 *
 * AC#6: Loading state shows skeleton table rows (10 columns with checkbox)
 * Story 4.16 AC#8: Hide columns on mobile (< 768px) except Checkbox, Company, Status, Owner
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// Number of skeleton rows to display
const SKELETON_ROWS = 10;

// Column configuration matching the actual table structure
// Story 4.16: Added mobileHidden flag for responsive design
const COLUMNS = [
  { width: 'w-10', label: 'Checkbox', sticky: 'left-0', mobileHidden: false }, // Story 4.9
  { width: 'w-[200px]', label: 'Company', sticky: 'left-10', mobileHidden: false },
  { width: 'w-[140px]', label: 'Capital', sticky: null, mobileHidden: true }, // Story 4.15
  { width: 'w-[120px]', label: 'Location', sticky: null, mobileHidden: true }, // Story 4.15
  { width: 'w-[120px]', label: 'Contact', sticky: null, mobileHidden: true },
  { width: 'w-[180px]', label: 'Email', sticky: null, mobileHidden: true },
  { width: 'w-[100px]', label: 'Phone', sticky: null, mobileHidden: true },
  { width: 'w-[80px]', label: 'Status', sticky: null, mobileHidden: false },
  { width: 'w-[100px]', label: 'Sales Owner', sticky: null, mobileHidden: false },
  { width: 'w-[100px]', label: 'Date', sticky: null, mobileHidden: true },
];

export function LeadTableSkeleton() {
  return (
    <Card data-testid="lead-table-skeleton" aria-busy="true">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" aria-hidden="true" />
          Lead List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.map((col, index) => (
                  <TableHead
                    key={index}
                    className={cn(
                      // Story 4.9 AC#1: Checkbox column sticky (matching lead-table.tsx)
                      index === 0 && 'sticky left-0 z-10 bg-background w-10',
                      // AC#7: Sticky second column (Company)
                      index === 1 && 'sticky left-10 z-10 bg-background',
                      // Other columns: apply mobile visibility
                      index > 1 && col.mobileHidden && 'hidden md:table-cell',
                      index === COLUMNS.length - 1 && 'text-right'
                    )}
                  >
                    <Skeleton className={cn(
                      'h-4',
                      index === 0 ? 'w-6' : 'w-16',
                      index === COLUMNS.length - 1 && 'ml-auto'
                    )} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {COLUMNS.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={cn(
                        // Story 4.9 AC#1: Checkbox column sticky (matching lead-table.tsx)
                        colIndex === 0 && 'sticky left-0 z-10 bg-card w-10',
                        // AC#7: Sticky second column (Company)
                        colIndex === 1 && 'sticky left-10 z-10 bg-card',
                        // Other columns: apply mobile visibility
                        colIndex > 1 && col.mobileHidden && 'hidden md:table-cell'
                      )}
                    >
                      {/* Checkbox column */}
                      {colIndex === 0 ? (
                        <Skeleton className="h-4 w-4" />
                      ) : (
                        <>
                          <Skeleton className={`h-4 ${col.width}`} />
                          {/* Company column (index 1) has additional badge on some rows */}
                          {colIndex === 1 && rowIndex % 3 === 0 && (
                            <Skeleton className="h-5 w-16 mt-1" />
                          )}
                        </>
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
  );
}
