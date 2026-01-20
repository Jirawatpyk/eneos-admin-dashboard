/**
 * Activity Log Skeleton Component (Story 7-7)
 * AC#7: Loading state skeleton while data is fetching
 */
'use client';

import { Skeleton } from '@/components/ui/skeleton';
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
    <div className="rounded-md border" data-testid="activity-log-skeleton">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[170px]">Timestamp</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Changed By</TableHead>
            <TableHead className="w-[200px]">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i} data-testid={i === 0 ? 'skeleton-row' : undefined}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-36" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
