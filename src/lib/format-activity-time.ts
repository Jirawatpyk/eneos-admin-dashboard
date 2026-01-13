/**
 * Activity Time Formatting Utility
 * Story 2.5: Recent Activity Feed - AC#4
 *
 * Formats timestamps for activity feed:
 * - Recent (within 24h): relative time (e.g., "2 minutes ago")
 * - Older: date format (e.g., "Jan 12, 10:30 AM")
 */
import { formatDistanceToNow, format, isWithinInterval, subHours, isValid } from 'date-fns';

/**
 * Formats activity timestamp based on age
 * @param timestamp - ISO date string
 * @returns Formatted time string, or fallback for invalid dates
 */
export function formatActivityTime(timestamp: string): string {
  const date = new Date(timestamp);

  // H-01 Fix: Validate date before processing
  if (!isValid(date)) {
    return 'Unknown time';
  }

  // Check if within last 24 hours
  const isRecent = isWithinInterval(date, {
    start: subHours(new Date(), 24),
    end: new Date(),
  });

  if (isRecent) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  // Older than 24 hours - show date format
  return format(date, 'MMM d, h:mm a');
}
