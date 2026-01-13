/**
 * Lead Trend Chart Component
 * Story 2.2: Lead Trend Chart
 *
 * Enterprise-grade chart using Recharts directly
 * AC#1: Line chart showing lead trends for last 30 days
 * AC#2: Dual lines for "New Leads" (indigo) and "Closed" (emerald)
 * AC#3: Readable axis labels (X=dates, Y=count)
 * AC#4: Hover tooltip with date and values
 * AC#5: Legend with proper spacing
 * AC#8: Responsive sizing
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { LeadTrendChartSkeleton } from './lead-trend-chart-skeleton';
import { LeadTrendChartEmpty } from './lead-trend-chart-empty';
import type { DailyTrend } from '@/types/dashboard';
import {
  CHART_COLORS,
  CHART_STYLES,
  LEAD_TREND_COLORS,
  createGradientId,
  getGradientUrl,
} from '@/lib/chart-config';

// ===========================================
// Types
// ===========================================

interface ChartData {
  date: string;
  displayDate: string;
  newLeads: number;
  closed: number;
}

interface LeadTrendChartProps {
  data?: DailyTrend[];
  isLoading?: boolean;
}

// ===========================================
// Custom Legend Component
// ===========================================

interface LegendPayload {
  value: string;
  color: string;
}

function CustomLegend({ payload }: { payload?: LegendPayload[] }) {
  if (!payload) return null;

  const labelMap: Record<string, string> = {
    newLeads: 'New Leads',
    closed: 'Closed',
  };

  return (
    <div className="flex items-center justify-start gap-6 mb-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground font-medium">
            {labelMap[entry.value] || entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ===========================================
// Custom Tooltip Component
// ===========================================

interface TooltipPayloadEntry {
  value: number;
  dataKey: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const labelMap: Record<string, string> = {
    newLeads: 'New Leads',
    closed: 'Closed',
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[140px]">
      <p className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-2">
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {labelMap[entry.dataKey as string] || entry.dataKey}
            </span>
          </div>
          <span className="text-sm font-semibold text-foreground">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ===========================================
// Helper Functions
// ===========================================

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
 * Transform API data to chart format
 */
function transformData(apiData: DailyTrend[]): ChartData[] {
  return apiData.map((item) => ({
    date: item.date,
    displayDate: formatDateLabel(item.date),
    newLeads: item.newLeads,
    closed: item.closed,
  }));
}

// ===========================================
// Main Component
// ===========================================

/**
 * Lead Trend Chart - displays lead trends over the last 30 days
 * Enterprise-grade implementation using Recharts
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

  const chartData = transformData(data);

  return (
    <Card data-testid="lead-trend-chart">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
          Lead Trend (30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label="Lead trend chart showing new leads and closed leads over the last 30 days"
        >
          <ResponsiveContainer width="100%" height={CHART_STYLES.height}>
            <AreaChart
            data={chartData}
            margin={CHART_STYLES.margin}
          >
            {/* Gradient Definitions */}
            <defs>
              <linearGradient id={createGradientId('newLeads')} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={LEAD_TREND_COLORS.newLeads} stopOpacity={CHART_STYLES.area.gradientOpacity.start} />
                <stop offset="95%" stopColor={LEAD_TREND_COLORS.newLeads} stopOpacity={CHART_STYLES.area.gradientOpacity.end} />
              </linearGradient>
              <linearGradient id={createGradientId('closed')} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={LEAD_TREND_COLORS.closed} stopOpacity={CHART_STYLES.area.gradientOpacity.start} />
                <stop offset="95%" stopColor={LEAD_TREND_COLORS.closed} stopOpacity={CHART_STYLES.area.gradientOpacity.end} />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid
              strokeDasharray={CHART_STYLES.grid.strokeDasharray}
              stroke={CHART_COLORS.grid}
              vertical={CHART_STYLES.grid.vertical}
            />

            {/* X Axis */}
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: CHART_STYLES.axis.fontSize, fill: CHART_COLORS.text }}
              tickLine={CHART_STYLES.axis.tickLine}
              axisLine={{ stroke: CHART_COLORS.grid }}
              dy={10}
            />

            {/* Y Axis */}
            <YAxis
              tick={{ fontSize: CHART_STYLES.axis.fontSize, fill: CHART_COLORS.text }}
              tickLine={CHART_STYLES.axis.tickLine}
              axisLine={false}
              width={40}
              allowDecimals={false}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Legend */}
            <Legend content={<CustomLegend />} verticalAlign="top" />

            {/* Areas */}
            <Area
              type="monotone"
              dataKey="newLeads"
              name="newLeads"
              stroke={LEAD_TREND_COLORS.newLeads}
              strokeWidth={CHART_STYLES.area.strokeWidth}
              fill={getGradientUrl('newLeads')}
              dot={CHART_STYLES.area.dot}
              activeDot={{ ...CHART_STYLES.area.activeDot, stroke: CHART_COLORS.background }}
            />
            <Area
              type="monotone"
              dataKey="closed"
              name="closed"
              stroke={LEAD_TREND_COLORS.closed}
              strokeWidth={CHART_STYLES.area.strokeWidth}
              fill={getGradientUrl('closed')}
              dot={CHART_STYLES.area.dot}
              activeDot={{ ...CHART_STYLES.area.activeDot, stroke: CHART_COLORS.background }}
            />
          </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
