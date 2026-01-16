/**
 * Performance Bar Chart Component
 * Story 3.3: Sales Performance Bar Chart
 *
 * AC#1: Chart Display - Horizontal bar chart with title
 * AC#2: Bar Chart Data - Grouped bars for Claimed, Contacted, Closed
 * AC#3: Metric Toggle - Legend click toggles bars
 * AC#4: Hover Tooltip - Shows name, metric, value, conversion rate
 * AC#5: Bar Click - Highlights corresponding table row
 * AC#6: Sorting Options - Dropdown to sort by different metrics
 * AC#9: Responsive Design - Full width, scales with container
 * AC#10: Accessibility - aria-label on chart container
 */
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { SALES_BAR_COLORS } from '@/lib/chart-config';
import { PerformanceBarChartSkeleton } from './performance-bar-chart-skeleton';
import { PerformanceBarChartEmpty } from './performance-bar-chart-empty';
import { PerformanceBarChartTooltip } from './performance-bar-chart-tooltip';
import { AccessibleLegend } from './accessible-legend';
import type { SalesPersonMetrics } from '@/types/sales';

// ===========================================
// Types
// ===========================================

type SortOption = 'closed' | 'claimed' | 'contacted' | 'conversionRate';

interface PerformanceBarChartProps {
  data: SalesPersonMetrics[];
  isLoading?: boolean;
  onBarClick?: (userId: string) => void;
}

interface ChartDataPoint {
  name: string;
  fullName: string;
  userId: string;
  claimed: number;
  contacted: number;
  closed: number;
  conversionRate: number;
}

interface VisibleMetrics {
  claimed: boolean;
  contacted: boolean;
  closed: boolean;
}

// ===========================================
// Constants
// ===========================================

const SORT_OPTIONS = [
  { value: 'closed', label: 'Sort by Closed' },
  { value: 'claimed', label: 'Sort by Claimed' },
  { value: 'contacted', label: 'Sort by Contacted' },
  { value: 'conversionRate', label: 'Sort by Conv. Rate' },
] as const;

const MAX_DISPLAY_COUNT = 10;
const MAX_NAME_LENGTH = 15;
const TRUNCATE_LENGTH = 12;

// ===========================================
// Helper Functions
// ===========================================

function truncateName(name: string): string {
  if (name.length <= MAX_NAME_LENGTH) return name;
  return `${name.slice(0, TRUNCATE_LENGTH)}...`;
}

function sortData(data: SalesPersonMetrics[], sortBy: SortOption): SalesPersonMetrics[] {
  return [...data].sort((a, b) => {
    if (sortBy === 'conversionRate') {
      return b.conversionRate - a.conversionRate;
    }
    return b[sortBy] - a[sortBy];
  });
}

function transformToChartData(data: SalesPersonMetrics[]): ChartDataPoint[] {
  return data.slice(0, MAX_DISPLAY_COUNT).map((person) => ({
    name: truncateName(person.name),
    fullName: person.name,
    userId: person.userId,
    claimed: person.claimed,
    contacted: person.contacted,
    closed: person.closed,
    conversionRate: person.conversionRate,
  }));
}

// ===========================================
// Main Component
// ===========================================

export function PerformanceBarChart({
  data,
  isLoading,
  onBarClick,
}: PerformanceBarChartProps) {
  const [sortBy, setSortBy] = useState<SortOption>('closed');
  const [visibleMetrics, setVisibleMetrics] = useState<VisibleMetrics>({
    claimed: true,
    contacted: true,
    closed: true,
  });

  // AC#2: Transform and sort data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sorted = sortData(data, sortBy);
    return transformToChartData(sorted);
  }, [data, sortBy]);

  // AC#3: Legend toggle handler - prevent hiding all metrics
  const handleLegendClick = useCallback((metric: keyof VisibleMetrics) => {
    setVisibleMetrics((prev) => {
      const visibleCount = Object.values(prev).filter(Boolean).length;
      // Prevent hiding the last visible metric
      if (visibleCount === 1 && prev[metric]) {
        return prev;
      }
      return { ...prev, [metric]: !prev[metric] };
    });
  }, []);

  // AC#5: Bar click handler
  const handleChartClick = useCallback(
    (data: { activePayload?: { payload: ChartDataPoint }[] } | null) => {
      if (data?.activePayload?.[0]?.payload && onBarClick) {
        onBarClick(data.activePayload[0].payload.userId);
      }
    },
    [onBarClick]
  );

  // AC#7: Loading state
  if (isLoading) {
    return <PerformanceBarChartSkeleton />;
  }

  // AC#8: Empty state
  if (!data || data.length === 0) {
    return <PerformanceBarChartEmpty />;
  }

  // Calculate chart height based on number of items
  const chartHeight = Math.max(300, Math.min(chartData.length * 50, 500));

  return (
    <Card data-testid="performance-bar-chart">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
          Performance Comparison
        </CardTitle>
        {/* AC#6: Sorting dropdown */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* AC#10: Accessibility - aria-label on chart container */}
        <div
          style={{ height: chartHeight }}
          role="img"
          aria-label="Bar chart comparing sales team performance metrics"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              onClick={handleChartClick}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<PerformanceBarChartTooltip />} />
              {/* AC#10: Using custom accessible legend outside chart for keyboard nav */}
              {/* AC#2: Grouped bars with colors */}
              {/* AC#5: Bars have hover opacity and cursor pointer */}
              {visibleMetrics.claimed && (
                <Bar
                  dataKey="claimed"
                  fill={SALES_BAR_COLORS.claimed}
                  name="Claimed"
                  radius={[0, 4, 4, 0]}
                  className="transition-opacity hover:opacity-80 active:opacity-70"
                />
              )}
              {visibleMetrics.contacted && (
                <Bar
                  dataKey="contacted"
                  fill={SALES_BAR_COLORS.contacted}
                  name="Contacted"
                  radius={[0, 4, 4, 0]}
                  className="transition-opacity hover:opacity-80 active:opacity-70"
                />
              )}
              {visibleMetrics.closed && (
                <Bar
                  dataKey="closed"
                  fill={SALES_BAR_COLORS.closed}
                  name="Closed"
                  radius={[0, 4, 4, 0]}
                  className="transition-opacity hover:opacity-80 active:opacity-70"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* AC#10: Accessible legend with keyboard navigation */}
        <AccessibleLegend
          visibleMetrics={visibleMetrics}
          onToggle={handleLegendClick}
        />
      </CardContent>
    </Card>
  );
}
