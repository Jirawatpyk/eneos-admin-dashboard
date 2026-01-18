/**
 * Duration Formatting Utilities
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * Formats time durations in minutes to human-readable strings
 * AC#3: Performance Metrics Section - Format as "X hours Y minutes" or "X days"
 */

/**
 * Format duration in Thai
 * @param minutes - Duration in minutes
 * @returns Formatted string like "1 วัน 2 ชั่วโมง" or "-" for zero/negative
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '-';

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = Math.floor(minutes % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} วัน`);
  if (hours > 0) parts.push(`${hours} ชั่วโมง`);
  // Only show minutes if no days (to keep it concise)
  if (mins > 0 && days === 0) parts.push(`${mins} นาที`);

  return parts.length > 0 ? parts.join(' ') : '-';
}

/**
 * Format duration in English
 * @param minutes - Duration in minutes
 * @returns Formatted string like "1 day 2 hours" or "-" for zero/negative
 */
export function formatDurationEn(minutes: number): string {
  if (minutes <= 0) return '-';

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = Math.floor(minutes % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  // Only show minutes if no days
  if (mins > 0 && days === 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`);

  return parts.length > 0 ? parts.join(' ') : '-';
}

/**
 * Format duration as short form
 * @param minutes - Duration in minutes
 * @returns Short form like "2h 30m" or "1d" or "-" for zero/negative
 */
export function formatDurationShort(minutes: number): string {
  if (minutes <= 0) return '-';

  if (minutes < 60) return `${minutes}m`;
  if (minutes < 24 * 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(minutes / (24 * 60));
  const h = Math.floor((minutes % (24 * 60)) / 60);
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}
