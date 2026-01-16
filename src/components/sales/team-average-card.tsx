/**
 * Team Average Card Component
 * Story 3.2: Conversion Rate Analytics
 *
 * AC#2: Team Average Card
 * - Shows overall team conversion rate as "XX.X%"
 * - Shows comparison to previous period if data available
 * - Green arrow up for positive, red arrow down for negative
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamAverageCardProps {
  avgConversionRate: number;
  previousRate?: number; // For future comparison feature
}

export function TeamAverageCard({
  avgConversionRate,
  previousRate,
}: TeamAverageCardProps) {
  const change = previousRate != null ? avgConversionRate - previousRate : null;

  return (
    <Card data-testid="team-average-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Team Average
        </CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
        {change !== null && (
          <p
            className={cn(
              'text-xs flex items-center gap-1 mt-1',
              change > 0
                ? 'text-green-600'
                : change < 0
                  ? 'text-red-600'
                  : 'text-muted-foreground'
            )}
          >
            {change > 0 ? (
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
            ) : change < 0 ? (
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Minus className="h-3 w-3" aria-hidden="true" />
            )}
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}% vs last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
