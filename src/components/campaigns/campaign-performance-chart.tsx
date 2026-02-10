/**
 * Campaign Performance Chart Component
 * Story 5.6: Campaign Performance Chart
 *
 * AC#1: Horizontal bar chart comparing campaigns (Open Rate vs Click Rate)
 * AC#2: Data from GET /api/admin/campaigns/stats, up to 10 campaigns
 * AC#3: Interactive tooltips with campaign name, metric, percentage, delivered count
 * AC#4: Campaign count selector (5, 10, 20)
 * AC#5: Loading skeleton
 * AC#6: Empty state
 * AC#7: Error state with retry
 * AC#8: Responsive layout
 * AC#9: Benchmark reference lines (Open Rate only: 15%, 25%)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCampaignChart } from '@/hooks/use-campaign-chart';
import { useCampaignDateFilter } from '@/hooks/use-campaign-date-filter';
import { CampaignChartSkeleton } from './campaign-chart-skeleton';
import { CampaignsError } from './campaigns-error';
import { RATE_BENCHMARKS } from '@/lib/campaign-benchmarks';
import { CHART_COLORS } from '@/lib/chart-config';
import { formatNumber } from '@/lib/utils';
import type { ChartDataItem } from '@/types/campaigns';

// ===========================================
// Chart Colors (AC#1)
// ===========================================

const CHART_BAR_COLORS = {
  openRate: CHART_COLORS.info, // Blue - Open Rate
  clickRate: CHART_COLORS.secondary, // Green - Click Rate
  benchmarkGood: CHART_COLORS.warning, // Yellow - Good threshold
  benchmarkExcellent: CHART_COLORS.success, // Green - Excellent threshold
} as const;

// ===========================================
// Custom Tooltip Component (AC#3)
// ===========================================

interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  payload: ChartDataItem;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

const METRIC_LABELS: Record<string, string> = {
  openRate: 'Open Rate',
  clickRate: 'Click Rate',
};

/** @internal Exported for direct unit testing only */
export function ChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div
      className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[180px]"
      data-testid="chart-tooltip"
    >
      <p className="font-semibold text-sm mb-2 text-foreground">
        {data.campaignName}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex justify-between gap-4 text-sm py-0.5"
        >
          <span style={{ color: entry.color }}>
            {METRIC_LABELS[entry.dataKey] || entry.dataKey}:
          </span>
          <span className="font-medium text-foreground">
            {entry.value.toFixed(1)}%
          </span>
        </div>
      ))}
      <p className="text-xs text-muted-foreground mt-2 pt-1 border-t border-border">
        Delivered: {formatNumber(data.delivered)}
      </p>
    </div>
  );
}

// ===========================================
// Responsive Limit Hook (AC#8)
// ===========================================

/** Breakpoints and responsive config for chart (AC#8) */
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

/** Responsive config per viewport tier (AC#8) */
interface ResponsiveConfig {
  defaultLimit: number;
  fontSize: number;
  truncateLength: number;
}

function getResponsiveConfig(): ResponsiveConfig {
  if (typeof window === 'undefined') {
    return { defaultLimit: 10, fontSize: 12, truncateLength: 25 };
  }
  const width = window.innerWidth;
  if (width < MOBILE_BREAKPOINT) {
    return { defaultLimit: 5, fontSize: 10, truncateLength: 20 };
  }
  if (width < TABLET_BREAKPOINT) {
    return { defaultLimit: 10, fontSize: 11, truncateLength: 25 };
  }
  return { defaultLimit: 10, fontSize: 12, truncateLength: 25 };
}

/**
 * Hook for responsive chart config with resize support.
 * - SSR-safe: defaults to desktop config during SSR
 * - On mount: checks viewport immediately via function initializer (no double-render)
 * - On resize: updates config reactively
 * Returns { defaultLimit, fontSize, truncateLength }
 */
function useResponsiveChart() {
  const [config, setConfig] = useState<ResponsiveConfig>(getResponsiveConfig);

  const handleResize = useCallback(() => {
    setConfig(getResponsiveConfig());
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return config;
}

// ===========================================
// Empty State Component (AC#6)
// ===========================================

function ChartEmptyState() {
  return (
    <Card data-testid="campaign-chart-empty">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No campaign data yet</p>
          <p className="text-sm mt-1">
            Performance chart will appear once campaigns have data
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ===========================================
// Main Chart Component
// ===========================================

/**
 * Props for CampaignPerformanceChart
 * Story 5.8: Accept date filter params for consistency with KPI cards and table
 */
interface CampaignPerformanceChartProps {
  dateFrom?: string;
  dateTo?: string;
}

export function CampaignPerformanceChart(props: CampaignPerformanceChartProps) {
  const filter = useCampaignDateFilter();
  const dateFrom = props.dateFrom ?? filter.dateFrom;
  const dateTo = props.dateTo ?? filter.dateTo;

  const { defaultLimit, fontSize, truncateLength } = useResponsiveChart();
  const [limit, setLimit] = useState(defaultLimit);
  const { data, isLoading, isError, error, refetch } = useCampaignChart({
    limit,
    truncateLength,
    dateFrom,  // Story 5.8: Pass date filter
    dateTo,    // Story 5.8: Pass date filter
  });

  // Sync limit when responsive default changes (resize/orientation)
  useEffect(() => {
    setLimit(defaultLimit);
  }, [defaultLimit]);

  // AC#5: Loading state
  if (isLoading) {
    return <CampaignChartSkeleton />;
  }

  // AC#7: Error state
  if (isError) {
    return <CampaignsError message={error?.message} onRetry={refetch} />;
  }

  // AC#6: Empty state
  if (!data || data.length === 0) {
    return <ChartEmptyState />;
  }

  // Dynamic height based on campaign count (AC#8: min 250px on mobile, 300px general)
  const chartHeight = Math.max(300, data.length * 50);

  return (
    <Card data-testid="campaign-performance-chart">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaign Performance</CardTitle>
        {/* AC#4: Campaign count selector */}
        <Select
          value={String(limit)}
          onValueChange={(value) => setLimit(Number(value))}
        >
          <SelectTrigger
            className="w-[120px]"
            data-testid="chart-limit-selector"
          >
            <SelectValue placeholder="Campaigns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Top 5</SelectItem>
            <SelectItem value="10">Top 10</SelectItem>
            <SelectItem value="20">Top 20</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label="Campaign performance bar chart comparing Open Rate and Click Rate across campaigns"
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value: number) => `${value}%`}
                ticks={[0, 25, 50, 75, 100]}
              />
              <YAxis
                type="category"
                dataKey="campaignName"
                width={150}
                tick={{ fontSize }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />

              {/* AC#9: Benchmark Reference Lines (Open Rate only) */}
              <ReferenceLine
                x={RATE_BENCHMARKS.openRate.good}
                stroke={CHART_BAR_COLORS.benchmarkGood}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                label={{
                  value: `${RATE_BENCHMARKS.openRate.good}% Good`,
                  position: 'top',
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                x={RATE_BENCHMARKS.openRate.excellent}
                stroke={CHART_BAR_COLORS.benchmarkExcellent}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                label={{
                  value: `${RATE_BENCHMARKS.openRate.excellent}% Excellent`,
                  position: 'top',
                  fontSize: 10,
                }}
              />

              {/* AC#1: Two bars per campaign */}
              <Bar
                dataKey="openRate"
                name="Open Rate"
                fill={CHART_BAR_COLORS.openRate}
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="clickRate"
                name="Click Rate"
                fill={CHART_BAR_COLORS.clickRate}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
