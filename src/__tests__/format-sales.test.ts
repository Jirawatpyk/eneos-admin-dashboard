/**
 * Sales Formatting Utilities Tests
 * Story 3.1: Sales Team Performance Table
 *
 * AC#4: Conversion Rate Formatting
 * AC#5: Response Time Formatting
 */
import { describe, it, expect } from 'vitest';
import {
  formatConversionRate,
  getConversionRateValue,
  getConversionRateColor,
  formatResponseTime,
  getResponseTimeValue,
  RESPONSE_TIME_THRESHOLDS,
  getResponseTimeStatus,
  getResponseTimeColor,
  getResponseTimeBgColor,
} from '@/lib/format-sales';

describe('formatConversionRate', () => {
  // AC#4: Shows "XX.X%" format
  it('formats rate as percentage with one decimal place', () => {
    expect(formatConversionRate(10, 30)).toBe('33.3%');
    expect(formatConversionRate(15, 50)).toBe('30.0%');
    expect(formatConversionRate(1, 3)).toBe('33.3%');
  });

  // AC#4: Shows "N/A" if claimed is 0
  it('returns N/A when claimed is 0', () => {
    expect(formatConversionRate(0, 0)).toBe('N/A');
    expect(formatConversionRate(10, 0)).toBe('N/A');
  });

  it('handles 100% conversion rate', () => {
    expect(formatConversionRate(10, 10)).toBe('100.0%');
  });

  it('handles 0% conversion rate', () => {
    expect(formatConversionRate(0, 10)).toBe('0.0%');
  });
});

describe('getConversionRateValue', () => {
  it('returns calculated rate as number', () => {
    expect(getConversionRateValue(10, 50)).toBe(20);
    expect(getConversionRateValue(15, 50)).toBe(30);
  });

  it('returns -1 when claimed is 0 (for sorting to bottom)', () => {
    expect(getConversionRateValue(0, 0)).toBe(-1);
    expect(getConversionRateValue(10, 0)).toBe(-1);
  });
});

describe('getConversionRateColor', () => {
  // AC#4: Green for >= 30%
  it('returns green class for rate >= 30%', () => {
    expect(getConversionRateColor(30)).toBe('text-green-600');
    expect(getConversionRateColor(50)).toBe('text-green-600');
    expect(getConversionRateColor(100)).toBe('text-green-600');
  });

  // AC#4: Amber/warning for < 10%
  it('returns amber class for rate < 10%', () => {
    expect(getConversionRateColor(9)).toBe('text-amber-600');
    expect(getConversionRateColor(5)).toBe('text-amber-600');
    expect(getConversionRateColor(0)).toBe('text-amber-600');
  });

  it('returns empty string for rates between 10-29%', () => {
    expect(getConversionRateColor(10)).toBe('');
    expect(getConversionRateColor(15)).toBe('');
    expect(getConversionRateColor(29)).toBe('');
  });

  it('returns muted class for N/A case (negative value)', () => {
    expect(getConversionRateColor(-1)).toBe('text-muted-foreground');
  });
});

describe('formatResponseTime', () => {
  // AC#5: < 60 minutes → "XX min"
  it('formats minutes under 60 as "XX min"', () => {
    expect(formatResponseTime(0)).toBe('0 min');
    expect(formatResponseTime(15)).toBe('15 min');
    expect(formatResponseTime(45)).toBe('45 min');
    expect(formatResponseTime(59)).toBe('59 min');
  });

  // AC#5: >= 60 minutes → "X.X hrs"
  it('formats 60-1439 minutes as "X.X hrs"', () => {
    expect(formatResponseTime(60)).toBe('1.0 hrs');
    expect(formatResponseTime(90)).toBe('1.5 hrs');
    expect(formatResponseTime(120)).toBe('2.0 hrs');
    expect(formatResponseTime(180)).toBe('3.0 hrs');
    expect(formatResponseTime(1439)).toBe('24.0 hrs');
  });

  // AC#5: >= 1440 minutes (24h) → "X.X days"
  it('formats 1440+ minutes as "X.X days"', () => {
    expect(formatResponseTime(1440)).toBe('1.0 days');
    expect(formatResponseTime(2160)).toBe('1.5 days');
    expect(formatResponseTime(2880)).toBe('2.0 days');
    expect(formatResponseTime(10080)).toBe('7.0 days');
  });

  // AC#5: null/undefined → "N/A"
  it('returns N/A for null, undefined, or negative values', () => {
    expect(formatResponseTime(null)).toBe('N/A');
    expect(formatResponseTime(undefined)).toBe('N/A');
    expect(formatResponseTime(-1)).toBe('N/A');
  });

  it('rounds minutes correctly', () => {
    expect(formatResponseTime(14.6)).toBe('15 min');
    expect(formatResponseTime(14.4)).toBe('14 min');
  });

  it('handles sub-minute values (rounds to 0)', () => {
    expect(formatResponseTime(0.4)).toBe('0 min');
    expect(formatResponseTime(0.5)).toBe('1 min');
    expect(formatResponseTime(0.1)).toBe('0 min');
  });
});

