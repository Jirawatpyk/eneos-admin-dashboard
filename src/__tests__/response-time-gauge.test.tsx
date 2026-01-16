/**
 * Response Time Gauge Component Tests
 * Story 3.4: Response Time Analytics
 *
 * AC#3: Response Time Gauge/Indicator
 * - Shows Green (< 30 min), Amber (30-60 min), Red (> 60 min)
 * - Indicates current team average position
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponseTimeGauge } from '@/components/sales/response-time-gauge';

describe('ResponseTimeGauge', () => {
  const defaultProps = {
    currentValue: 45,
    fastThreshold: 30,
    acceptableThreshold: 60,
  };

  describe('Rendering', () => {
    it('renders the gauge container', () => {
      render(<ResponseTimeGauge {...defaultProps} />);
      expect(screen.getByTestId('response-time-gauge')).toBeInTheDocument();
    });

    it('renders threshold labels', () => {
      render(<ResponseTimeGauge {...defaultProps} />);

      expect(screen.getByText('<30m')).toBeInTheDocument();
      expect(screen.getByText('30-60m')).toBeInTheDocument();
      expect(screen.getByText('>60m')).toBeInTheDocument();
    });
  });

  describe('Indicator Position', () => {
    it('shows indicator for valid values', () => {
      render(<ResponseTimeGauge {...defaultProps} />);
      expect(screen.getByTestId('gauge-indicator')).toBeInTheDocument();
    });

    it('hides indicator for null values', () => {
      render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={null}
        />
      );
      expect(screen.queryByTestId('gauge-indicator')).not.toBeInTheDocument();
    });

    it('hides indicator for negative values', () => {
      render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={-1}
        />
      );
      expect(screen.queryByTestId('gauge-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Zone Colors', () => {
    it('highlights green zone for fast times (< 30 min)', () => {
      const { container } = render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={15}
        />
      );

      // The indicator should have green background
      const indicator = container.querySelector('[data-testid="gauge-indicator"] > div');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('highlights amber zone for acceptable times (30-60 min)', () => {
      const { container } = render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={45}
        />
      );

      const indicator = container.querySelector('[data-testid="gauge-indicator"] > div');
      expect(indicator).toHaveClass('bg-amber-500');
    });

    it('highlights red zone for slow times (> 60 min)', () => {
      const { container } = render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={90}
        />
      );

      const indicator = container.querySelector('[data-testid="gauge-indicator"] > div');
      expect(indicator).toHaveClass('bg-red-500');
    });
  });

  describe('Boundary Values', () => {
    it('treats 29 min as fast', () => {
      const { container } = render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={29}
        />
      );

      const indicator = container.querySelector('[data-testid="gauge-indicator"] > div');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('treats 30 min as acceptable (boundary)', () => {
      const { container } = render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={30}
        />
      );

      const indicator = container.querySelector('[data-testid="gauge-indicator"] > div');
      expect(indicator).toHaveClass('bg-amber-500');
    });

    it('treats 60 min as acceptable (upper boundary)', () => {
      const { container } = render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={60}
        />
      );

      const indicator = container.querySelector('[data-testid="gauge-indicator"] > div');
      expect(indicator).toHaveClass('bg-amber-500');
    });

    it('treats 61 min as slow', () => {
      const { container } = render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={61}
        />
      );

      const indicator = container.querySelector('[data-testid="gauge-indicator"] > div');
      expect(indicator).toHaveClass('bg-red-500');
    });
  });

  describe('Accessibility', () => {
    it('has appropriate aria-label', () => {
      render(<ResponseTimeGauge {...defaultProps} />);

      const gauge = screen.getByTestId('response-time-gauge');
      expect(gauge).toHaveAttribute('role', 'img');
      expect(gauge).toHaveAttribute('aria-label');
    });
  });

  describe('Edge Cases', () => {
    it('handles 0 minutes', () => {
      render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={0}
        />
      );

      expect(screen.getByTestId('gauge-indicator')).toBeInTheDocument();
    });

    it('handles very large values gracefully', () => {
      render(
        <ResponseTimeGauge
          {...defaultProps}
          currentValue={10000}
        />
      );

      // Should still render without errors
      expect(screen.getByTestId('gauge-indicator')).toBeInTheDocument();
    });
  });
});
