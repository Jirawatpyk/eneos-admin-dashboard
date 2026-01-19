/**
 * Status Distribution Chart Component
 * Story 2.3: Status Distribution Chart
 *
 * AC#1: Donut chart showing status distribution
 * AC#2: 6 status segments with distinct colors
 * AC#3: Percentage labels + center total
 * AC#4: Hover tooltip with name, count, percentage + segment highlight
 * AC#5: Legend with status name, color, count
 * AC#6: Color coding per status
 * AC#7: Loading & Empty states
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { StatusDistributionSkeleton } from './status-distribution-skeleton';
import { StatusDistributionEmpty } from './status-distribution-empty';
import { STATUS_COLORS, STATUS_LABELS, CHART_STYLES } from '@/lib/chart-config';
import { useChartTheme } from '@/hooks/use-chart-theme';
import type { DashboardSummary } from '@/types/dashboard';

// ===========================================
// Types
// ===========================================

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  key: keyof typeof STATUS_COLORS;
  [index: string]: string | number;
}

interface StatusDistributionChartProps {
  data: DashboardSummary;
  isLoading?: boolean;
}

// ===========================================
// Custom Legend Component (AC#5)
// ===========================================

interface LegendPayload {
  value: string;
  color: string;
  payload: ChartDataItem;
}

function CustomLegend({ payload }: { payload?: LegendPayload[] }) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
      {payload.map((entry) => (
        <div key={entry.payload.key} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">
            {entry.value}
          </span>
          <span className="text-sm font-semibold text-foreground">
            ({entry.payload.value})
          </span>
        </div>
      ))}
    </div>
  );
}

// ===========================================
// Custom Tooltip Component (AC#4)
// ===========================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataItem }>;
  total: number;
}

function CustomTooltip({ active, payload, total }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[140px]">
      <div className="flex items-center gap-2 mb-2 border-b border-border pb-2">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm font-semibold text-foreground">
          {data.name}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-sm text-muted-foreground">Count:</span>
          <span className="text-sm font-semibold text-foreground">{data.value}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-sm text-muted-foreground">Percentage:</span>
          <span className="text-sm font-semibold text-foreground">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Transform API data to chart format
 * Filters out statuses with 0 value
 */
function transformData(data: DashboardSummary): ChartDataItem[] {
  const statusMapping: Array<{ key: keyof typeof STATUS_COLORS; getValue: () => number }> = [
    { key: 'new', getValue: () => data.totalLeads - (data.claimed + data.contacted + data.closed + data.lost + data.unreachable) },
    { key: 'claimed', getValue: () => data.claimed },
    { key: 'contacted', getValue: () => data.contacted },
    { key: 'closed', getValue: () => data.closed },
    { key: 'lost', getValue: () => data.lost },
    { key: 'unreachable', getValue: () => data.unreachable },
  ];

  return statusMapping
    .map(({ key, getValue }) => {
      const value = Math.max(0, getValue()); // Ensure non-negative
      return {
        name: STATUS_LABELS[key],
        value,
        color: STATUS_COLORS[key],
        key,
      };
    })
    .filter((item) => item.value > 0);
}

/**
 * Custom label renderer for percentage (AC#3)
 * Returns a function that can be passed to Pie label prop
 */
function createCustomLabelRenderer(backgroundColor: string) {
  return function renderCustomLabel({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }) {
    // Handle undefined values
    if (
      cx === undefined ||
      cy === undefined ||
      midAngle === undefined ||
      innerRadius === undefined ||
      outerRadius === undefined ||
      percent === undefined ||
      percent < 0.05 // Don't show label for < 5%
    ) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={backgroundColor}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
        style={{ pointerEvents: 'none' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
}

// ===========================================
// Main Component
// ===========================================

export function StatusDistributionChart({ data, isLoading }: StatusDistributionChartProps) {
  // Theme-aware chart colors (Story 7.2: AC#7)
  const { colors: themeColors } = useChartTheme();

  // AC#7: Loading state
  if (isLoading) {
    return <StatusDistributionSkeleton />;
  }

  const chartData = transformData(data);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // AC#7: Empty state
  if (total === 0) {
    return <StatusDistributionEmpty />;
  }

  // Create label renderer with theme-aware colors
  const renderCustomLabel = createCustomLabelRenderer(themeColors.cardBackground);

  return (
    <Card data-testid="status-distribution-chart">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChartIcon className="h-5 w-5" aria-hidden="true" />
          Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart container */}
        <div
          role="img"
          aria-label="Pie chart showing lead status distribution by category"
        >
          <ResponsiveContainer width="100%" height={CHART_STYLES.height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={renderCustomLabel}
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.key}`}
                    fill={entry.color}
                    stroke={themeColors.cardBackground}
                    strokeWidth={2}
                    className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Total summary below chart */}
        <div className="text-center mt-2 pt-2 border-t">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-sm text-muted-foreground ml-2">Total Leads</span>
        </div>
      </CardContent>
    </Card>
  );
}
