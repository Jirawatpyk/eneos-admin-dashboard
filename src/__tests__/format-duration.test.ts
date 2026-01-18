/**
 * Format Duration Utility Tests
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#3: Performance Metrics - Format as "X hours Y minutes" or "X days"
 */
import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatDurationEn,
  formatDurationShort,
} from '@/lib/format-duration';

describe('formatDuration (Thai)', () => {
  it('returns "-" for 0', () => {
    expect(formatDuration(0)).toBe('-');
  });

  it('returns "-" for negative values', () => {
    expect(formatDuration(-10)).toBe('-');
    expect(formatDuration(-100)).toBe('-');
  });

  it('formats minutes only (< 60 min)', () => {
    expect(formatDuration(1)).toBe('1 นาที');
    expect(formatDuration(30)).toBe('30 นาที');
    expect(formatDuration(59)).toBe('59 นาที');
  });

  it('formats hours only (exact hours)', () => {
    expect(formatDuration(60)).toBe('1 ชั่วโมง');
    expect(formatDuration(120)).toBe('2 ชั่วโมง');
    expect(formatDuration(180)).toBe('3 ชั่วโมง');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1 ชั่วโมง 30 นาที');
    expect(formatDuration(150)).toBe('2 ชั่วโมง 30 นาที');
    expect(formatDuration(61)).toBe('1 ชั่วโมง 1 นาที');
  });

  it('formats days only (exact days)', () => {
    expect(formatDuration(1440)).toBe('1 วัน');
    expect(formatDuration(2880)).toBe('2 วัน');
  });

  it('formats days and hours', () => {
    expect(formatDuration(1500)).toBe('1 วัน 1 ชั่วโมง');
    expect(formatDuration(1560)).toBe('1 วัน 2 ชั่วโมง');
  });

  it('omits minutes when showing days (keeps it concise)', () => {
    // 1 day + 30 minutes = should not show minutes
    expect(formatDuration(1470)).toBe('1 วัน');
    // 1 day + 1 hour + 30 minutes = shows only days and hours
    expect(formatDuration(1530)).toBe('1 วัน 1 ชั่วโมง');
  });
});

describe('formatDurationEn (English)', () => {
  it('returns "-" for 0 or negative', () => {
    expect(formatDurationEn(0)).toBe('-');
    expect(formatDurationEn(-5)).toBe('-');
  });

  it('formats minutes with proper pluralization', () => {
    expect(formatDurationEn(1)).toBe('1 min');
    expect(formatDurationEn(30)).toBe('30 mins');
  });

  it('formats hours with proper pluralization', () => {
    expect(formatDurationEn(60)).toBe('1 hour');
    expect(formatDurationEn(120)).toBe('2 hours');
  });

  it('formats days with proper pluralization', () => {
    expect(formatDurationEn(1440)).toBe('1 day');
    expect(formatDurationEn(2880)).toBe('2 days');
  });

  it('formats combined hours and minutes', () => {
    expect(formatDurationEn(90)).toBe('1 hour 30 mins');
  });

  it('formats combined days and hours', () => {
    expect(formatDurationEn(1560)).toBe('1 day 2 hours');
  });
});

describe('formatDurationShort', () => {
  it('returns "-" for 0 or negative', () => {
    expect(formatDurationShort(0)).toBe('-');
    expect(formatDurationShort(-10)).toBe('-');
  });

  it('formats minutes as Xm', () => {
    expect(formatDurationShort(30)).toBe('30m');
    expect(formatDurationShort(59)).toBe('59m');
  });

  it('formats hours as Xh', () => {
    expect(formatDurationShort(60)).toBe('1h');
    expect(formatDurationShort(120)).toBe('2h');
  });

  it('formats hours and minutes as Xh Ym', () => {
    expect(formatDurationShort(90)).toBe('1h 30m');
    expect(formatDurationShort(150)).toBe('2h 30m');
  });

  it('formats days as Xd', () => {
    expect(formatDurationShort(1440)).toBe('1d');
    expect(formatDurationShort(2880)).toBe('2d');
  });

  it('formats days and hours as Xd Yh', () => {
    expect(formatDurationShort(1500)).toBe('1d 1h');
    expect(formatDurationShort(1560)).toBe('1d 2h');
  });
});
