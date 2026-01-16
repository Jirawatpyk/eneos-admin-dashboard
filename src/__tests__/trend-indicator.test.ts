/**
 * Trend Indicator Tests
 * Story 3.5: Individual Performance Trend
 *
 * AC#6: Trend Indicator
 * - Compares first half vs second half of period
 * - >10% change = improving/declining, else stable
 * - If first half avg is 0, treat as "Stable" (avoid division by zero)
 */
import { describe, it, expect } from 'vitest';
import { calculateTrendDirection } from '@/components/sales/trend-indicator';
import type { DailyMetric } from '@/types/sales';

// ===========================================
// Test Utilities
// ===========================================

function createDailyMetric(closed: number, date?: string): DailyMetric {
  return {
    date: date || '2026-01-01',
    claimed: closed * 3,
    contacted: closed * 2,
    closed,
    conversionRate: 33,
  };
}

// ===========================================
// Tests
// ===========================================

describe('calculateTrendDirection', () => {
  describe('Improving Trend (>10% increase)', () => {
    it('returns "up" when second half > first half by more than 10%', () => {
      const data: DailyMetric[] = [
        // First half: avg = 5
        createDailyMetric(4),
        createDailyMetric(5),
        createDailyMetric(6),
        createDailyMetric(5),
        // Second half: avg = 8 (60% increase)
        createDailyMetric(7),
        createDailyMetric(8),
        createDailyMetric(9),
        createDailyMetric(8),
      ];

      expect(calculateTrendDirection(data)).toBe('up');
    });

    it('returns "up" when first half is 0 and second half > 0', () => {
      const data: DailyMetric[] = [
        // First half: avg = 0
        createDailyMetric(0),
        createDailyMetric(0),
        createDailyMetric(0),
        createDailyMetric(0),
        // Second half: avg = 3
        createDailyMetric(2),
        createDailyMetric(3),
        createDailyMetric(4),
        createDailyMetric(3),
      ];

      expect(calculateTrendDirection(data)).toBe('up');
    });
  });

  describe('Declining Trend (>10% decrease)', () => {
    it('returns "down" when second half < first half by more than 10%', () => {
      const data: DailyMetric[] = [
        // First half: avg = 8
        createDailyMetric(7),
        createDailyMetric(8),
        createDailyMetric(9),
        createDailyMetric(8),
        // Second half: avg = 4 (50% decrease)
        createDailyMetric(3),
        createDailyMetric(4),
        createDailyMetric(5),
        createDailyMetric(4),
      ];

      expect(calculateTrendDirection(data)).toBe('down');
    });
  });

  describe('Stable Trend (within 10%)', () => {
    it('returns "stable" when change is between -10% and +10%', () => {
      const data: DailyMetric[] = [
        // First half: avg = 5
        createDailyMetric(4),
        createDailyMetric(5),
        createDailyMetric(6),
        createDailyMetric(5),
        // Second half: avg = 5.25 (5% increase)
        createDailyMetric(5),
        createDailyMetric(5),
        createDailyMetric(5),
        createDailyMetric(6),
      ];

      expect(calculateTrendDirection(data)).toBe('stable');
    });

    it('returns "stable" when all data is zeros', () => {
      const data: DailyMetric[] = [
        createDailyMetric(0),
        createDailyMetric(0),
        createDailyMetric(0),
        createDailyMetric(0),
        createDailyMetric(0),
        createDailyMetric(0),
        createDailyMetric(0),
        createDailyMetric(0),
      ];

      expect(calculateTrendDirection(data)).toBe('stable');
    });

    it('returns "stable" when data has less than 2 points', () => {
      expect(calculateTrendDirection([])).toBe('stable');
      expect(calculateTrendDirection([createDailyMetric(5)])).toBe('stable');
    });
  });

  describe('Edge Cases', () => {
    it('handles odd number of data points by splitting correctly', () => {
      const data: DailyMetric[] = [
        // First half (2 items): avg = 5
        createDailyMetric(4),
        createDailyMetric(6),
        // Second half (3 items): avg = 7
        createDailyMetric(6),
        createDailyMetric(7),
        createDailyMetric(8),
      ];

      // 40% increase
      expect(calculateTrendDirection(data)).toBe('up');
    });

    it('handles exactly 2 data points', () => {
      const data: DailyMetric[] = [
        createDailyMetric(5), // First half
        createDailyMetric(10), // Second half (100% increase)
      ];

      expect(calculateTrendDirection(data)).toBe('up');
    });

    it('handles very large values without overflow', () => {
      const data: DailyMetric[] = [
        createDailyMetric(1000000),
        createDailyMetric(1000000),
        createDailyMetric(1200000),
        createDailyMetric(1200000),
      ];

      expect(calculateTrendDirection(data)).toBe('up');
    });
  });
});
