/**
 * Trend Chart Empty State Component
 * Story 3.5: Individual Performance Trend
 *
 * AC#7: Empty/Insufficient Data
 * - Shows "Not enough data to show trend"
 * - Message: "Minimum 7 days of data required"
 * - Empty state illustration
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, AlertCircle } from 'lucide-react';

interface TrendChartEmptyProps {
  reason: 'insufficient' | 'error' | 'no-data';
}

const EMPTY_STATES = {
  insufficient: {
    icon: BarChart3,
    title: 'Not enough data to show trend',
    description: 'Minimum 7 days of data required',
    iconColor: 'text-muted-foreground',
  },
  error: {
    icon: AlertCircle,
    title: 'Unable to load trend data',
    description: 'Please try again later',
    iconColor: 'text-destructive',
  },
  'no-data': {
    icon: TrendingUp,
    title: 'No trend data available',
    description: 'This sales person has no activity in the selected period',
    iconColor: 'text-muted-foreground',
  },
} as const;

export function TrendChartEmpty({ reason }: TrendChartEmptyProps) {
  const state = EMPTY_STATES[reason];
  const Icon = state.icon;

  return (
    <Card data-testid="trend-chart-empty">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
          Performance Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-col items-center justify-center py-12 text-center"
          data-testid={`trend-empty-${reason}`}
        >
          <div className="rounded-full bg-muted p-4 mb-4">
            <Icon
              className={`h-8 w-8 ${state.iconColor}`}
              aria-hidden="true"
            />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">
            {state.title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            {state.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
