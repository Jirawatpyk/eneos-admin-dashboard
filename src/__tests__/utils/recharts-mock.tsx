/**
 * Recharts Mock Patterns for Testing
 *
 * Technical Debt TD-5: Consolidate test utilities
 *
 * IMPORTANT: Due to Vitest's vi.mock hoisting rules, these mocks cannot be
 * directly imported and used with vi.mock(). Instead, copy the pattern you
 * need and use vi.hoisted() in your test file.
 *
 * Example usage:
 * ```typescript
 * import { vi } from 'vitest';
 *
 * const mockRecharts = vi.hoisted(() => ({
 *   ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
 *   // ... copy other components as needed
 * }));
 *
 * vi.mock('recharts', () => mockRecharts);
 * ```
 *
 * Available patterns:
 * - AREA_CHART_MOCK: For AreaChart tests (lead-trend-chart)
 * - PIE_CHART_MOCK: For PieChart tests (status-distribution-chart)
 * - BAR_CHART_MOCK: For BarChart tests (future EPIC-03)
 */

// Note: React types referenced in string templates below

/**
 * Area Chart Mock Pattern
 * Use for: lead-trend-chart.test.tsx
 */
export const AREA_CHART_MOCK = `
const mockRechartsAreaChart = vi.hoisted(() => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="recharts-area-chart" data-count={data.length}>
      {children}
    </div>
  ),
  Area: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
    <div data-testid={\`area-\${dataKey}\`} data-stroke={stroke} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: ({ content }: { content: React.ReactNode }) => (
    <div data-testid="legend">{content}</div>
  ),
}));

vi.mock('recharts', () => mockRechartsAreaChart);
`;

/**
 * Pie Chart Mock Pattern
 * Use for: status-distribution-chart.test.tsx
 */
export const PIE_CHART_MOCK = `
const mockRechartsPieChart = vi.hoisted(() => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

vi.mock('recharts', () => mockRechartsPieChart);
`;

/**
 * Bar Chart Mock Pattern
 * Use for: EPIC-03 Sales Performance charts
 */
export const BAR_CHART_MOCK = `
const mockRechartsBarChart = vi.hoisted(() => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="recharts-bar-chart" data-count={data.length}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill }: { dataKey: string; fill: string }) => (
    <div data-testid={\`bar-\${dataKey}\`} data-fill={fill} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: ({ content }: { content: React.ReactNode }) => (
    <div data-testid="legend">{content}</div>
  ),
}));

vi.mock('recharts', () => mockRechartsBarChart);
`;

/**
 * Combined Mock Pattern (all chart types)
 * Use when testing multiple chart types in one file
 */
export const FULL_RECHARTS_MOCK = `
const mockRecharts = vi.hoisted(() => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  // Area Chart
  AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="recharts-area-chart" data-count={data.length}>{children}</div>
  ),
  Area: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
    <div data-testid={\`area-\${dataKey}\`} data-stroke={stroke} />
  ),
  // Pie Chart
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  // Bar Chart
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="recharts-bar-chart" data-count={data.length}>{children}</div>
  ),
  Bar: ({ dataKey, fill }: { dataKey: string; fill: string }) => (
    <div data-testid={\`bar-\${dataKey}\`} data-fill={fill} />
  ),
  // Shared
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: ({ content }: { content?: React.ReactNode }) => (
    <div data-testid="legend">{content}</div>
  ),
}));

vi.mock('recharts', () => mockRecharts);
`;

// Export for documentation purposes
const rechartsMocks = {
  AREA_CHART_MOCK,
  PIE_CHART_MOCK,
  BAR_CHART_MOCK,
  FULL_RECHARTS_MOCK,
};

export default rechartsMocks;
