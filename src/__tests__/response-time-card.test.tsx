/**
 * Response Time Card Component Tests
 * Story 3.4: Response Time Analytics
 *
 * AC#1: Response Time Summary Card
 * AC#2: Fastest Responder Highlight
 * AC#3: Response Time Gauge/Indicator
 * AC#5: Response Time Ranking (Top 3)
 * AC#6: Slow Responder Alert
 * AC#8: Loading & Empty States
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponseTimeCard } from '@/components/sales/response-time-card';
import type { SalesPersonMetrics } from '@/types/sales';

// Mock data factories
const createMockSalesPerson = (
  overrides: Partial<SalesPersonMetrics> = {}
): SalesPersonMetrics => ({
  userId: `user-${Math.random().toString(36).slice(2)}`,
  name: 'Test User',
  email: 'test@example.com',
  claimed: 10,
  contacted: 8,
  closed: 5,
  lost: 2,
  unreachable: 1,
  conversionRate: 50,
  avgResponseTime: 30,
  ...overrides,
});

describe('ResponseTimeCard', () => {
  // AC#1: Team average display and target comparison
  describe('Team Average Display', () => {
    it('displays team average response time', () => {
      render(
        <ResponseTimeCard
          teamAverage={45}
          teamPerformance={[]}
        />
      );

      expect(screen.getByTestId('team-average-time')).toHaveTextContent('45 min');
    });

    it('displays target comparison text', () => {
      render(
        <ResponseTimeCard
          teamAverage={45}
          teamPerformance={[]}
        />
      );

      expect(screen.getByText(/Target: < 30 min/)).toBeInTheDocument();
    });

    it('handles null team average by showing N/A', () => {
      render(
        <ResponseTimeCard
          teamAverage={null}
          teamPerformance={[]}
        />
      );

      expect(screen.getByTestId('team-average-time')).toHaveTextContent('N/A');
    });

    it('formats hours correctly for times >= 60 min', () => {
      render(
        <ResponseTimeCard
          teamAverage={90}
          teamPerformance={[]}
        />
      );

      expect(screen.getByTestId('team-average-time')).toHaveTextContent('1.5 hrs');
    });

    it('formats days correctly for times >= 1440 min', () => {
      render(
        <ResponseTimeCard
          teamAverage={2880}
          teamPerformance={[]}
        />
      );

      expect(screen.getByTestId('team-average-time')).toHaveTextContent('2.0 days');
    });
  });

  // AC#2: Fastest Responder Highlight
  describe('Fastest Responder', () => {
    it('displays fastest responder name and time', () => {
      const team = [
        createMockSalesPerson({ name: 'Alice', avgResponseTime: 25 }),
        createMockSalesPerson({ name: 'Bob', avgResponseTime: 45 }),
        createMockSalesPerson({ name: 'Charlie', avgResponseTime: 60 }),
      ];

      render(
        <ResponseTimeCard
          teamAverage={43}
          teamPerformance={team}
        />
      );

      // First in ranking (🥇) should be Alice
      const firstRank = screen.getByTestId('ranking-item-1');
      expect(firstRank).toHaveTextContent('Alice');
      expect(firstRank).toHaveTextContent('25 min');
    });

    it('handles ties by sorting alphabetically', () => {
      const team = [
        createMockSalesPerson({ name: 'Charlie', avgResponseTime: 25 }),
        createMockSalesPerson({ name: 'Alice', avgResponseTime: 25 }),
        createMockSalesPerson({ name: 'Bob', avgResponseTime: 25 }),
      ];

      render(
        <ResponseTimeCard
          teamAverage={25}
          teamPerformance={team}
        />
      );

      // First should be Alice (alphabetically first among ties)
      const firstRank = screen.getByTestId('ranking-item-1');
      expect(firstRank).toHaveTextContent('Alice');
    });

    it('calls onHighlight when fastest responder is clicked', () => {
      const onHighlight = vi.fn();
      const team = [
        createMockSalesPerson({ userId: 'user-1', name: 'Alice', avgResponseTime: 25 }),
      ];

      render(
        <ResponseTimeCard
          teamAverage={25}
          teamPerformance={team}
          onHighlight={onHighlight}
        />
      );

      fireEvent.click(screen.getByTestId('ranking-item-1'));
      expect(onHighlight).toHaveBeenCalledWith('user-1');
    });

    it('shows message when no response data available', () => {
      render(
        <ResponseTimeCard
          teamAverage={null}
          teamPerformance={[]}
        />
      );

      expect(screen.getByTestId('no-response-data')).toHaveTextContent('No response time data available');
    });

    it('excludes people with null avgResponseTime from ranking', () => {
      const team = [
        createMockSalesPerson({ name: 'Alice', avgResponseTime: null as unknown as number }),
        createMockSalesPerson({ name: 'Bob', avgResponseTime: 45 }),
      ];

      render(
        <ResponseTimeCard
          teamAverage={45}
          teamPerformance={team}
        />
      );

      // Only Bob should appear
      expect(screen.getByTestId('ranking-item-1')).toHaveTextContent('Bob');
      expect(screen.queryByTestId('ranking-item-2')).not.toBeInTheDocument();
    });
  });

  // AC#5: Top 3 Ranking
  describe('Top 3 Ranking', () => {
    it('shows top 3 fastest responders with position indicators', () => {
      const team = [
        createMockSalesPerson({ name: 'Alice', avgResponseTime: 25 }),
        createMockSalesPerson({ name: 'Bob', avgResponseTime: 35 }),
        createMockSalesPerson({ name: 'Charlie', avgResponseTime: 45 }),
        createMockSalesPerson({ name: 'Diana', avgResponseTime: 55 }),
      ];

      render(
        <ResponseTimeCard
          teamAverage={40}
          teamPerformance={team}
        />
      );

      expect(screen.getByTestId('ranking-item-1')).toHaveTextContent('Alice');
      expect(screen.getByTestId('ranking-item-2')).toHaveTextContent('Bob');
      expect(screen.getByTestId('ranking-item-3')).toHaveTextContent('Charlie');
      // Diana should not appear (4th place)
      expect(screen.queryByText('Diana')).not.toBeInTheDocument();
    });

    it('handles fewer than 3 people', () => {
      const team = [
        createMockSalesPerson({ name: 'Alice', avgResponseTime: 25 }),
        createMockSalesPerson({ name: 'Bob', avgResponseTime: 35 }),
      ];

      render(
        <ResponseTimeCard
          teamAverage={30}
          teamPerformance={team}
        />
      );

      expect(screen.getByTestId('ranking-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('ranking-item-2')).toBeInTheDocument();
      expect(screen.queryByTestId('ranking-item-3')).not.toBeInTheDocument();
    });

    it('each ranking item is clickable to highlight in table', () => {
      const onHighlight = vi.fn();
      const team = [
        createMockSalesPerson({ userId: 'user-1', name: 'Alice', avgResponseTime: 25 }),
        createMockSalesPerson({ userId: 'user-2', name: 'Bob', avgResponseTime: 35 }),
      ];

      render(
        <ResponseTimeCard
          teamAverage={30}
          teamPerformance={team}
          onHighlight={onHighlight}
        />
      );

      fireEvent.click(screen.getByTestId('ranking-item-2'));
      expect(onHighlight).toHaveBeenCalledWith('user-2');
    });
  });

  // AC#6: Slow Responder Alert
  describe('Slow Responder Alert', () => {
    it('shows alert badge with count of slow responders (> 60 min)', () => {
      const team = [
        createMockSalesPerson({ name: 'Alice', avgResponseTime: 25 }),
        createMockSalesPerson({ name: 'Bob', avgResponseTime: 65 }), // slow
        createMockSalesPerson({ name: 'Charlie', avgResponseTime: 90 }), // slow
      ];

      render(
        <ResponseTimeCard
          teamAverage={60}
          teamPerformance={team}
        />
      );

      const badge = screen.getByTestId('slow-responders-badge');
      expect(badge).toHaveTextContent('2 slow');
    });

    it('treats exactly 60 minutes as acceptable (NOT slow)', () => {
      const team = [
        createMockSalesPerson({ name: 'Alice', avgResponseTime: 60 }), // exactly 60 = acceptable
        createMockSalesPerson({ name: 'Bob', avgResponseTime: 61 }), // 61 = slow
      ];

      render(
        <ResponseTimeCard
          teamAverage={60.5}
          teamPerformance={team}
        />
      );

      const badge = screen.getByTestId('slow-responders-badge');
      expect(badge).toHaveTextContent('1 slow'); // Only Bob
    });

    it('shows "All on track!" when no slow responders', () => {
      const team = [
        createMockSalesPerson({ name: 'Alice', avgResponseTime: 25 }),
        createMockSalesPerson({ name: 'Bob', avgResponseTime: 45 }),
        createMockSalesPerson({ name: 'Charlie', avgResponseTime: 60 }), // exactly 60 = acceptable
      ];

      render(
        <ResponseTimeCard
          teamAverage={43}
          teamPerformance={team}
        />
      );

      expect(screen.getByTestId('all-on-track-badge')).toHaveTextContent('All on track!');
    });

    it('calls onFilterSlow when slow badge is clicked', () => {
      const onFilterSlow = vi.fn();
      const team = [
        createMockSalesPerson({ name: 'Bob', avgResponseTime: 90 }), // slow
      ];

      render(
        <ResponseTimeCard
          teamAverage={90}
          teamPerformance={team}
          onFilterSlow={onFilterSlow}
        />
      );

      fireEvent.click(screen.getByTestId('slow-responders-badge'));
      expect(onFilterSlow).toHaveBeenCalled();
    });
  });

  // AC#3: Visual Gauge
  describe('Response Time Gauge', () => {
    it('renders the gauge component', () => {
      render(
        <ResponseTimeCard
          teamAverage={45}
          teamPerformance={[]}
        />
      );

      expect(screen.getByTestId('response-time-gauge')).toBeInTheDocument();
    });
  });

  // AC#8: Loading & Empty States
  describe('Empty States', () => {
    it('shows proper message when no team performance data', () => {
      render(
        <ResponseTimeCard
          teamAverage={null}
          teamPerformance={[]}
        />
      );

      expect(screen.getByTestId('no-response-data')).toHaveTextContent('No response time data available');
    });
  });

  // Accessibility
  describe('Accessibility', () => {
    it('has accessible slow responders badge', () => {
      const team = [
        createMockSalesPerson({ avgResponseTime: 90 }),
      ];

      render(
        <ResponseTimeCard
          teamAverage={90}
          teamPerformance={team}
        />
      );

      const badge = screen.getByTestId('slow-responders-badge');
      expect(badge).toHaveAttribute('aria-label');
    });

    it('gauge has aria-label for screen readers', () => {
      render(
        <ResponseTimeCard
          teamAverage={45}
          teamPerformance={[]}
        />
      );

      expect(screen.getByTestId('response-time-gauge')).toHaveAttribute('aria-label');
    });
  });
});
