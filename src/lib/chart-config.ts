/**
 * Chart Configuration
 * Centralized chart styling for enterprise consistency
 *
 * Usage:
 * import { CHART_COLORS, CHART_STYLES } from '@/lib/chart-config';
 */

// ===========================================
// Chart Colors (Enterprise Palette)
// ===========================================

export const CHART_COLORS = {
  // Primary data series
  primary: '#6366F1',    // Indigo-500 - New Leads
  secondary: '#10B981',  // Emerald-500 - Closed/Success
  tertiary: '#F59E0B',   // Amber-500 - Warning/Pending
  quaternary: '#EF4444', // Red-500 - Error/Lost

  // Semantic colors
  success: '#10B981',    // Emerald-500
  warning: '#F59E0B',    // Amber-500
  error: '#EF4444',      // Red-500
  info: '#3B82F6',       // Blue-500

  // Neutral colors
  grid: '#E5E7EB',       // Gray-200
  text: '#6B7280',       // Gray-500
  textMuted: '#9CA3AF',  // Gray-400
  background: '#FFFFFF',

  // Extended palette for multi-series charts
  palette: [
    '#6366F1', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ],
} as const;

// ===========================================
// Chart Styles
// ===========================================

export const CHART_STYLES = {
  // Dimensions
  height: 300,
  margin: { top: 10, right: 10, left: 0, bottom: 0 },

  // Axis styling
  axis: {
    fontSize: 12,
    tickLine: false,
  },

  // Grid styling
  grid: {
    strokeDasharray: '4 4',
    vertical: false,
  },

  // Area chart
  area: {
    strokeWidth: 2,
    gradientOpacity: { start: 0.3, end: 0.05 },
    dot: false,
    activeDot: { r: 6, strokeWidth: 2 },
  },

  // Line chart
  line: {
    strokeWidth: 2,
    dot: false,
    activeDot: { r: 6, strokeWidth: 2 },
  },

  // Bar chart
  bar: {
    radius: [4, 4, 0, 0],
    barSize: 20,
  },
} as const;

// ===========================================
// Gradient Helpers
// ===========================================

export function createGradientId(name: string): string {
  return `gradient-${name}`;
}

export function getGradientUrl(name: string): string {
  return `url(#${createGradientId(name)})`;
}

// ===========================================
// Color Helpers
// ===========================================

export function getChartColor(index: number): string {
  return CHART_COLORS.palette[index % CHART_COLORS.palette.length];
}

// ===========================================
// Lead Trend Chart Specific
// ===========================================

export const LEAD_TREND_COLORS = {
  newLeads: CHART_COLORS.primary,
  closed: CHART_COLORS.secondary,
} as const;

// ===========================================
// Status Distribution Chart Specific (Story 2.3)
// ===========================================

export const STATUS_COLORS = {
  new: '#6B7280',        // Gray-500
  claimed: '#3B82F6',    // Blue-500
  contacted: '#EAB308',  // Yellow-500
  closed: '#10B981',     // Emerald-500
  lost: '#EF4444',       // Red-500
  unreachable: '#F97316', // Orange-500
} as const;

export const STATUS_LABELS: Record<keyof typeof STATUS_COLORS, string> = {
  new: 'New',
  claimed: 'Claimed',
  contacted: 'Contacted',
  closed: 'Closed',
  lost: 'Lost',
  unreachable: 'Unreachable',
} as const;
