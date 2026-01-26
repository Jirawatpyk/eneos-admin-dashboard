/**
 * Lead Export Utilities
 * Story 4.10: Quick Export
 *
 * AC#3: Excel Export Content
 * AC#4: CSV Export Content
 *
 * Provides utilities for exporting lead data to Excel and CSV formats.
 */
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { formatThaiPhone, formatLeadDate } from '@/lib/format-lead';
import { LEAD_STATUS_LABELS } from '@/lib/leads-constants';
import type { Lead, LeadStatus } from '@/types/lead';

// ===========================================
// Export Column Configuration
// ===========================================

/**
 * Export columns configuration
 * AC#3, AC#4: Columns included in export (Task 9: Enhanced with grounding fields)
 * Company, DBD Sector, Industry, Juristic ID, Capital, Location, Contact Name, Phone, Email,
 * Job Title, Website, Lead Source, Status, Sales Owner, Campaign, Created Date
 *
 * Type-safe: 'key' constrained to keyof Lead to prevent runtime errors
 * Includes column widths for Excel export (single source of truth)
 */
export const LEAD_EXPORT_COLUMNS: ReadonlyArray<{
  key: keyof Lead;
  header: string;
  width: number; // Excel column width in characters
}> = [
  { key: 'company', header: 'Company', width: 25 },
  { key: 'dbdSector', header: 'DBD Sector', width: 15 },
  { key: 'industryAI', header: 'Industry', width: 20 },
  { key: 'juristicId', header: 'Juristic ID', width: 18 },
  { key: 'capital', header: 'Capital', width: 15 },
  { key: 'province', header: 'Location', width: 20 },
  { key: 'customerName', header: 'Contact Name', width: 20 },
  { key: 'phone', header: 'Phone', width: 15 },
  { key: 'email', header: 'Email', width: 30 },
  { key: 'jobTitle', header: 'Job Title', width: 25 },
  { key: 'website', header: 'Website', width: 30 },
  { key: 'leadSource', header: 'Lead Source', width: 15 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'salesOwnerName', header: 'Sales Owner', width: 18 },
  { key: 'campaignName', header: 'Campaign', width: 25 },
  { key: 'createdAt', header: 'Created Date', width: 15 },
];

// ===========================================
// Helper Functions
// ===========================================

/**
 * Type for formatted export record - ensures type safety for export keys
 * Uses Partial to allow only exporting subset of Lead fields
 */
type ExportRecord = Partial<Record<keyof Lead, string>>;

/**
 * Format lead data for export
 * Converts raw lead data to formatted strings for export
 * Task 9: Enhanced with grounding fields (DBD Sector, Juristic ID, Capital, Location, Website)
 *
 * @param lead - Lead data to format
 * @returns Typed record of formatted values keyed by column key
 */
function formatLeadForExport(lead: Lead): ExportRecord {
  return {
    company: lead.company || '-',
    dbdSector: lead.dbdSector || '-',
    industryAI: lead.industryAI || '-',
    juristicId: lead.juristicId || '-',
    capital: lead.capital || '-',
    province: lead.province || '-',
    customerName: lead.customerName || '-',
    phone: formatThaiPhone(lead.phone),
    email: lead.email || '-',
    jobTitle: lead.jobTitle || '-',
    website: lead.website || '-',
    leadSource: lead.leadSource || '-',
    status: LEAD_STATUS_LABELS[lead.status as LeadStatus] || lead.status,
    salesOwnerName: lead.salesOwnerName || 'Unassigned', // Human-readable default for unassigned leads
    campaignName: lead.campaignName || '-',
    createdAt: formatLeadDate(lead.createdAt),
  };
}

/**
 * Generate export filename with current date
 * AC#3, AC#4: File name follows pattern leads_export_{date}.{ext}
 *
 * @param extension - File extension (xlsx or csv)
 * @returns Filename string
 */
function generateFilename(extension: 'xlsx' | 'csv'): string {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  return `leads_export_${dateStr}.${extension}`;
}

/**
 * Escape CSV value if it contains special characters
 * Handles commas, quotes, and newlines
 *
 * @param value - Value to escape
 * @returns Escaped value
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ===========================================
// Export Functions
// ===========================================

/**
 * Export leads to Excel format
 * AC#3: Excel Export Content
 *
 * Features:
 * - Header row with column names
 * - All selected lead data formatted
 * - Column widths for readability
 * - Filename pattern: leads_export_{date}.xlsx
 *
 * @param leads - Array of leads to export
 */
export function exportLeadsToExcel(leads: Lead[]): void {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Build header row
  const headers = LEAD_EXPORT_COLUMNS.map((col) => col.header);

  // Build data rows
  const rows = leads.map((lead) => {
    const formatted = formatLeadForExport(lead);
    return LEAD_EXPORT_COLUMNS.map((col) => formatted[col.key] || '');
  });

  // Create worksheet from array of arrays
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths for better readability (derived from LEAD_EXPORT_COLUMNS)
  ws['!cols'] = LEAD_EXPORT_COLUMNS.map((col) => ({ wch: col.width }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');

  // Generate filename and trigger download
  const filename = generateFilename('xlsx');
  XLSX.writeFile(wb, filename);
}

/**
 * Export leads to CSV format with UTF-8 BOM
 * AC#4: CSV Export Content
 *
 * Features:
 * - Header row with column names
 * - Same data as Excel export
 * - UTF-8 encoding with BOM for Excel compatibility
 * - Filename pattern: leads_export_{date}.csv
 *
 * @param leads - Array of leads to export
 */
export function exportLeadsToCSV(leads: Lead[]): void {
  // Build header row
  const headers = LEAD_EXPORT_COLUMNS.map((col) => col.header);

  // Build data rows
  const rows = leads.map((lead) => {
    const formatted = formatLeadForExport(lead);
    return LEAD_EXPORT_COLUMNS.map((col) => escapeCSVValue(formatted[col.key] || ''));
  });

  // Join with commas and newlines
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Generate filename
  const filename = generateFilename('csv');

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
