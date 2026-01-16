/**
 * Individual Trend Chart Component
 * Story 3.5: Individual Performance Trend
 *
 * AC#1: Trend Chart in Detail Sheet
 * AC#2: Multi-Metric Display (Claimed, Closed)
 * AC#3: Time Period Selection (7, 30, 90 days)
 * AC#4: Team Average Comparison (dashed gray line)
 * AC#9: Responsive Design
 */
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useSalesTrend } from '@/hooks/use-sales-trend';
import { TrendChartSkeleton } from './trend-chart-skeleton';
import { TrendChartEmpty } from './trend-chart-empty';
import { TrendChartTooltip } from './trend-chart-tooltip';
import { TrendIndicator, calculateTrendDirection } from './trend-indicator';
import { CHART_COLORS, CHART_STYLES } from '@/lib/chart-config';
import { cn } from '@/lib/utils';
import type { TrendPeriod, DailyMetric } from '@/types/sales';

// ===========================================
// Constants
// ===========================================

const CHART_HEIGHT = 250;
const MIN_DATA_POINTS = 7;

const PERIODS: { value: TrendPeriod; label: string }[] = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
];

const LINE_COLORS = {
  claimed: '#3b82f6', // Blue-500
  closed: '#22c55e', // Green-500
  teamAvgClosed: '#9ca3af', // Gray-400
} as const;

type MetricKey = 'claimed' | 'closed' | 'teamAvgClosed';

interface VisibleMetrics {
  claimed: boolean;
  closed: boolean;
  teamAvgClosed: boolean;
}

// ===========================================
// Types
// ===========================================

