/**
 * Performance Bar Chart Tooltip Tests
 * Story 3.3 AC#4: Hover Tooltip
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PerformanceBarChartTooltip } from '@/components/sales/performance-bar-chart-tooltip';

const mockPayload = [
  {
    payload: {
      name: 'A. Smith',
      fullName: 'Alice Smith',
      userId: 'user-1',
      claimed: 15,
      contacted: 10,
      closed: 5,
      conversionRate: 33.3333,
    },
    name: 'Claimed',
    value: 15,
    color: '#3b82f6',
  },
  {
    payload: {
      name: 'A. Smith',
      fullName: 'Alice Smith',
      userId: 'user-1',
      claimed: 15,
      contacted: 10,
      closed: 5,
      conversionRate: 33.3333,
    },
    name: 'Contacted',
    value: 10,
    color: '#10b981',
  },
];

describe('PerformanceBarChartTooltip', () => {
  describe('[P1] Inactive state', () => {
    it('should return null when not active', () => {
      const { container } = render(
        <PerformanceBarChartTooltip active={false} payload={mockPayload} />
      );
      expect(container.innerHTML).toBe('');
    });

    it('should return null when payload is empty', () => {
      const { container } = render(
        <PerformanceBarChartTooltip active={true} payload={[]} />
      );
      expect(container.innerHTML).toBe('');
    });

    it('should return null when payload is undefined', () => {
      const { container } = render(
        <PerformanceBarChartTooltip active={true} />
      );
      expect(container.innerHTML).toBe('');
    });
  });

  describe('[P1] Active state with data', () => {
    it('should display full name', () => {
      render(
        <PerformanceBarChartTooltip active={true} payload={mockPayload} />
      );
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('should display metric entries', () => {
      render(
        <PerformanceBarChartTooltip active={true} payload={mockPayload} />
      );
      expect(screen.getByText('Claimed:')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('Contacted:')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should display conversion rate with 1 decimal', () => {
      render(
        <PerformanceBarChartTooltip active={true} payload={mockPayload} />
      );
      expect(screen.getByText('Conversion:')).toBeInTheDocument();
      expect(screen.getByText('33.3%')).toBeInTheDocument();
    });
  });
});
