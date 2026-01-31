/**
 * Story 5-5: Open Rate & Click Rate Display - Guardrail Tests
 * TEA Automate: Regression guardrails for rate performance badges
 *
 * These tests protect critical contracts and behaviors from regression.
 * They should NEVER be modified without understanding the full impact.
 *
 * Coverage Map:
 * - [P0] Benchmark Constants Contract (AC#3)
 * - [P0] Component Public API Contract (AC#3, AC#7)
 * - [P1] Accessibility Contract (WCAG 2.1)
 * - [P1] Tooltip Content Contract (AC#4)
 * - [P2] Dark Mode Styling Contract
 * - [P2] Value Clamping Contract
 */
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RatePerformanceBadge } from '@/components/campaigns/rate-performance-badge';
import type { RatePerformanceBadgeProps } from '@/components/campaigns/rate-performance-badge';
import {
  RATE_BENCHMARKS,
  RATE_TOOLTIP_MESSAGES,
  PERFORMANCE_LEVEL_CONFIG,
  classifyRatePerformance,
  getRateBenchmarkType,
  getRateTooltipMessage,
  type RateType,
  type RatePerformanceLevel,
} from '@/lib/campaign-benchmarks';

// ===========================================
// Test Helpers
// ===========================================

function renderBadge(props: RatePerformanceBadgeProps) {
  return render(
    <TooltipProvider>
      <RatePerformanceBadge {...props} />
    </TooltipProvider>
  );
}

// ===========================================
// [P0] Benchmark Constants Contract
// ===========================================
describe('[P0] Benchmark Constants Contract', () => {
  /**
   * GUARDRAIL: These thresholds define AC#3 color coding.
   * Changing them changes the meaning of green/yellow/red badges
   * across the entire dashboard. Any change MUST be coordinated
   * with product owner and documented.
   */
  describe('Open Rate Thresholds', () => {
    it('excellent threshold is 25%', () => {
      expect(RATE_BENCHMARKS.openRate.excellent).toBe(25);
    });

    it('good threshold is 15%', () => {
      expect(RATE_BENCHMARKS.openRate.good).toBe(15);
    });
  });

  describe('Click Rate Thresholds', () => {
    it('excellent threshold is 5%', () => {
      expect(RATE_BENCHMARKS.clickRate.excellent).toBe(5);
    });

    it('good threshold is 2%', () => {
      expect(RATE_BENCHMARKS.clickRate.good).toBe(2);
    });
  });

  describe('Performance Level Config Completeness', () => {
    it('defines all three levels', () => {
      const levels: RatePerformanceLevel[] = ['excellent', 'good', 'poor'];
      for (const level of levels) {
        expect(PERFORMANCE_LEVEL_CONFIG[level]).toBeDefined();
        expect(PERFORMANCE_LEVEL_CONFIG[level].className).toBeTruthy();
        expect(PERFORMANCE_LEVEL_CONFIG[level].label).toBeTruthy();
        expect(PERFORMANCE_LEVEL_CONFIG[level].ariaLabel).toBeTruthy();
      }
    });

    it('excellent uses green color scheme', () => {
      expect(PERFORMANCE_LEVEL_CONFIG.excellent.className).toMatch(/bg-green/);
      expect(PERFORMANCE_LEVEL_CONFIG.excellent.className).toMatch(/text-green/);
    });

    it('good uses yellow color scheme', () => {
      expect(PERFORMANCE_LEVEL_CONFIG.good.className).toMatch(/bg-yellow/);
      expect(PERFORMANCE_LEVEL_CONFIG.good.className).toMatch(/text-yellow/);
    });

    it('poor uses red color scheme', () => {
      expect(PERFORMANCE_LEVEL_CONFIG.poor.className).toMatch(/bg-red/);
      expect(PERFORMANCE_LEVEL_CONFIG.poor.className).toMatch(/text-red/);
    });
  });

  describe('Tooltip Messages Completeness', () => {
    it('open rate has all required message keys', () => {
      expect(RATE_TOOLTIP_MESSAGES.open).toHaveProperty('benchmark');
      expect(RATE_TOOLTIP_MESSAGES.open).toHaveProperty('excellent');
      expect(RATE_TOOLTIP_MESSAGES.open).toHaveProperty('good');
      expect(RATE_TOOLTIP_MESSAGES.open).toHaveProperty('poor');
    });

    it('click rate has all required message keys', () => {
      expect(RATE_TOOLTIP_MESSAGES.click).toHaveProperty('benchmark');
      expect(RATE_TOOLTIP_MESSAGES.click).toHaveProperty('excellent');
      expect(RATE_TOOLTIP_MESSAGES.click).toHaveProperty('good');
      expect(RATE_TOOLTIP_MESSAGES.click).toHaveProperty('poor');
    });

    it('benchmark messages reference B2B industry', () => {
      expect(RATE_TOOLTIP_MESSAGES.open.benchmark).toMatch(/B2B/);
      expect(RATE_TOOLTIP_MESSAGES.click.benchmark).toMatch(/B2B/);
    });
  });
});