interface IndividualTrendChartProps {
  userId: string;
  userName: string;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  claimed: number;
  closed: number;
  teamAvgClosed: number;
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Format date for display on X-axis
 */
function formatDateLabel(dateString: string, period: TrendPeriod): string {
  try {
    const date = parseISO(dateString);
    // Shorter format for longer periods
    if (period === 90) {
      return format(date, 'MMM d');
    }
    return format(date, 'MM/dd');
  } catch {
    return dateString;
  }
}

/**
 * Transform API data to chart format with team average
 */
function transformToChartData(
  dailyData: DailyMetric[],
  teamAverage: DailyMetric[]
): ChartDataPoint[] {
  return dailyData.map((day) => {
    const teamAvgDay = teamAverage.find((t) => t.date === day.date);
    return {
      date: day.date,
      displayDate: day.date,
      claimed: day.claimed,
      closed: day.closed,
      teamAvgClosed: teamAvgDay?.closed ?? 0,
    };
  });
}

// ===========================================
// Custom Legend Component
// ===========================================

interface CustomLegendProps {
  visibleMetrics: VisibleMetrics;
  onToggle: (metric: MetricKey) => void;
}

function CustomLegend({ visibleMetrics, onToggle }: CustomLegendProps) {
  const items: { key: MetricKey; label: string; color: string }[] = [
    { key: 'claimed', label: 'Claimed', color: LINE_COLORS.claimed },
    { key: 'closed', label: 'Closed', color: LINE_COLORS.closed },
    { key: 'teamAvgClosed', label: 'Team Avg', color: LINE_COLORS.teamAvgClosed },
  ];

  return (
    <div className="flex items-center justify-start gap-4 mt-4" role="group" aria-label="Chart legend">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onToggle(item.key)}
          className={cn(
            'flex items-center gap-2 px-2 py-1 rounded text-sm transition-opacity',
            'hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !visibleMetrics[item.key] && 'opacity-40'
          )}
          aria-pressed={visibleMetrics[item.key]}
          aria-label={`${visibleMetrics[item.key] ? 'Hide' : 'Show'} ${item.label}`}
        >
          <span
            className={cn(
              'inline-block w-3 h-3 rounded-full',
              item.key === 'teamAvgClosed' && 'border-2 border-dashed'
            )}
            style={{
              backgroundColor: item.key === 'teamAvgClosed' ? 'transparent' : item.color,
              borderColor: item.key === 'teamAvgClosed' ? item.color : undefined,
            }}
          />
          <span className="text-muted-foreground font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ===========================================
// Period Selector Component
// ===========================================

interface PeriodSelectorProps {
  value: TrendPeriod;
  onChange: (period: TrendPeriod) => void;
}

function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Select time period">
      {PERIODS.map((period) => (
        <Button
          key={period.value}
          variant={value === period.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(period.value)}
          className="px-3"
          aria-pressed={value === period.value}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}

// ===========================================
// Main Component
// ===========================================

export function IndividualTrendChart({
  userId,
  userName,
}: IndividualTrendChartProps) {
  const [period, setPeriod] = useState<TrendPeriod>(30);
  const [visibleMetrics, setVisibleMetrics] = useState<VisibleMetrics>({
    claimed: true,
    closed: true,
    teamAvgClosed: true,
  });

  const { data, isLoading, isError } = useSalesTrend(userId, period);

  // AC#2: Guard logic - Prevent hiding last visible metric
  const handleToggleMetric = useCallback((metric: MetricKey) => {
    setVisibleMetrics((prev) => {
      const visibleCount = Object.values(prev).filter(Boolean).length;
      // Don't hide if it's the last visible metric
      if (visibleCount === 1 && prev[metric]) {
        return prev;
      }
      return { ...prev, [metric]: !prev[metric] };
    });
  }, []);

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!data?.dailyData || !data?.teamAverage) return [];
    return transformToChartData(data.dailyData, data.teamAverage);
  }, [data]);

  // AC#6: Calculate trend direction
  const trendDirection = useMemo(() => {
    if (!data?.dailyData) return 'stable';
    return calculateTrendDirection(data.dailyData);
  }, [data]);

  // AC#8: Loading state
  if (isLoading) {
    return <TrendChartSkeleton />;
  }

  // Error state
  if (isError) {
    return <TrendChartEmpty reason="error" />;
  }

  // AC#7: Empty/Insufficient data state
  if (!data || data.dailyData.length < MIN_DATA_POINTS) {
    return <TrendChartEmpty reason="insufficient" />;
  }

  return (
    <Card data-testid="individual-trend-chart">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            {userName}&apos;s Trend
          </CardTitle>
          {/* AC#6: Trend Indicator */}
          <TrendIndicator direction={trendDirection} />
        </div>
        {/* AC#3: Period Selector */}
        <PeriodSelector value={period} onChange={setPeriod} />
      </CardHeader>
      <CardContent>
        {/* AC#9: Responsive chart container */}
        <div
          style={{ height: CHART_HEIGHT }}
          role="img"
          aria-label={`Line chart showing ${userName}'s performance trend over ${period} days`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => formatDateLabel(date, period)}
                tick={{ fontSize: 11, fill: CHART_COLORS.text }}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: CHART_COLORS.text }}
                tickLine={false}
                axisLine={false}
                width={30}
                allowDecimals={false}
              />
              {/* AC#5: Tooltip with comparison */}
              <Tooltip
                content={<TrendChartTooltip teamAverage={data.teamAverage} />}
              />
              {/* Hidden native legend - using custom */}
              <Legend content={() => null} />

              {/* AC#2: Claimed line (blue) */}
              {visibleMetrics.claimed && (
                <Line
                  type="monotone"
                  dataKey="claimed"
                  name="Claimed"
                  stroke={LINE_COLORS.claimed}
                  strokeWidth={2}
                  dot={{ r: 3, fill: LINE_COLORS.claimed }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              )}

              {/* AC#2: Closed line (green) */}
              {visibleMetrics.closed && (
                <Line
                  type="monotone"
                  dataKey="closed"
                  name="Closed"
                  stroke={LINE_COLORS.closed}
                  strokeWidth={2}
                  dot={{ r: 3, fill: LINE_COLORS.closed }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              )}

              {/* AC#4: Team Average line (dashed gray) */}
              {visibleMetrics.teamAvgClosed && (
                <Line
                  type="monotone"
                  dataKey="teamAvgClosed"
                  name="Team Avg"
                  stroke={LINE_COLORS.teamAvgClosed}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AC#2: Custom legend with toggle */}
        <CustomLegend
          visibleMetrics={visibleMetrics}
          onToggle={handleToggleMetric}
        />
      </CardContent>
    </Card>
  );
}