describe('getResponseTimeValue', () => {
  it('returns the minute value for sorting', () => {
    expect(getResponseTimeValue(30)).toBe(30);
    expect(getResponseTimeValue(120)).toBe(120);
  });

  it('returns MAX_SAFE_INTEGER for N/A cases (for sorting to bottom)', () => {
    expect(getResponseTimeValue(null)).toBe(Number.MAX_SAFE_INTEGER);
    expect(getResponseTimeValue(undefined)).toBe(Number.MAX_SAFE_INTEGER);
    expect(getResponseTimeValue(-1)).toBe(Number.MAX_SAFE_INTEGER);
  });
});

/**
 * Story 3.4: Response Time Analytics Tests
 * AC#3, AC#4, AC#6, AC#7
 */
describe('RESPONSE_TIME_THRESHOLDS', () => {
  it('has correct threshold values', () => {
    expect(RESPONSE_TIME_THRESHOLDS.FAST).toBe(30);
    expect(RESPONSE_TIME_THRESHOLDS.ACCEPTABLE).toBe(60);
  });
});

describe('getResponseTimeStatus', () => {
  // AC#3, AC#4: Green for < 30 min (fast)
  it('returns fast for times < 30 minutes', () => {
    expect(getResponseTimeStatus(0)).toBe('fast');
    expect(getResponseTimeStatus(15)).toBe('fast');
    expect(getResponseTimeStatus(29)).toBe('fast');
    expect(getResponseTimeStatus(29.9)).toBe('fast');
  });

  // AC#3, AC#4: Amber for 30-60 min (acceptable)
  it('returns acceptable for times 30-60 minutes', () => {
    expect(getResponseTimeStatus(30)).toBe('acceptable');
    expect(getResponseTimeStatus(45)).toBe('acceptable');
    expect(getResponseTimeStatus(60)).toBe('acceptable'); // exactly 60 is acceptable, NOT slow
  });

  // AC#3, AC#4, AC#6: Red for > 60 min (slow)
  it('returns slow for times > 60 minutes', () => {
    expect(getResponseTimeStatus(61)).toBe('slow');
    expect(getResponseTimeStatus(90)).toBe('slow');
    expect(getResponseTimeStatus(120)).toBe('slow');
    expect(getResponseTimeStatus(1440)).toBe('slow');
  });

  // AC#6: Exactly 60 is acceptable, NOT slow
  it('treats exactly 60 minutes as acceptable, not slow', () => {
    expect(getResponseTimeStatus(60)).toBe('acceptable');
    expect(getResponseTimeStatus(60)).not.toBe('slow');
  });

  it('returns null for null, undefined, or negative values', () => {
    expect(getResponseTimeStatus(null)).toBeNull();
    expect(getResponseTimeStatus(undefined)).toBeNull();
    expect(getResponseTimeStatus(-1)).toBeNull();
  });
});

describe('getResponseTimeColor', () => {
  // AC#3, AC#4: Text colors for each status
  it('returns green text class for fast status', () => {
    expect(getResponseTimeColor('fast')).toBe('text-green-600');
  });

  it('returns amber text class for acceptable status', () => {
    expect(getResponseTimeColor('acceptable')).toBe('text-amber-600');
  });

  it('returns red text class for slow status', () => {
    expect(getResponseTimeColor('slow')).toBe('text-red-600');
  });

  it('returns muted class for null status', () => {
    expect(getResponseTimeColor(null)).toBe('text-muted-foreground');
  });
});

describe('getResponseTimeBgColor', () => {
  // AC#4: Background colors for indicator dots
  it('returns green bg class for fast status', () => {
    expect(getResponseTimeBgColor('fast')).toBe('bg-green-500');
  });

  it('returns amber bg class for acceptable status', () => {
    expect(getResponseTimeBgColor('acceptable')).toBe('bg-amber-500');
  });

  it('returns red bg class for slow status', () => {
    expect(getResponseTimeBgColor('slow')).toBe('bg-red-500');
  });

  it('returns muted bg class for null status', () => {
    expect(getResponseTimeBgColor(null)).toBe('bg-muted');
  });
});
