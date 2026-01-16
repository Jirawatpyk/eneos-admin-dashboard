/**
 * Sales Targets Configuration Tests
 * Story 3.7: Target vs Actual Comparison
 * Task 1: Target Configuration (AC#1)
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_TARGETS,
  getTargets,
  type SalesTargets,
} from '@/config/sales-targets';

describe('Sales Targets Configuration', () => {
  describe('DEFAULT_TARGETS', () => {
    it('should have claimed target of 50 per person per month', () => {
      expect(DEFAULT_TARGETS.claimed).toBe(50);
    });

    it('should have closed target of 15 per person per month', () => {
      expect(DEFAULT_TARGETS.closed).toBe(15);
    });

    it('should have conversionRate target of 30%', () => {
      expect(DEFAULT_TARGETS.conversionRate).toBe(30);
    });

    it('should have all required properties', () => {
      const targets: SalesTargets = DEFAULT_TARGETS;
      expect(targets).toHaveProperty('claimed');
      expect(targets).toHaveProperty('closed');
      expect(targets).toHaveProperty('conversionRate');
    });

    it('should have positive numeric values', () => {
      expect(typeof DEFAULT_TARGETS.claimed).toBe('number');
      expect(typeof DEFAULT_TARGETS.closed).toBe('number');
      expect(typeof DEFAULT_TARGETS.conversionRate).toBe('number');
      expect(DEFAULT_TARGETS.claimed).toBeGreaterThan(0);
      expect(DEFAULT_TARGETS.closed).toBeGreaterThan(0);
      expect(DEFAULT_TARGETS.conversionRate).toBeGreaterThan(0);
    });
  });

  describe('getTargets', () => {
    it('should return default targets', () => {
      const targets = getTargets();
      expect(targets).toEqual(DEFAULT_TARGETS);
    });

    it('should return an object with all required properties', () => {
      const targets = getTargets();
      expect(targets.claimed).toBeDefined();
      expect(targets.closed).toBeDefined();
      expect(targets.conversionRate).toBeDefined();
    });

    it('should return the same values as DEFAULT_TARGETS for MVP', () => {
      const targets = getTargets();
      expect(targets.claimed).toBe(50);
      expect(targets.closed).toBe(15);
      expect(targets.conversionRate).toBe(30);
    });
  });
});
