/**
 * Export Utilities
 * Story 3.8: Export Individual Performance Report
 *
 * AC#3: Excel Export Content
 * AC#5: Period-Based Export
 *
 * Provides utilities for exporting sales performance data to Excel format.
 */
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { SalesPersonMetrics } from '@/types/sales';
import { formatResponseTime } from '@/lib/format-sales';
import type { SalesPeriod } from '@/components/sales/sales-period-filter';

/**
 * Export period information for including in exported reports
 * Used to display the date range and period type in exports
 */
export interface ExportPeriodInfo {
  /** The selected period type (week, month, quarter, lastQuarter, custom) */
  period: SalesPeriod;
  /** Start date of the period range */
  from: Date;
  /** End date of the period range */
  to: Date;
}

/**
 * Target comparison data (optional)
 */
export interface ExportTargetData {
  closed: number;
  progress: number; // percentage
  status: 'above' | 'on' | 'below';
}

/**
 * Get human-readable label for period
 * AC#5: Period information in export
 */
export function getPeriodLabel(period: SalesPeriod): string {
  switch (period) {
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'quarter':
      return 'This Quarter';
    case 'lastQuarter':
      return 'Last Quarter';
    case 'custom':
      return 'Custom Range';
    default:
      return period;
  }
}

/**
 * Sanitize filename by removing filesystem-invalid characters
 * Keeps Thai/Unicode characters, only removes: \ / : * ? " < > |
 * Truncates to max 50 characters per Dev Notes
 *
 * @param name - Original name (may contain Thai/Unicode)
 * @returns Safe filename string
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '_') // Remove filesystem-invalid chars only
    .slice(0, 50); // Truncate to max 50 chars
}

/**
 * Export individual sales person performance to Excel
 * AC#3: Excel Export Content - contains name, metrics, period info
 * AC#5: Period-Based Export - includes period label and date range
 *
 * @param data - Sales person metrics
 * @param periodInfo - Period information (period type, from, to dates)
 * @param target - Optional target comparison data
 */
export async function exportIndividualToExcel(
  data: SalesPersonMetrics,
  periodInfo: ExportPeriodInfo,
  target?: ExportTargetData
): Promise<void> {
  const { period, from, to } = periodInfo;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Build summary data rows (with null guards per Dev Notes)
  const summaryData: (string | number)[][] = [
    ['Individual Performance Report'],
    [],
    ['Name', data.name],
    ['Email', data.email],
    ['Period', getPeriodLabel(period)],
    [
      'Date Range',
      `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`,
    ],
    ['Generated', format(new Date(), 'MMM d, yyyy HH:mm')],
    [],
    ['Performance Metrics'],
    ['Claimed Leads', data.claimed ?? 0],
    ['Contacted', data.contacted ?? 0],
    ['Closed Deals', data.closed ?? 0],
    ['Lost', data.lost ?? 0],
    ['Unreachable', data.unreachable ?? 0],
    [
      'Conversion Rate',
      data.claimed > 0
        ? `${((data.conversionRate ?? 0)).toFixed(1)}%`
        : 'N/A',
    ],
    ['Avg Response Time', formatResponseTime(data.avgResponseTime ?? 0)],
  ];

  // Add target comparison if available (AC#3)
  if (target) {
    summaryData.push([]);
    summaryData.push(['Target Comparison']);
    summaryData.push(['Target (Closed)', target.closed]);
    summaryData.push(['Progress', `${target.progress.toFixed(1)}%`]);
    summaryData.push([
      'Status',
      target.status === 'above'
        ? 'Above Target'
        : target.status === 'on'
          ? 'On Target'
          : 'Below Target',
    ]);
  }

  // Create worksheet from array
  const ws = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths for better readability
  ws['!cols'] = [{ wch: 20 }, { wch: 35 }];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Performance');

  // Generate filename (keep Thai chars, remove only invalid chars, truncate)
  const safeName = sanitizeFilename(data.name);
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const filename = `${safeName}_performance_${dateStr}.xlsx`;

  // Trigger download
  XLSX.writeFile(wb, filename);
}
