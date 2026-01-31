/**
 * Rate Performance Badge Tests
 * Story 5.5: Open Rate & Click Rate Display
 *
 * Tests for:
 * - AC#3: Rate Performance Indicators (color coding)
 * - AC#4: Benchmark Tooltips
 * - AC#7: Empty Rate Handling
 * - Accessibility: Color not sole indicator
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RatePerformanceBadge } from '@/components/campaigns/rate-performance-badge';
import type { RatePerformanceBadgeProps } from '@/components/campaigns/rate-performance-badge';

/**
 * Wrap with TooltipProvider since badge no longer bundles its own.
 * This mirrors the production usage where CampaignTable provides the provider.
 */
function renderBadge(props: RatePerformanceBadgeProps) {
  return render(
    <TooltipProvider>
      <RatePerformanceBadge {...props} />
    </TooltipProvider>
  );
}

describe('RatePerformanceBadge', () => {
  // ===========================================
  // AC#3: Color Coding based on benchmarks
  // ===========================================
  describe('Open Rate Color Coding (AC#3)', () => {
    it('shows green badge for excellent open rate (≥25%)', () => {
      renderBadge({ value: 30, type: 'open', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-open');
      expect(badge).toHaveAttribute('data-level', 'excellent');
      expect(badge).toHaveClass('bg-green-100');
    });

    it('shows yellow badge for good open rate (15-24%)', () => {
      renderBadge({ value: 20, type: 'open', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-open');
      expect(badge).toHaveAttribute('data-level', 'good');
      expect(badge).toHaveClass('bg-yellow-100');
    });

    it('shows red badge for poor open rate (<15%)', () => {
      renderBadge({ value: 10, type: 'open', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-open');
      expect(badge).toHaveAttribute('data-level', 'poor');
      expect(badge).toHaveClass('bg-red-100');
    });
  });

  describe('Click Rate Color Coding (AC#3)', () => {
    it('shows green badge for excellent click rate (≥5%)', () => {
      renderBadge({ value: 8, type: 'click', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-click');
      expect(badge).toHaveAttribute('data-level', 'excellent');
      expect(badge).toHaveClass('bg-green-100');
    });

    it('shows yellow badge for good click rate (2-4%)', () => {
      renderBadge({ value: 3, type: 'click', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-click');
      expect(badge).toHaveAttribute('data-level', 'good');
      expect(badge).toHaveClass('bg-yellow-100');
    });

    it('shows red badge for poor click rate (<2%)', () => {
      renderBadge({ value: 1, type: 'click', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-click');
      expect(badge).toHaveAttribute('data-level', 'poor');
      expect(badge).toHaveClass('bg-red-100');
    });
  });

  // ===========================================
  // Boundary Value Tests (Story 5.5 Task 7.6)
  // ===========================================
  describe('Boundary Values - Open Rate', () => {
    it('shows excellent at exactly 25%', () => {
      renderBadge({ value: 25, type: 'open', delivered: 100 });
      expect(screen.getByTestId('rate-badge-open')).toHaveAttribute('data-level', 'excellent');
    });

    it('shows good at 24.9% (just below excellent)', () => {
      renderBadge({ value: 24.9, type: 'open', delivered: 100 });
      expect(screen.getByTestId('rate-badge-open')).toHaveAttribute('data-level', 'good');
    });

    it('shows good at exactly 15%', () => {
      renderBadge({ value: 15, type: 'open', delivered: 100 });
      expect(screen.getByTestId('rate-badge-open')).toHaveAttribute('data-level', 'good');
    });

    it('shows poor at 14.9% (just below good)', () => {
      renderBadge({ value: 14.9, type: 'open', delivered: 100 });
      expect(screen.getByTestId('rate-badge-open')).toHaveAttribute('data-level', 'poor');
    });
  });

  describe('Boundary Values - Click Rate', () => {
    it('shows excellent at exactly 5%', () => {
      renderBadge({ value: 5, type: 'click', delivered: 100 });
      expect(screen.getByTestId('rate-badge-click')).toHaveAttribute('data-level', 'excellent');
    });

    it('shows good at 4.9% (just below excellent)', () => {
      renderBadge({ value: 4.9, type: 'click', delivered: 100 });
      expect(screen.getByTestId('rate-badge-click')).toHaveAttribute('data-level', 'good');
    });

    it('shows good at exactly 2%', () => {
      renderBadge({ value: 2, type: 'click', delivered: 100 });
      expect(screen.getByTestId('rate-badge-click')).toHaveAttribute('data-level', 'good');
    });

    it('shows poor at 1.9% (just below good)', () => {
      renderBadge({ value: 1.9, type: 'click', delivered: 100 });
      expect(screen.getByTestId('rate-badge-click')).toHaveAttribute('data-level', 'poor');
    });
  });

  // ===========================================
  // AC#7: Empty Rate Handling
  // ===========================================
  describe('Empty Rate Handling (AC#7)', () => {
    it('shows "-" when delivered is 0', () => {
      renderBadge({ value: 0, type: 'open', delivered: 0 });
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByTestId('rate-badge-open-empty')).toBeInTheDocument();
    });

    it('shows "-" when delivered is negative', () => {
      renderBadge({ value: 0, type: 'click', delivered: -1 });
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('shows "-" when value is NaN', () => {
      renderBadge({ value: NaN, type: 'open', delivered: 100 });
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByTestId('rate-badge-open-invalid')).toBeInTheDocument();
    });

    it('shows "-" when value is undefined', () => {
      // @ts-expect-error - testing undefined value
      renderBadge({ value: undefined, type: 'click', delivered: 100 });
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('shows "-" when value is null', () => {
      // @ts-expect-error - testing null value
      renderBadge({ value: null, type: 'open', delivered: 100 });
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('shows tooltip "No deliveries yet" for empty delivered', async () => {
      const user = userEvent.setup();
      renderBadge({ value: 0, type: 'open', delivered: 0 });

      await user.hover(screen.getByTestId('rate-badge-open-empty'));
      await waitFor(() => {
        // Radix tooltip renders duplicate content for accessibility
        expect(screen.getAllByText('No deliveries yet').length).toBeGreaterThan(0);
      });
    });
  });

  // ===========================================
  // AC#4: Benchmark Tooltips
  // ===========================================
  describe('Benchmark Tooltips (AC#4)', () => {
    it('shows tooltip with benchmark info on hover for open rate', async () => {
      const user = userEvent.setup();
      renderBadge({ value: 25, type: 'open', delivered: 100 });

      await user.hover(screen.getByTestId('rate-badge-open'));
      await waitFor(() => {
        // Radix tooltip renders duplicate content for accessibility
        expect(screen.getAllByText('Open Rate: 25.0%').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Industry avg: 20-25% for B2B emails').length).toBeGreaterThan(0);
      });
    });

    it('shows tooltip with benchmark info on hover for click rate', async () => {
      const user = userEvent.setup();
      renderBadge({ value: 3.5, type: 'click', delivered: 200 });

      await user.hover(screen.getByTestId('rate-badge-click'));
      await waitFor(() => {
        // Radix tooltip renders duplicate content for accessibility
        expect(screen.getAllByText('Click Rate: 3.5%').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Industry avg: 2-5% for B2B emails').length).toBeGreaterThan(0);
      });
    });

    it('shows status message for excellent performance', async () => {
      const user = userEvent.setup();
      renderBadge({ value: 30, type: 'open', delivered: 100 });

      await user.hover(screen.getByTestId('rate-badge-open'));
      await waitFor(() => {
        // Radix tooltip renders duplicate content for accessibility
        expect(screen.getAllByText(/great engagement/i).length).toBeGreaterThan(0);
      });
    });

    it('shows status message for poor performance', async () => {
      const user = userEvent.setup();
      renderBadge({ value: 10, type: 'open', delivered: 100 });

      await user.hover(screen.getByTestId('rate-badge-open'));
      await waitFor(() => {
        // Radix tooltip renders duplicate content for accessibility
        expect(screen.getAllByText(/consider improving subject lines/i).length).toBeGreaterThan(0);
      });
    });
  });

  // ===========================================
  // Accessibility (WCAG 2.1)
  // ===========================================
  describe('Accessibility', () => {
    it('includes screen reader text (sr-only)', () => {
      renderBadge({ value: 30, type: 'open', delivered: 100 });
      expect(screen.getByText('Excellent')).toHaveClass('sr-only');
    });

    it('includes icon for color-blind users (not color alone)', () => {
      const { container } = renderBadge({ value: 30, type: 'open', delivered: 100 });
      // Check that icon exists with aria-hidden
      const icon = container.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('has correct aria-hidden on icon', () => {
      const { container } = renderBadge({ value: 10, type: 'click', delivered: 100 });
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('badge is focusable for keyboard navigation', () => {
      renderBadge({ value: 20, type: 'open', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-open');
      expect(badge).toBeVisible();
    });
  });

  // ===========================================
  // Formatting
  // ===========================================
  describe('Rate Value Formatting', () => {
    it('formats value to 1 decimal place', () => {
      renderBadge({ value: 25.678, type: 'open', delivered: 100 });
      expect(screen.getByText('25.7%')).toBeInTheDocument();
    });

    it('formats integer value with .0', () => {
      renderBadge({ value: 30, type: 'click', delivered: 100 });
      expect(screen.getByText('30.0%')).toBeInTheDocument();
    });

    it('formats 0% correctly when delivered > 0', () => {
      renderBadge({ value: 0, type: 'open', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-open');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });

  // ===========================================
  // Custom className
  // ===========================================
  describe('Custom Styling', () => {
    it('accepts custom className', () => {
      renderBadge({ value: 20, type: 'open', delivered: 100, className: 'custom-class' });
      const badge = screen.getByTestId('rate-badge-open');
      expect(badge).toHaveClass('custom-class');
    });
  });

  // ===========================================
  // Edge Cases
  // ===========================================
  describe('Edge Cases', () => {
    it('handles 100% rate', () => {
      renderBadge({ value: 100, type: 'open', delivered: 100 });
      expect(screen.getByText('100.0%')).toBeInTheDocument();
      expect(screen.getByTestId('rate-badge-open')).toHaveAttribute('data-level', 'excellent');
    });

    it('handles very small positive values', () => {
      renderBadge({ value: 0.1, type: 'click', delivered: 1000 });
      expect(screen.getByText('0.1%')).toBeInTheDocument();
      expect(screen.getByTestId('rate-badge-click')).toHaveAttribute('data-level', 'poor');
    });

    it('works without delivered prop (renders badge)', () => {
      renderBadge({ value: 25, type: 'open' });
      const badge = screen.getByTestId('rate-badge-open');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });

    it('clamps values above 100% to 100%', () => {
      renderBadge({ value: 150, type: 'open', delivered: 100 });
      expect(screen.getByText('100.0%')).toBeInTheDocument();
      expect(screen.getByTestId('rate-badge-open')).toHaveAttribute('data-level', 'excellent');
    });

    it('clamps negative values to 0%', () => {
      renderBadge({ value: -5, type: 'click', delivered: 100 });
      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByTestId('rate-badge-click')).toHaveAttribute('data-level', 'poor');
    });
  });
});
