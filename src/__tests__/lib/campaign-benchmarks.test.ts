/**
 * Campaign Benchmarks Tests
 * Story 5.5: Open Rate & Click Rate Display
 *
 * Tests for AC#3: Rate Performance Indicators
 * Tests for AC#4: Benchmark Tooltips
 */
import { describe, it, expect } from 'vitest';
import {
  RATE_BENCHMARKS,
  classifyRatePerformance,
  getRateBenchmarkType,
  getRateTooltipMessage,
  RATE_TOOLTIP_MESSAGES,
  PERFORMANCE_LEVEL_CONFIG,
} from '@/lib/campaign-benchmarks';

describe('campaign-benchmarks', () => {
  // ===========================================
  // RATE_BENCHMARKS Constants
  // ===========================================
  describe('RATE_BENCHMARKS', () => {
    it('defines openRate thresholds correctly', () => {
      expect(RATE_BENCHMARKS.openRate.excellent).toBe(25);
      expect(RATE_BENCHMARKS.openRate.good).toBe(15);
    });

    it('defines clickRate thresholds correctly', () => {
      expect(RATE_BENCHMARKS.clickRate.excellent).toBe(5);
      expect(RATE_BENCHMARKS.clickRate.good).toBe(2);
    });
  });

  // ===========================================
  // classifyRatePerformance Function
  // ===========================================
  describe('classifyRatePerformance', () => {
    describe('Open Rate Classification (AC#3)', () => {
      // Boundary: ≥25% = excellent
      it('returns "excellent" for open rate ≥25%', () => {
        expect(classifyRatePerformance(30, 'openRate')).toBe('excellent');
        expect(classifyRatePerformance(50, 'openRate')).toBe('excellent');
        expect(classifyRatePerformance(100, 'openRate')).toBe('excellent');
      });

      it('returns "excellent" at exactly 25% (boundary)', () => {
        expect(classifyRatePerformance(25, 'openRate')).toBe('excellent');
      });

      // Boundary: 15-24% = good
      it('returns "good" for open rate 15-24%', () => {
        expect(classifyRatePerformance(20, 'openRate')).toBe('good');
        expect(classifyRatePerformance(18, 'openRate')).toBe('good');
      });

      it('returns "good" at exactly 24.9% (just below excellent)', () => {
        expect(classifyRatePerformance(24.9, 'openRate')).toBe('good');
      });

      it('returns "good" at exactly 15% (boundary)', () => {
        expect(classifyRatePerformance(15, 'openRate')).toBe('good');
      });

      // Boundary: <15% = poor
      it('returns "poor" for open rate <15%', () => {
        expect(classifyRatePerformance(10, 'openRate')).toBe('poor');
        expect(classifyRatePerformance(5, 'openRate')).toBe('poor');
        expect(classifyRatePerformance(0, 'openRate')).toBe('poor');
      });

      it('returns "poor" at exactly 14.9% (just below good)', () => {
        expect(classifyRatePerformance(14.9, 'openRate')).toBe('poor');
      });
    });

    describe('Click Rate Classification (AC#3)', () => {
      // Boundary: ≥5% = excellent
      it('returns "excellent" for click rate ≥5%', () => {
        expect(classifyRatePerformance(10, 'clickRate')).toBe('excellent');
        expect(classifyRatePerformance(7.5, 'clickRate')).toBe('excellent');
      });

      it('returns "excellent" at exactly 5% (boundary)', () => {
        expect(classifyRatePerformance(5, 'clickRate')).toBe('excellent');
      });

      // Boundary: 2-4% = good
      it('returns "good" for click rate 2-4%', () => {
        expect(classifyRatePerformance(3, 'clickRate')).toBe('good');
        expect(classifyRatePerformance(4, 'clickRate')).toBe('good');
      });

      it('returns "good" at exactly 4.9% (just below excellent)', () => {
        expect(classifyRatePerformance(4.9, 'clickRate')).toBe('good');
      });

      it('returns "good" at exactly 2% (boundary)', () => {
        expect(classifyRatePerformance(2, 'clickRate')).toBe('good');
      });

      // Boundary: <2% = poor
      it('returns "poor" for click rate <2%', () => {
        expect(classifyRatePerformance(1.5, 'clickRate')).toBe('poor');
        expect(classifyRatePerformance(1, 'clickRate')).toBe('poor');
        expect(classifyRatePerformance(0, 'clickRate')).toBe('poor');
      });

      it('returns "poor" at exactly 1.9% (just below good)', () => {
        expect(classifyRatePerformance(1.9, 'clickRate')).toBe('poor');
      });
    });

    describe('Edge Cases', () => {
      it('handles 0% correctly', () => {
        expect(classifyRatePerformance(0, 'openRate')).toBe('poor');
        expect(classifyRatePerformance(0, 'clickRate')).toBe('poor');
      });

      it('handles 100% correctly', () => {
        expect(classifyRatePerformance(100, 'openRate')).toBe('excellent');
        expect(classifyRatePerformance(100, 'clickRate')).toBe('excellent');
      });

      it('handles negative values as poor', () => {
        expect(classifyRatePerformance(-5, 'openRate')).toBe('poor');
        expect(classifyRatePerformance(-1, 'clickRate')).toBe('poor');
      });

      it('handles decimal precision correctly', () => {
        expect(classifyRatePerformance(24.99, 'openRate')).toBe('good');
        expect(classifyRatePerformance(25.0, 'openRate')).toBe('excellent');
        expect(classifyRatePerformance(25.01, 'openRate')).toBe('excellent');
      });
    });
  });

  // ===========================================
  // getRateBenchmarkType Function
  // ===========================================
  describe('getRateBenchmarkType', () => {
    it('maps "open" to "openRate"', () => {
      expect(getRateBenchmarkType('open')).toBe('openRate');
    });

    it('maps "click" to "clickRate"', () => {
      expect(getRateBenchmarkType('click')).toBe('clickRate');
    });
  });

  // ===========================================
  // RATE_TOOLTIP_MESSAGES Constants (AC#4)
  // ===========================================
  describe('RATE_TOOLTIP_MESSAGES', () => {
    it('contains benchmark message for open rate', () => {
      expect(RATE_TOOLTIP_MESSAGES.open.benchmark).toBe(
        'Industry avg: 20-25% for B2B emails'
      );
    });

    it('contains benchmark message for click rate', () => {
      expect(RATE_TOOLTIP_MESSAGES.click.benchmark).toBe(
        'Industry avg: 2-5% for B2B emails'
      );
    });

    it('contains status messages for all levels (open)', () => {
      expect(RATE_TOOLTIP_MESSAGES.open.excellent).toBeDefined();
      expect(RATE_TOOLTIP_MESSAGES.open.good).toBeDefined();
      expect(RATE_TOOLTIP_MESSAGES.open.poor).toBeDefined();
    });

    it('contains status messages for all levels (click)', () => {
      expect(RATE_TOOLTIP_MESSAGES.click.excellent).toBeDefined();
      expect(RATE_TOOLTIP_MESSAGES.click.good).toBeDefined();
      expect(RATE_TOOLTIP_MESSAGES.click.poor).toBeDefined();
    });
  });

  // ===========================================
  // getRateTooltipMessage Function (AC#4)
  // ===========================================
  describe('getRateTooltipMessage', () => {
    it('returns correct tooltip for excellent open rate', () => {
      const result = getRateTooltipMessage(30, 'open');
      expect(result.benchmark).toBe('Industry avg: 20-25% for B2B emails');
      expect(result.status).toBe(RATE_TOOLTIP_MESSAGES.open.excellent);
    });

    it('returns correct tooltip for good open rate', () => {
      const result = getRateTooltipMessage(20, 'open');
      expect(result.benchmark).toBe('Industry avg: 20-25% for B2B emails');
      expect(result.status).toBe(RATE_TOOLTIP_MESSAGES.open.good);
    });

    it('returns correct tooltip for poor open rate', () => {
      const result = getRateTooltipMessage(10, 'open');
      expect(result.benchmark).toBe('Industry avg: 20-25% for B2B emails');
      expect(result.status).toBe(RATE_TOOLTIP_MESSAGES.open.poor);
    });

    it('returns correct tooltip for excellent click rate', () => {
      const result = getRateTooltipMessage(8, 'click');
      expect(result.benchmark).toBe('Industry avg: 2-5% for B2B emails');
      expect(result.status).toBe(RATE_TOOLTIP_MESSAGES.click.excellent);
    });

    it('returns correct tooltip for good click rate', () => {
      const result = getRateTooltipMessage(3, 'click');
      expect(result.benchmark).toBe('Industry avg: 2-5% for B2B emails');
      expect(result.status).toBe(RATE_TOOLTIP_MESSAGES.click.good);
    });

    it('returns correct tooltip for poor click rate', () => {
      const result = getRateTooltipMessage(1, 'click');
      expect(result.benchmark).toBe('Industry avg: 2-5% for B2B emails');
      expect(result.status).toBe(RATE_TOOLTIP_MESSAGES.click.poor);
    });
  });

  // ===========================================
  // PERFORMANCE_LEVEL_CONFIG Constants
  // ===========================================
  describe('PERFORMANCE_LEVEL_CONFIG', () => {
    it('defines className for all levels', () => {
      expect(PERFORMANCE_LEVEL_CONFIG.excellent.className).toContain('bg-green');
      expect(PERFORMANCE_LEVEL_CONFIG.good.className).toContain('bg-yellow');
      expect(PERFORMANCE_LEVEL_CONFIG.poor.className).toContain('bg-red');
    });

    it('defines labels for all levels', () => {
      expect(PERFORMANCE_LEVEL_CONFIG.excellent.label).toBe('Excellent');
      expect(PERFORMANCE_LEVEL_CONFIG.good.label).toBe('Average');
      expect(PERFORMANCE_LEVEL_CONFIG.poor.label).toBe('Needs Improvement');
    });

    it('defines ariaLabels for accessibility', () => {
      expect(PERFORMANCE_LEVEL_CONFIG.excellent.ariaLabel).toBeDefined();
      expect(PERFORMANCE_LEVEL_CONFIG.good.ariaLabel).toBeDefined();
      expect(PERFORMANCE_LEVEL_CONFIG.poor.ariaLabel).toBeDefined();
    });

    it('includes dark mode variants', () => {
      expect(PERFORMANCE_LEVEL_CONFIG.excellent.className).toContain('dark:');
      expect(PERFORMANCE_LEVEL_CONFIG.good.className).toContain('dark:');
      expect(PERFORMANCE_LEVEL_CONFIG.poor.className).toContain('dark:');
    });
  });
});
