/**
 * Campaign Table Skeleton Component
 * Story 5.4: Campaign Table
 *
 * AC#5: Loading state shows skeleton rows matching table structure
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
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Number of skeleton rows to display */
const SKELETON_ROWS = 10;

/** Column configuration matching the actual table structure */
const COLUMNS = [
  { width: 'w-[200px]', label: 'Campaign Name', sticky: true },
  { width: 'w-[80px]', label: 'Delivered', sticky: false },
  { width: 'w-[80px]', label: 'Opened', sticky: false },
  { width: 'w-[80px]', label: 'Clicked', sticky: false },
  { width: 'w-[80px]', label: 'Open Rate', sticky: false },
  { width: 'w-[80px]', label: 'Click Rate', sticky: false },
  { width: 'w-[100px]', label: 'Last Updated', sticky: false },
];

export function CampaignTableSkeleton() {
  return (
    <Card data-testid="campaign-table-skeleton" aria-busy="true">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5" aria-hidden="true" />
          All Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.map((col, index) => (
                  <TableHead
                    key={index}
                    className={cn(
                      // AC#5: Match sticky column styling
                      index === 0 && 'sticky left-0 z-10 bg-background',
                      index === COLUMNS.length - 1 && 'text-right'
                    )}
                  >
                    <Skeleton
                      className={cn(
                        'h-4',
                        index === 0 ? 'w-24' : 'w-16',
                        index === COLUMNS.length - 1 && 'ml-auto'
                      )}
                    />
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
                        // AC#5: Match sticky column styling
                        colIndex === 0 && 'sticky left-0 z-10 bg-card'
                      )}
                    >
                      <Skeleton className={`h-4 ${col.width}`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-[70px]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