// ===========================================
// [P0] Classification Logic Contract
// ===========================================
describe('[P0] Classification Logic Contract', () => {
  /**
   * GUARDRAIL: Classification boundaries must be exact.
   * These tests verify the >= comparison operators used in
   * classifyRatePerformance. Off-by-one errors here cause
   * badges to show wrong colors.
   */
  describe('Open Rate Classification Boundaries', () => {
    it('24.999 is good, 25.0 is excellent (boundary)', () => {
      expect(classifyRatePerformance(24.999, 'openRate')).toBe('good');
      expect(classifyRatePerformance(25.0, 'openRate')).toBe('excellent');
    });

    it('14.999 is poor, 15.0 is good (boundary)', () => {
      expect(classifyRatePerformance(14.999, 'openRate')).toBe('poor');
      expect(classifyRatePerformance(15.0, 'openRate')).toBe('good');
    });
  });

  describe('Click Rate Classification Boundaries', () => {
    it('4.999 is good, 5.0 is excellent (boundary)', () => {
      expect(classifyRatePerformance(4.999, 'clickRate')).toBe('good');
      expect(classifyRatePerformance(5.0, 'clickRate')).toBe('excellent');
    });

    it('1.999 is poor, 2.0 is good (boundary)', () => {
      expect(classifyRatePerformance(1.999, 'clickRate')).toBe('poor');
      expect(classifyRatePerformance(2.0, 'clickRate')).toBe('good');
    });
  });

  describe('Type Mapping', () => {
    it('maps open → openRate', () => {
      expect(getRateBenchmarkType('open')).toBe('openRate');
    });

    it('maps click → clickRate', () => {
      expect(getRateBenchmarkType('click')).toBe('clickRate');
    });
  });

  describe('Tooltip Message Selection', () => {
    it('returns correct level-based status for each tier', () => {
      const excellentOpen = getRateTooltipMessage(30, 'open');
      const goodOpen = getRateTooltipMessage(20, 'open');
      const poorOpen = getRateTooltipMessage(10, 'open');

      expect(excellentOpen.status).toBe(RATE_TOOLTIP_MESSAGES.open.excellent);
      expect(goodOpen.status).toBe(RATE_TOOLTIP_MESSAGES.open.good);
      expect(poorOpen.status).toBe(RATE_TOOLTIP_MESSAGES.open.poor);
    });

    it('always returns benchmark string regardless of level', () => {
      const levels = [30, 20, 10]; // excellent, good, poor
      for (const value of levels) {
        const result = getRateTooltipMessage(value, 'open');
        expect(result.benchmark).toBe(RATE_TOOLTIP_MESSAGES.open.benchmark);
      }
    });
  });
});

