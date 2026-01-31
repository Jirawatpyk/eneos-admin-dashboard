/**
 * Campaign Export Utilities
 * Story 5.9: Campaign Export
 *
 * AC#5: Export Columns
 *
 * Provides utilities for exporting campaign data to Excel and CSV formats.
 */
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { CampaignStatsItem } from '@/types/campaigns';

// ===========================================
// Export Column Configuration
// ===========================================

/**
 * Export columns configuration
 *
 * AC#5: Columns included in export:
 * Campaign ID, Campaign Name, Delivered, Opened, Clicked, Unique Opens,
 * Unique Clicks, Open Rate (%), Click Rate (%), First Event, Last Updated
 *
 * @constant
 * @type {ReadonlyArray<{key: keyof CampaignStatsItem, header: string, width: number, format?: Function}>}
 */
export const CAMPAIGN_EXPORT_COLUMNS: ReadonlyArray<{
  key: keyof CampaignStatsItem;
  header: string;
  width: number;
  format?: (value: unknown) => string | number;
}> = [
  { key: 'campaignId', header: 'Campaign ID', width: 15 },
  { key: 'campaignName', header: 'Campaign Name', width: 35 },
  { key: 'delivered', header: 'Delivered', width: 12 },
  { key: 'opened', header: 'Opened', width: 12 },
  { key: 'clicked', header: 'Clicked', width: 12 },
  { key: 'uniqueOpens', header: 'Unique Opens', width: 14 },
  { key: 'uniqueClicks', header: 'Unique Clicks', width: 14 },
  {
    key: 'openRate',
    header: 'Open Rate (%)',
    width: 14,
    format: (v) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '0%'),
  },
  {
    key: 'clickRate',
    header: 'Click Rate (%)',
    width: 14,
    format: (v) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '0%'),
  },
  {
    key: 'firstEvent',
    header: 'First Event',
    width: 18,
    format: (v) => {
      if (!v) return '';
      const date = new Date(v as string);
      return isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd HH:mm');
    },
  },
  {
    key: 'lastUpdated',
    header: 'Last Updated',
    width: 18,
    format: (v) => {
      if (!v) return '';
      const date = new Date(v as string);
      return isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd HH:mm');
    },
  },
];

// ===========================================
// Helper Functions
// ===========================================

/**
 * Type for formatted export record
 */
type CampaignExportRecord = Partial<Record<keyof CampaignStatsItem, string | number>>;

/**
 * Format campaign data for export
 * @param campaign - Campaign data to format
 * @returns Typed record of formatted values
 */
function formatCampaignForExport(campaign: CampaignStatsItem): CampaignExportRecord {
  const result: CampaignExportRecord = {};

  for (const col of CAMPAIGN_EXPORT_COLUMNS) {
    const value = campaign[col.key];
    result[col.key] = col.format ? col.format(value) : (value ?? '');
  }

  return result;
}

/**
 * Generate export filename with optional date range
 * AC#3: Filename includes date range when filter is applied
 * AC#4: Filename for all campaigns includes today's date
 *
 * @param extension - File extension (xlsx or csv)
 * @param dateFrom - Optional start date filter
 * @param dateTo - Optional end date filter
 * @returns Filename string
 */
function generateFilename(
  extension: 'xlsx' | 'csv',
  dateFrom?: string,
  dateTo?: string
): string {
  const today = format(new Date(), 'yyyy-MM-dd');

  if (dateFrom && dateTo) {
    const from = format(new Date(dateFrom), 'yyyy-MM-dd');
    const to = format(new Date(dateTo), 'yyyy-MM-dd');
    return `campaigns_export_${from}_${to}.${extension}`;
  }

  return `campaigns_export_all_${today}.${extension}`;
}

/**
 * Escape CSV value if it contains special characters
 * @param value - Value to escape
 * @returns Escaped value
 */
function escapeCSVValue(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ===========================================
// Export Functions
// ===========================================

/**
 * Export campaigns to Excel format
 * AC#5: Excel Export Content with proper column formatting
 *
 * @param campaigns - Array of campaigns to export
 * @param dateFrom - Optional start date filter (for filename)
 * @param dateTo - Optional end date filter (for filename)
 */
export function exportCampaignsToExcel(
  campaigns: CampaignStatsItem[],
  dateFrom?: string,
  dateTo?: string
): void {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Build header row
  const headers = CAMPAIGN_EXPORT_COLUMNS.map((col) => col.header);

  // Build data rows
  const rows = campaigns.map((campaign) => {
    const formatted = formatCampaignForExport(campaign);
    return CAMPAIGN_EXPORT_COLUMNS.map((col) => formatted[col.key] ?? '');
  });

  // Create worksheet from array of arrays
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths for better readability
  ws['!cols'] = CAMPAIGN_EXPORT_COLUMNS.map((col) => ({ wch: col.width }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Campaigns');

  // Generate filename and trigger download
  const filename = generateFilename('xlsx', dateFrom, dateTo);
  XLSX.writeFile(wb, filename);
}

/**
 * Export campaigns to CSV format with UTF-8 BOM
 * AC#5: CSV Export Content with proper formatting
 *
 * @param campaigns - Array of campaigns to export
 * @param dateFrom - Optional start date filter (for filename)
 * @param dateTo - Optional end date filter (for filename)
 */
export function exportCampaignsToCSV(
  campaigns: CampaignStatsItem[],
  dateFrom?: string,
  dateTo?: string
): void {
  // Build header row
  const headers = CAMPAIGN_EXPORT_COLUMNS.map((col) => col.header);

  // Build data rows
  const rows = campaigns.map((campaign) => {
    const formatted = formatCampaignForExport(campaign);
    return CAMPAIGN_EXPORT_COLUMNS.map((col) => escapeCSVValue(formatted[col.key] ?? ''));
  });

  // Escape headers in case they contain special characters
  const escapedHeaders = headers.map((h) => escapeCSVValue(h));

  // Join with commas and newlines
  const csvContent = [escapedHeaders.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Generate filename
  const filename = generateFilename('csv', dateFrom, dateTo);

  // Trigger download via temporary link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
