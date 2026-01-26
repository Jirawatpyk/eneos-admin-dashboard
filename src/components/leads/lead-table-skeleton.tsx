/**
 * Lead Table Skeleton Component
 * Story 4.1: Lead List Table
 * Story 4.15: Updated to 9 columns (added Capital, Location)
 *
 * AC#6: Loading state shows skeleton table rows (9 columns structure)
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

// Column widths matching the actual table structure (Story 4.15: 9 columns)
const COLUMN_WIDTHS = [
  'w-[200px]', // Company
  'w-[140px]', // Capital (Story 4.15)
  'w-[120px]', // Location (Story 4.15)
  'w-[120px]', // Name
  'w-[180px]', // Email
  'w-[100px]', // Phone
  'w-[80px]',  // Status
  'w-[100px]', // Sales Owner
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
                {/* Company */}
                <TableHead className="sticky left-0 z-10 bg-background">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                {/* Capital - Story 4.15 */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Location - Story 4.15 */}
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                {/* Name */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Email */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Phone */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Status */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Sales Owner */}
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                {/* Date */}
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
