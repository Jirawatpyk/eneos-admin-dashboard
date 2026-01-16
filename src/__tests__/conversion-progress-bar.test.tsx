/**
 * Conversion Progress Bar Tests
 * Story 3.2: Conversion Rate Analytics
 *
 * AC#5: Visual Progress Indicators
 * - Mini progress bar alongside percentage
 * - Bar fills proportionally (max 100% at rate >= 50%)
 * - Colors: green >= 30%, amber 10-29%, red < 10%
 * - Accessible aria-label
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConversionProgressBar } from '@/components/sales/conversion-progress-bar';

describe('ConversionProgressBar', () => {
  // AC#5: Progress bar display
  describe('Progress Bar Rendering', () => {
    it('renders percentage value', () => {
      render(<ConversionProgressBar rate={32.5} />);
      expect(screen.getByText('32.5%')).toBeInTheDocument();
    });

    it('renders progress bar with correct role', () => {
      render(<ConversionProgressBar rate={25} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });
  });

  // AC#5: Progress bar fill calculation
  describe('Fill Width Calculation', () => {
    it('calculates fill at 50% rate = 100% width', () => {
      const { container } = render(<ConversionProgressBar rate={50} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveStyle({ width: '100%' });
    });

    it('calculates fill at 25% rate = 50% width', () => {
      const { container } = render(<ConversionProgressBar rate={25} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveStyle({ width: '50%' });
    });

    it('caps fill at 100% for rates above 50%', () => {
      const { container } = render(<ConversionProgressBar rate={75} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveStyle({ width: '100%' });
    });

    it('calculates fill at 0% rate = 0% width', () => {
      const { container } = render(<ConversionProgressBar rate={0} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveStyle({ width: '0%' });
    });
  });

  // AC#5: Color thresholds
  describe('Color Thresholds', () => {
    it('applies green color for rate >= 30%', () => {
      const { container } = render(<ConversionProgressBar rate={30} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveClass('bg-green-500');
    });

    it('applies green color for rate = 35%', () => {
      const { container } = render(<ConversionProgressBar rate={35} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveClass('bg-green-500');
    });

    it('applies amber color for rate = 29%', () => {
      const { container } = render(<ConversionProgressBar rate={29} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveClass('bg-amber-500');
    });

    it('applies amber color for rate = 10%', () => {
      const { container } = render(<ConversionProgressBar rate={10} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveClass('bg-amber-500');
    });

    it('applies red color for rate = 9.9%', () => {
      const { container } = render(<ConversionProgressBar rate={9.9} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveClass('bg-red-500');
    });

    it('applies red color for rate = 0%', () => {
      const { container } = render(<ConversionProgressBar rate={0} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveClass('bg-red-500');
    });
  });

  // AC#5: Accessibility
  describe('Accessibility', () => {
    it('has aria-label with rate and status for high performer', () => {
      render(<ConversionProgressBar rate={35} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute(
        'aria-label',
        'Conversion rate: 35.0%, above target'
      );
    });

    it('has aria-label with rate and status for acceptable', () => {
      render(<ConversionProgressBar rate={20} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute(
        'aria-label',
        'Conversion rate: 20.0%, acceptable'
      );
    });

    it('has aria-label with rate and status for needs improvement', () => {
      render(<ConversionProgressBar rate={5} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute(
        'aria-label',
        'Conversion rate: 5.0%, needs improvement'
      );
    });

    it('has aria-valuenow set to rate', () => {
      render(<ConversionProgressBar rate={42} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '42');
    });

    it('has aria-valuemin and aria-valuemax', () => {
      render(<ConversionProgressBar rate={25} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles negative rate gracefully', () => {
      const { container } = render(<ConversionProgressBar rate={-5} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveStyle({ width: '0%' });
      // Negative rate shows N/A (used when claimed=0)
      expect(screen.getByText('N/A')).toBeInTheDocument();
      expect(fill).toHaveClass('bg-gray-300');
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
      expect(progressbar).toHaveAttribute('aria-label', 'Conversion rate: N/A, no data');
    });

    it('handles very large rate', () => {
      const { container } = render(<ConversionProgressBar rate={100} />);
      const fill = container.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveStyle({ width: '100%' });
    });

    it('handles decimal rate precisely', () => {
      render(<ConversionProgressBar rate={32.567} />);
      expect(screen.getByText('32.6%')).toBeInTheDocument();
    });
  });
});
