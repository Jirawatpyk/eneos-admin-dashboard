/**
 * Best Performer Card Component
 * Story 3.2: Conversion Rate Analytics
 *
 * AC#3: Best Performer Card
 * - Shows name of person with highest conversion rate
 * - Shows their conversion rate percentage
 * - Tie resolved alphabetically by name
 * - Clicking scrolls to/highlights that person in table
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import type { SalesPersonMetrics } from '@/types/sales';

interface BestPerformerCardProps {
  teamPerformance: SalesPersonMetrics[];
  onClick?: (userId: string) => void;
}

/**
 * Find the best performer from team data
 * Resolves ties alphabetically by name
 */
function findBestPerformer(
  team: SalesPersonMetrics[]
): SalesPersonMetrics | null {
  if (team.length === 0) return null;

  // Filter out those with no closed leads (can't have valid conversion)
  const withClosed = team.filter((p) => p.closed > 0);
  if (withClosed.length === 0) return null;

  // Find highest conversion rate
  const maxRate = Math.max(...withClosed.map((p) => p.conversionRate));

  // Get all with max rate and sort alphabetically
  const topPerformers = withClosed
    .filter((p) => p.conversionRate === maxRate)
    .sort((a, b) => a.name.localeCompare(b.name));

  return topPerformers[0] || null;
}

export function BestPerformerCard({
  teamPerformance,
  onClick,
}: BestPerformerCardProps) {
  const bestPerformer = findBestPerformer(teamPerformance);

  const handleClick = () => {
    if (bestPerformer && onClick) {
      onClick(bestPerformer.userId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      data-testid="best-performer-card"
      className={bestPerformer ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={bestPerformer ? 0 : undefined}
      role={bestPerformer ? 'button' : undefined}
      aria-label={
        bestPerformer
          ? `View ${bestPerformer.name}'s performance in table`
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Best Performer
        </CardTitle>
        <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {bestPerformer ? (
          <>
            <div className="text-2xl font-bold truncate">{bestPerformer.name}</div>
            <p className="text-xs text-green-600 mt-1">
              {bestPerformer.conversionRate.toFixed(1)}%
            </p>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-muted-foreground">No data</div>
            <p className="text-xs text-muted-foreground mt-1">
              No closed leads yet
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
