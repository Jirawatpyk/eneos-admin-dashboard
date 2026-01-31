/**
 * Trend Chart Tooltip Tests
 * Story 3.5: Individual Performance Trend
 * AC#5: Data Points and Tooltip
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendChartTooltip } from '@/components/sales/trend-chart-tooltip';

const mockPayload = [
  { value: 5, dataKey: 'claimed', color: '#3B82F6', name: 'Claimed' },
  { value: 3, dataKey: 'closed', color: '#10B981', name: 'Closed' },
];

const mockTeamAverage = [
  { date: '2026-01-15', claimed: 4, contacted: 2, closed: 2, conversionRate: 50 },
  { date: '2026-01-16', claimed: 3, contacted: 1, closed: 1, conversionRate: 33 },
];

describe('TrendChartTooltip', () => {
  describe('[P1] Inactive states', () => {
    it('should render nothing when active is false', () => {
      const { container } = render(
        <TrendChartTooltip active={false} payload={mockPayload} label="2026-01-15" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when payload is empty', () => {
      const { container } = render(
        <TrendChartTooltip active={true} payload={[]} label="2026-01-15" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when payload is undefined', () => {
      const { container } = render(
        <TrendChartTooltip active={true} label="2026-01-15" />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('[P1] Active state', () => {
    it('should render tooltip container', () => {
      render(
        <TrendChartTooltip
          active={true}
          payload={mockPayload}
          label="2026-01-15"
        />
      );
      expect(screen.getByTestId('trend-chart-tooltip')).toBeInTheDocument();
    });

    it('should display date label', () => {
      render(
        <TrendChartTooltip
          active={true}
          payload={mockPayload}
          label="2026-01-15"
        />
      );
      expect(screen.getByText('2026-01-15')).toBeInTheDocument();
    });

    it('should display metric labels', () => {
      render(
        <TrendChartTooltip
          active={true}
          payload={mockPayload}
          label="2026-01-15"
        />
      );
      expect(screen.getByText('Claimed')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
    });

    it('should display metric values', () => {
      render(
        <TrendChartTooltip
          active={true}
          payload={mockPayload}
          label="2026-01-15"
        />
      );
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('[P1] Team average comparison', () => {
    it('should show "above avg" when value > team average', () => {
      const singlePayload = [
        { value: 5, dataKey: 'claimed', color: '#3B82F6', name: 'Claimed' },
      ];
      render(
        <TrendChartTooltip
          active={true}
          payload={singlePayload}
          label="2026-01-15"
          teamAverage={mockTeamAverage}
        />
      );
      // claimed=5, teamAvg claimed=4 → +1 above avg
      expect(screen.getByText('+1 above avg')).toBeInTheDocument();
    });

    it('should show "below avg" when value < team average', () => {
      const lowPayload = [
        { value: 1, dataKey: 'closed', color: '#10B981', name: 'Closed' },
      ];
      render(
        <TrendChartTooltip
          active={true}
          payload={lowPayload}
          label="2026-01-15"
          teamAverage={mockTeamAverage}
        />
      );
      // closed=1, teamAvg closed=2 → -1 below avg
      expect(screen.getByText('-1 below avg')).toBeInTheDocument();
    });

    it('should show "= avg" when value equals team average', () => {
      const equalPayload = [
        { value: 4, dataKey: 'claimed', color: '#3B82F6', name: 'Claimed' },
      ];
      render(
        <TrendChartTooltip
          active={true}
          payload={equalPayload}
          label="2026-01-15"
          teamAverage={mockTeamAverage}
        />
      );
      expect(screen.getByText('= avg')).toBeInTheDocument();
    });

    it('should not show comparison for teamAvgClosed dataKey', () => {
      const teamAvgPayload = [
        { value: 2, dataKey: 'teamAvgClosed', color: '#999', name: 'Team Avg' },
      ];
      render(
        <TrendChartTooltip
          active={true}
          payload={teamAvgPayload}
          label="2026-01-15"
          teamAverage={mockTeamAverage}
        />
      );
      expect(screen.queryByText(/above avg/)).not.toBeInTheDocument();
      expect(screen.queryByText(/below avg/)).not.toBeInTheDocument();
      expect(screen.queryByText('= avg')).not.toBeInTheDocument();
    });

    it('should use METRIC_LABELS for teamAvgClosed', () => {
      const teamAvgPayload = [
        { value: 2, dataKey: 'teamAvgClosed', color: '#999', name: 'Team Avg' },
      ];
      render(
        <TrendChartTooltip
          active={true}
          payload={teamAvgPayload}
          label="2026-01-15"
        />
      );
      expect(screen.getByText('Team Avg')).toBeInTheDocument();
    });

    it('should not show comparison when teamAverage is empty', () => {
      render(
        <TrendChartTooltip
          active={true}
          payload={mockPayload}
          label="2026-01-15"
          teamAverage={[]}
        />
      );
      expect(screen.queryByText(/above avg/)).not.toBeInTheDocument();
      expect(screen.queryByText(/below avg/)).not.toBeInTheDocument();
    });
  });
});
