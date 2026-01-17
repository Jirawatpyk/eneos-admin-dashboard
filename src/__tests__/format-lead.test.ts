/**
 * Lead Formatting Tests
 * Story 4.1: Lead List Table
 *
 * Tests for AC#3: Phone and date formatting
 */
import { describe, it, expect } from 'vitest';
import {
  formatThaiPhone,
  formatLeadDate,
  formatLeadDateTime,
  truncateText,
} from '@/lib/format-lead';

describe('formatThaiPhone', () => {
  // AC#3: Phone shows formatted Thai phone number
  it('formats 10-digit mobile number as XXX-XXX-XXXX', () => {
    expect(formatThaiPhone('0812345678')).toBe('081-234-5678');
  });

  it('formats 9-digit landline number as XX-XXX-XXXX', () => {
    expect(formatThaiPhone('021234567')).toBe('02-123-4567');
  });

  it('removes non-digit characters before formatting', () => {
    expect(formatThaiPhone('081-234-5678')).toBe('081-234-5678');
    expect(formatThaiPhone('081 234 5678')).toBe('081-234-5678');
  });

  it('returns original for international format', () => {
    // 11+ digits are returned as-is since they don't match Thai format
    expect(formatThaiPhone('+66812345678')).toBe('+66812345678');
  });

  it('returns dash for null input', () => {
    expect(formatThaiPhone(null)).toBe('-');
  });

  it('returns original for non-standard lengths', () => {
    expect(formatThaiPhone('1234567')).toBe('1234567');
    expect(formatThaiPhone('12345678901')).toBe('12345678901');
  });

  it('returns dash for empty string', () => {
    expect(formatThaiPhone('')).toBe('-');
  });
});

describe('formatLeadDate', () => {
  // AC#3: Created Date shows formatted date (DD MMM YYYY)
  it('formats ISO date string as "DD MMM YYYY"', () => {
    expect(formatLeadDate('2026-01-15T10:30:00Z')).toBe('15 Jan 2026');
  });

  it('handles different months', () => {
    expect(formatLeadDate('2026-06-20T00:00:00Z')).toBe('20 Jun 2026');
    expect(formatLeadDate('2026-12-01T00:00:00Z')).toBe('01 Dec 2026');
  });

  it('returns dash for null input', () => {
    expect(formatLeadDate(null)).toBe('-');
  });

  it('handles invalid date gracefully', () => {
    expect(formatLeadDate('invalid-date')).toBe('invalid-date');
  });
});

describe('formatLeadDateTime', () => {
  // AC#5: Detail sheet shows full datetime
  it('formats ISO date string as "DD MMM YYYY HH:mm"', () => {
    expect(formatLeadDateTime('2026-01-15T10:30:00Z')).toMatch(/15 Jan 2026/);
  });

  it('returns dash for null input', () => {
    expect(formatLeadDateTime(null)).toBe('-');
  });

  it('handles invalid date gracefully', () => {
    expect(formatLeadDateTime('invalid-date')).toBe('invalid-date');
  });
});

describe('truncateText', () => {
  it('returns text unchanged if shorter than maxLength', () => {
    expect(truncateText('short', 10)).toBe('short');
  });

  it('truncates with ellipsis if longer than maxLength', () => {
    expect(truncateText('this is a long text', 10)).toBe('this is a ...');
  });

  it('returns dash for null input', () => {
    expect(truncateText(null, 10)).toBe('-');
  });

  it('handles exact length match', () => {
    expect(truncateText('exact', 5)).toBe('exact');
  });
});
