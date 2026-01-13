/**
 * Top Sales Table Component
 * Story 2.4: Top Sales Table
 *
 * AC#1: Display table with "Top Sales This Month" header
 * AC#2: Columns - Rank, Name, Claimed, Contacted, Closed, Conv.Rate
 * AC#3: Medal icons for positions 1-3
 * AC#4: Sorted by conversion rate (handled by backend)
 * AC#5: Conversion rate format with green highlight >30%
 * AC#6: Click to navigate to sales detail page
 * AC#7: Loading & Empty states
 */
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopSalesTableSkeleton } from './top-sales-table-skeleton';
import { TopSalesTableEmpty } from './top-sales-table-empty';
import type { TopSalesPerson } from '@/types/dashboard';

// ===========================================
// Types
// ===========================================

interface TopSalesTableProps {
  data: TopSalesPerson[];
  isLoading?: boolean;
}

// ===========================================
// Constants (AC#3)
// ===========================================

const MEDALS = ['🥇', '🥈', '🥉'] as const;

// ===========================================
// Helper Components
// ===========================================

/**
 * Rank display component (AC#3)
 * Shows medals for positions 1-3, numbers for 4-5
 */
function RankDisplay({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span className="text-xl" role="img" aria-label={`Rank ${rank}`}>
        {MEDALS[rank - 1]}
      </span>
    );
  }
  return <span className="text-muted-foreground">{rank}</span>;
}

/**
 * Conversion rate display with highlight (AC#5)
 * Shows rate as "XX%" format (rounded to nearest integer)
 */
function ConversionRateDisplay({ rate }: { rate: number }) {
  const roundedRate = Math.round(rate);
  const isHighPerformer = roundedRate >= 30;
  return (
    <span
      className={cn(
        'font-medium',
        isHighPerformer && 'text-green-600'
      )}
    >
      {roundedRate}%
    </span>
  );
}

// ===========================================
// Main Component
// ===========================================

export function TopSalesTable({ data, isLoading }: TopSalesTableProps) {
  const router = useRouter();

  // AC#7: Loading state
  if (isLoading) {
    return <TopSalesTableSkeleton />;
  }

  // AC#7: Empty state
  if (!data || data.length === 0) {
    return <TopSalesTableEmpty />;
  }

  // AC#6: Click handler for navigation
  const handleRowClick = (userId: string) => {
    router.push(`/sales?userId=${userId}`);
  };

  // AC#4: Sort by conversion rate descending, ties broken by closed count
  // Defensive sorting in case backend returns unsorted data
  const topFiveSales = [...data]
    .sort((a, b) => b.conversionRate - a.conversionRate || b.closed - a.closed)
    .slice(0, 5);

  return (
    <Card data-testid="top-sales-table">
      {/* AC#1: Table header */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5" aria-hidden="true" />
          Top Sales This Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* AC#2: Table with columns */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Claimed</TableHead>
              <TableHead className="text-right">Contacted</TableHead>
              <TableHead className="text-right">Closed</TableHead>
              <TableHead className="text-right">Conv. Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topFiveSales.map((person, index) => (
              <TableRow
                key={person.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(person.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRowClick(person.id);
                  }
                }}
                data-testid={`top-sales-row-${index + 1}`}
              >
                {/* AC#3: Rank with medal */}
                <TableCell className="font-medium">
                  <RankDisplay rank={person.rank || index + 1} />
                </TableCell>
                {/* Name column */}
                <TableCell className="font-medium">{person.name}</TableCell>
                {/* Stats columns */}
                <TableCell className="text-right">
                  {person.claimed.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {person.contacted.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {person.closed.toLocaleString()}
                </TableCell>
                {/* AC#5: Conversion rate with highlight */}
                <TableCell className="text-right">
                  <ConversionRateDisplay rate={person.conversionRate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
