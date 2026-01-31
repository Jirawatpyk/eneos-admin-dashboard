/**
 * Report Date Utilities
 * Story 6.3: Quick Reports - Task 6
 *
 * Date range calculations for report presets (Daily, Weekly, Monthly).
 * Uses date-fns for calculations and react-day-picker DateRange for type compatibility.
 */
import { startOfDay, endOfDay, startOfWeek, startOfMonth, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export type ReportType = 'daily' | 'weekly' | 'monthly';

/**
 * Returns DateRange compatible with ExportParams.dateRange (from react-day-picker)
 */
export function getReportDateRange(type: ReportType): DateRange {
  const now = new Date();
  switch (type) {
    case 'daily':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'weekly':
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now }; // Monday start
    case 'monthly':
      return { from: startOfMonth(now), to: now };
  }
}

/**
 * Human-readable date label for report card display
 */
export function formatReportDateLabel(type: ReportType): string {
  const { from, to } = getReportDateRange(type);
  if (!from) return '--';
  switch (type) {
    case 'daily':
      return format(from, 'MMM d, yyyy');
    case 'weekly':
      return `${format(from, 'MMM d')} - ${format(to ?? from, 'MMM d, yyyy')}`;
    case 'monthly':
      return format(from, 'MMMM yyyy');
  }
}
