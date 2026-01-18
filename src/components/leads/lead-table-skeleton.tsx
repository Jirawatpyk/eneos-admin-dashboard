/**
 * Lead Table Skeleton Component
 * Story 4.1: Lead List Table
 *
 * AC#6: Loading state shows skeleton table rows (8 columns structure)
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

// Number of skeleton rows to display
const SKELETON_ROWS = 10;

// Column widths matching the actual table structure
const COLUMN_WIDTHS = [
  'w-[200px]', // Company
  'w-[120px]', // Name
  'w-[180px]', // Email
  'w-[100px]', // Phone
  'w-[80px]',  // Status
  'w-[100px]', // Sales Owner
  'w-[120px]', // Campaign
  'w-[100px]', // Date
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
                <TableHead className="sticky left-0 z-10 bg-background">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-4 w-24 ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {COLUMN_WIDTHS.map((width, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={colIndex === 0 ? 'sticky left-0 z-10 bg-background' : ''}
                    >
                      <Skeleton className={`h-4 ${width}`} />
                      {/* Company column has additional industry badge */}
                      {colIndex === 0 && rowIndex % 3 === 0 && (
                        <Skeleton className="h-5 w-16 mt-1" />
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
