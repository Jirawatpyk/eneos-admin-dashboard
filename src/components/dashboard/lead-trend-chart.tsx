/**
 * Lead Trend Chart Component
 * Story 2.2: Lead Trend Chart
 *
 * AC#1: Line chart showing lead trends for last 30 days
 * AC#2: Dual lines for "New Leads" (blue) and "Closed" (green)
 * AC#3: Readable axis labels (X=dates, Y=count)
 * AC#4: Hover tooltip with date and values
 * AC#5: Legend with toggle functionality
 * AC#8: Responsive sizing
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart } from '@tremor/react';
import { TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { LeadTrendChartSkeleton } from './lead-trend-chart-skeleton';
import { LeadTrendChartEmpty } from './lead-trend-chart-empty';
import type { DailyTrend } from '@/types/dashboard';

interface TremorChartData {
  date: string;
  'New Leads': number;
  Closed: number;
}

interface LeadTrendChartProps {
  data?: DailyTrend[];
  isLoading?: boolean;
}

/**
 * Format date for display on X-axis (e.g., "Jan 15")
 */
function formatDateLabel(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d');
  } catch {
    return dateString;
  }
}

/**
 * Transform API data to Tremor chart format
 */
function transformToTremorData(apiData: DailyTrend[]): TremorChartData[] {
  return apiData.map((item) => ({
    date: formatDateLabel(item.date),
    'New Leads': item.newLeads,
    Closed: item.closed,
  }));
}

/**
 * Custom tooltip formatter
 */
function valueFormatter(value: number): string {
  return value.toLocaleString();
}

/**
 * Lead Trend Chart - displays lead trends over the last 30 days
 */
export function LeadTrendChart({ data, isLoading }: LeadTrendChartProps) {
  // AC#6: Show skeleton while loading
  if (isLoading) {
    return <LeadTrendChartSkeleton />;
  }

  // AC#7: Show empty state when no data
  if (!data || data.length === 0) {
    return <LeadTrendChartEmpty />;
  }

  const chartData = transformToTremorData(data);

  return (
    <Card data-testid="lead-trend-chart">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
          Lead Trend (30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* AC#1, AC#2: Area chart with dual series */}
        <AreaChart
          className="h-72"
          data={chartData}
          index="date"
          categories={['New Leads', 'Closed']}
          colors={['blue', 'emerald']}
          valueFormatter={valueFormatter}
          showLegend={true}
          showGridLines={true}
          showAnimation={true}
          curveType="monotone"
          connectNulls={true}
          data-testid="trend-area-chart"
        />
      </CardContent>
    </Card>
  );
}
