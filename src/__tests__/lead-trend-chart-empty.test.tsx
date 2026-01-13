/**
 * Lead Trend Chart Empty State Tests
 * Story 2.2: Lead Trend Chart
 * AC: #7 - Empty State
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeadTrendChartEmpty } from '../components/dashboard/lead-trend-chart-empty';

describe('LeadTrendChartEmpty', () => {
  describe('AC#7: Empty State', () => {
    it('should render empty state component', () => {
      render(<LeadTrendChartEmpty />);

      expect(screen.getByTestId('lead-trend-chart-empty')).toBeInTheDocument();
    });

    it('should display "No data available" message', () => {
      render(<LeadTrendChartEmpty />);

      expect(screen.getByText('No data available for this period')).toBeInTheDocument();
    });

    it('should display suggestion to adjust date filter', () => {
      render(<LeadTrendChartEmpty />);

      expect(screen.getByText('Try adjusting the date filter to see lead trends')).toBeInTheDocument();
    });

    it('should display chart title', () => {
      render(<LeadTrendChartEmpty />);

      expect(screen.getByText('Lead Trend (30 Days)')).toBeInTheDocument();
    });

    it('should display calendar icon', () => {
      const { container } = render(<LeadTrendChartEmpty />);

      // CalendarDays icon should be present
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should maintain chart container height', () => {
      const { container } = render(<LeadTrendChartEmpty />);

      // Should have the h-72 height to match chart dimensions
      const contentDiv = container.querySelector('.h-72');
      expect(contentDiv).toBeInTheDocument();
    });
  });
});
