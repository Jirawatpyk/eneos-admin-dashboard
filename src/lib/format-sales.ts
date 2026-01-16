/**
 * Sales Performance Formatting Utilities
 * Story 3.1: Sales Team Performance Table
 *
 * AC#4: Conversion Rate Formatting
 * AC#5: Response Time Formatting
 *
 * CRITICAL: All time values from backend are in MINUTES
 */

/**
 * Format conversion rate as percentage string
 * AC#4: Shows "XX.X%" format, "N/A" if claimed is 0
 *
 * @param closed - Number of closed leads
 * @param claimed - Number of claimed leads
 * @returns Formatted string like "32.5%" or "N/A"
 */
export function formatConversionRate(closed: number, claimed: number): string {
  if (claimed === 0) return 'N/A';
  const rate = (closed / claimed) * 100;
  return `${rate.toFixed(1)}%`;
}

/**
 * Get conversion rate as number for sorting/comparison
 * Returns -1 for N/A cases to sort them to bottom
 */
export function getConversionRateValue(closed: number, claimed: number): number {
  if (claimed === 0) return -1;
  return (closed / claimed) * 100;
}

/**
 * Get Tailwind CSS classes for conversion rate highlighting
 * AC#4: Green for >= 30%, Amber/warning for < 10%
 *
 * @param rate - Conversion rate as percentage (0-100)
 * @returns Tailwind CSS class string
 */
export function getConversionRateColor(rate: number): string {
  if (rate < 0) return 'text-muted-foreground'; // N/A case
  if (rate >= 30) return 'text-green-600';
  if (rate < 10) return 'text-amber-600';
  return '';
}

/**
 * Format response time from minutes to human-readable string
 * AC#5: Backend returns time in MINUTES
 *
 * - < 60 minutes → "XX min"
 * - >= 60 minutes → "X.X hrs"
 * - >= 1440 minutes (24h) → "X.X days"
 * - null/undefined → "N/A"
 *
 * @param minutes - Response time in minutes (from backend)
 * @returns Formatted string like "45 min", "2.5 hrs", "3.2 days", or "N/A"
 */
export function formatResponseTime(minutes: number | null | undefined): string {
  if (minutes == null || minutes < 0) return 'N/A';

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  if (minutes < 1440) {
    // Less than 24 hours
    return `${(minutes / 60).toFixed(1)} hrs`;
  }

  // 24 hours or more
  return `${(minutes / 1440).toFixed(1)} days`;
}

/**
 * Get response time value for sorting
 * Returns a high value for N/A cases to sort them to bottom
 */
export function getResponseTimeValue(minutes: number | null | undefined): number {
  if (minutes == null || minutes < 0) return Number.MAX_SAFE_INTEGER;
  return minutes;
}
