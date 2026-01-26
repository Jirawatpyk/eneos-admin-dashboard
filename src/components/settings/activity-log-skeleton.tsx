/**
 * Activity Log Skeleton Component (Story 7-7)
 * AC#7: Loading state skeleton while data is fetching
 */
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ActivityLogSkeletonProps {
  rows?: number;
}

export function ActivityLogSkeleton({ rows = 10 }: ActivityLogSkeletonProps) {
  return (
    <Card className="overflow-hidden" data-testid="activity-log-skeleton">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[170px] whitespace-nowrap">Timestamp</TableHead>
              <TableHead className="min-w-[180px]">Company</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[120px]">Changed By</TableHead>
              <TableHead className="min-w-[200px]">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i} data-testid={i === 0 ? 'skeleton-row' : undefined}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap py-3">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="font-medium py-3">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="py-3">
                  <Skeleton className="h-6 w-20 rounded-md" />
                </TableCell>
                <TableCell className="py-3">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground py-3">
                  <Skeleton className="h-4 w-36" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
