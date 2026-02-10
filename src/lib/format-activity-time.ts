/**
 * Activity Time Formatting Utility
 * Story 2.5: Recent Activity Feed - AC#4
 *
 * Formats timestamps for activity feed:
 * - Recent (within 24h): relative time (e.g., "2 minutes ago")
 * - Older: date format (e.g., "Jan 12, 10:30 AM")
 */
import { formatDistanceToNow } from 'date-fns';

const TIMEZONE = 'Asia/Bangkok';

/**
 * Formats activity timestamp based on age
 * Uses fixed Bangkok timezone to prevent SSR/Client hydration mismatch.
 * @param timestamp - ISO date string
 * @returns Formatted time string, or fallback for invalid dates
 */
export function formatActivityTime(timestamp: string): string {
  const date = new Date(timestamp);

  // Validate date before processing
  if (isNaN(date.getTime())) {
    return 'Unknown time';
  }

  // Check if within last 24 hours
  const now = Date.now();
  const diff = now - date.getTime();
  const isRecent = diff >= 0 && diff < 24 * 60 * 60 * 1000;

  if (isRecent) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  // Older than 24 hours - show date format with fixed timezone
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: TIMEZONE,
  }).format(date);
}