// ===========================================
// [P0] Component Public API Contract
// ===========================================
describe('[P0] Component Public API Contract', () => {
  /**
   * GUARDRAIL: data-testid and data-level attributes are used by:
   * 1. E2E tests (Playwright selectors)
   * 2. Campaign table integration (getAllByTestId)
   * 3. Monitoring/analytics hooks
   * Removing or renaming these breaks downstream consumers.
   */
  describe('data-testid Contract', () => {
    it('open badge has data-testid="rate-badge-open"', () => {
      renderBadge({ value: 20, type: 'open', delivered: 100 });
      expect(screen.getByTestId('rate-badge-open')).toBeInTheDocument();
    });

    it('click badge has data-testid="rate-badge-click"', () => {
      renderBadge({ value: 3, type: 'click', delivered: 100 });
      expect(screen.getByTestId('rate-badge-click')).toBeInTheDocument();
    });

    it('empty open badge has data-testid="rate-badge-open-empty"', () => {
      renderBadge({ value: 0, type: 'open', delivered: 0 });
      expect(screen.getByTestId('rate-badge-open-empty')).toBeInTheDocument();
    });

    it('empty click badge has data-testid="rate-badge-click-empty"', () => {
      renderBadge({ value: 0, type: 'click', delivered: 0 });
      expect(screen.getByTestId('rate-badge-click-empty')).toBeInTheDocument();
    });

    it('invalid open badge has data-testid="rate-badge-open-invalid"', () => {
      renderBadge({ value: NaN, type: 'open', delivered: 100 });
      expect(screen.getByTestId('rate-badge-open-invalid')).toBeInTheDocument();
    });

    it('invalid click badge has data-testid="rate-badge-click-invalid"', () => {
      renderBadge({ value: NaN, type: 'click', delivered: 100 });
      expect(screen.getByTestId('rate-badge-click-invalid')).toBeInTheDocument();
    });
  });

  describe('data-level Contract', () => {
    it('maps to "excellent" for high open rate', () => {
      renderBadge({ value: 30, type: 'open', delivered: 100 });
      expect(screen.getByTestId('rate-badge-open')).toHaveAttribute('data-level', 'excellent');
    });

    it('maps to "good" for mid open rate', () => {
      renderBadge({ value: 20, type: 'open', delivered: 100 });
      expect(screen.getByTestId('rate-badge-open')).toHaveAttribute('data-level', 'good');
    });

    it('maps to "poor" for low open rate', () => {
      renderBadge({ value: 10, type: 'open', delivered: 100 });
      expect(screen.getByTestId('rate-badge-open')).toHaveAttribute('data-level', 'poor');
    });

    it('maps to "excellent" for high click rate', () => {
      renderBadge({ value: 8, type: 'click', delivered: 100 });
      expect(screen.getByTestId('rate-badge-click')).toHaveAttribute('data-level', 'excellent');
    });

    it('maps to "good" for mid click rate', () => {
      renderBadge({ value: 3, type: 'click', delivered: 100 });
      expect(screen.getByTestId('rate-badge-click')).toHaveAttribute('data-level', 'good');
    });

    it('maps to "poor" for low click rate', () => {
      renderBadge({ value: 1, type: 'click', delivered: 100 });
      expect(screen.getByTestId('rate-badge-click')).toHaveAttribute('data-level', 'poor');
    });
  });

  describe('Display Value Format Contract', () => {
    it('formats rate to exactly 1 decimal place with % suffix', () => {
      renderBadge({ value: 25, type: 'open', delivered: 100 });
      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });

    it('rounds to 1 decimal place', () => {
      renderBadge({ value: 33.333, type: 'click', delivered: 100 });
      expect(screen.getByText('33.3%')).toBeInTheDocument();
    });

    it('displays "-" for empty state (delivered=0)', () => {
      renderBadge({ value: 0, type: 'open', delivered: 0 });
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('displays "-" for invalid state (NaN)', () => {
      renderBadge({ value: NaN, type: 'click', delivered: 100 });
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});

// ===========================================
// [P1] Accessibility Contract (WCAG 2.1)
// ===========================================
describe('[P1] Accessibility Contract', () => {
  /**
   * GUARDRAIL: WCAG 2.1 Level AA compliance requirements:
   * - 1.4.1: Color is not the only visual means of conveying information
   * - 4.1.2: Name, Role, Value for assistive technology
   * Removing any of these creates legal/compliance risk.
   */
  describe('Color Not Sole Indicator (WCAG 1.4.1)', () => {
    const testCases: Array<{ level: RatePerformanceLevel; value: number; type: RateType }> = [
      { level: 'excellent', value: 30, type: 'open' },
      { level: 'good', value: 20, type: 'open' },
      { level: 'poor', value: 10, type: 'open' },
      { level: 'excellent', value: 8, type: 'click' },
      { level: 'good', value: 3, type: 'click' },
      { level: 'poor', value: 1, type: 'click' },
    ];

    it.each(testCases)(
      'includes sr-only text for $level $type badge',
      ({ value, type }) => {
        renderBadge({ value, type, delivered: 100 });
        const badge = screen.getByTestId(`rate-badge-${type}`);
        const srOnly = badge.querySelector('.sr-only');
        expect(srOnly).toBeInTheDocument();
        expect(srOnly?.textContent).toBeTruthy();
      }
    );

    it.each(testCases)(
      'includes decorative icon with aria-hidden for $level $type badge',
      ({ value, type }) => {
        const { container } = renderBadge({ value, type, delivered: 100 });
        const icon = container.querySelector('svg[aria-hidden="true"]');
        expect(icon).toBeInTheDocument();
      }
    );
  });

  describe('Screen Reader Labels', () => {
    it('sr-only text matches PERFORMANCE_LEVEL_CONFIG.label', () => {
      renderBadge({ value: 30, type: 'open', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-open');
      const srOnly = badge.querySelector('.sr-only');
      expect(srOnly?.textContent).toBe(PERFORMANCE_LEVEL_CONFIG.excellent.label);
    });

    it('good level has correct sr-only label', () => {
      renderBadge({ value: 20, type: 'open', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-open');
      const srOnly = badge.querySelector('.sr-only');
      expect(srOnly?.textContent).toBe(PERFORMANCE_LEVEL_CONFIG.good.label);
    });

    it('poor level has correct sr-only label', () => {
      renderBadge({ value: 10, type: 'open', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-open');
      const srOnly = badge.querySelector('.sr-only');
      expect(srOnly?.textContent).toBe(PERFORMANCE_LEVEL_CONFIG.poor.label);
    });
  });

  describe('Empty State Accessibility', () => {
    it('empty badge uses tabular-nums for alignment', () => {
      renderBadge({ value: 0, type: 'open', delivered: 0 });
      const badge = screen.getByTestId('rate-badge-open-empty');
      expect(badge.className).toContain('tabular-nums');
    });

    it('invalid badge uses tabular-nums for alignment', () => {
      renderBadge({ value: NaN, type: 'open', delivered: 100 });
      const badge = screen.getByTestId('rate-badge-open-invalid');
      expect(badge.className).toContain('tabular-nums');
    });
  });
});

// ===========================================
// [P1] Tooltip Content Contract (AC#4)
// ===========================================
describe('[P1] Tooltip Content Contract', () => {
  /**
   * GUARDRAIL: Tooltip content is user-facing educational content.
   * Changes affect user understanding of performance metrics.
   */
  describe('Open Rate Tooltip', () => {
    it('shows rate label, value, and benchmark on hover', async () => {
      const user = userEvent.setup();
      renderBadge({ value: 25, type: 'open', delivered: 100 });

      await user.hover(screen.getByTestId('rate-badge-open'));
      await waitFor(() => {
        expect(screen.getAllByText('Open Rate: 25.0%').length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Industry avg/).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Click Rate Tooltip', () => {
    it('shows rate label, value, and benchmark on hover', async () => {
      const user = userEvent.setup();
      renderBadge({ value: 3.5, type: 'click', delivered: 200 });

      await user.hover(screen.getByTestId('rate-badge-click'));
      await waitFor(() => {
        expect(screen.getAllByText('Click Rate: 3.5%').length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Industry avg/).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Empty State Tooltip', () => {
    it('shows "No deliveries yet" on hover for empty badge', async () => {
      const user = userEvent.setup();
      renderBadge({ value: 0, type: 'open', delivered: 0 });

      await user.hover(screen.getByTestId('rate-badge-open-empty'));
      await waitFor(() => {
        expect(screen.getAllByText('No deliveries yet').length).toBeGreaterThan(0);
      });
    });
  });
});

// ===========================================
// [P2] Dark Mode Styling Contract
// ===========================================
describe('[P2] Dark Mode Styling Contract', () => {
  /**
   * GUARDRAIL: Dark mode classes must exist for all performance levels.
   * Missing dark: prefixed classes cause invisible text in dark mode.
   */
  const levels: RatePerformanceLevel[] = ['excellent', 'good', 'poor'];

  it.each(levels)('"%s" config includes dark mode background class', (level) => {
    expect(PERFORMANCE_LEVEL_CONFIG[level].className).toMatch(/dark:bg-/);
  });

  it.each(levels)('"%s" config includes dark mode text class', (level) => {
    expect(PERFORMANCE_LEVEL_CONFIG[level].className).toMatch(/dark:text-/);
  });
});

// ===========================================
// [P2] Value Clamping Contract
// ===========================================
describe('[P2] Value Clamping Contract', () => {
  /**
   * GUARDRAIL: Values outside 0-100 must be clamped to prevent
   * nonsensical display (e.g., "150.0%" or "-5.0%").
   * Backend anomalies should not break the UI.
   */
  it('clamps values above 100 to 100.0%', () => {
    renderBadge({ value: 150, type: 'open', delivered: 100 });
    expect(screen.getByText('100.0%')).toBeInTheDocument();
    expect(screen.queryByText('150.0%')).not.toBeInTheDocument();
  });

  it('clamps negative values to 0.0%', () => {
    renderBadge({ value: -10, type: 'click', delivered: 100 });
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.queryByText('-10.0%')).not.toBeInTheDocument();
  });

  it('treats clamped high value as excellent', () => {
    renderBadge({ value: 200, type: 'open', delivered: 100 });
    expect(screen.getByTestId('rate-badge-open')).toHaveAttribute('data-level', 'excellent');
  });

  it('treats clamped negative value as poor', () => {
    renderBadge({ value: -50, type: 'click', delivered: 100 });
    expect(screen.getByTestId('rate-badge-click')).toHaveAttribute('data-level', 'poor');
  });
});

// ===========================================
// [P2] Empty State Guard (AC#7)
// ===========================================
describe('[P2] Empty State Exhaustive Guard', () => {
  /**
   * GUARDRAIL: Every invalid input combination must produce
   * a safe output ("-") instead of crashing or showing "NaN%".
   */
  const emptyInputs: Array<{ desc: string; props: RatePerformanceBadgeProps }> = [
    { desc: 'delivered=0', props: { value: 0, type: 'open', delivered: 0 } },
    { desc: 'delivered=-1', props: { value: 0, type: 'click', delivered: -1 } },
    { desc: 'value=NaN', props: { value: NaN, type: 'open', delivered: 100 } },
    // @ts-expect-error - testing undefined value
    { desc: 'value=undefined', props: { value: undefined, type: 'click', delivered: 100 } },
    // @ts-expect-error - testing null value
    { desc: 'value=null', props: { value: null, type: 'open', delivered: 100 } },
  ];

  it.each(emptyInputs)('renders "-" for $desc', ({ props }) => {
    renderBadge(props);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it.each(emptyInputs)('does NOT render "NaN%" for $desc', ({ props }) => {
    renderBadge(props);
    expect(screen.queryByText('NaN%')).not.toBeInTheDocument();
  });

  it.each(emptyInputs)('does NOT render "undefined%" for $desc', ({ props }) => {
    renderBadge(props);
    expect(screen.queryByText('undefined%')).not.toBeInTheDocument();
  });
});
