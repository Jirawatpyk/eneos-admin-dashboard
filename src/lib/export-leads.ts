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
 * AC#3, AC#4: Columns included in export
 * Company, Contact Name, Email, Phone, Status, Sales Owner, Campaign, Created Date, Industry,
 * Lead Source, Job Title, City (Tech Debt: Additional columns for export)
 */
export const LEAD_EXPORT_COLUMNS = [
  { key: 'company', header: 'Company' },
  { key: 'customerName', header: 'Contact Name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'status', header: 'Status' },
  { key: 'salesOwnerName', header: 'Sales Owner' },
  { key: 'campaignName', header: 'Campaign' },
  { key: 'createdAt', header: 'Created Date' },
  { key: 'industryAI', header: 'Industry' },
  { key: 'leadSource', header: 'Lead Source' },
  { key: 'jobTitle', header: 'Job Title' },
  { key: 'city', header: 'City' },
] as const;

/**
 * Column widths for Excel export (character width)
 * Note: Export headers use full names for clarity outside the app
 */
const EXCEL_COLUMN_WIDTHS = [
  { wch: 25 }, // Company
  { wch: 20 }, // Contact Name (full name for export)
  { wch: 30 }, // Email
  { wch: 15 }, // Phone
  { wch: 12 }, // Status
  { wch: 18 }, // Sales Owner
  { wch: 25 }, // Campaign
  { wch: 15 }, // Created Date (full name for export)
  { wch: 20 }, // Industry
  { wch: 15 }, // Lead Source
  { wch: 25 }, // Job Title
  { wch: 15 }, // City
];

// ===========================================
// Helper Functions
// ===========================================

/**
 * Format lead data for export
 * Converts raw lead data to formatted strings for export
 *
 * @param lead - Lead data to format
 * @returns Record of formatted values keyed by column key
 */
function formatLeadForExport(lead: Lead): Record<string, string> {
  return {
    company: lead.company || '-',
    customerName: lead.customerName || '-',
    email: lead.email || '-',
    phone: formatThaiPhone(lead.phone),
    status: LEAD_STATUS_LABELS[lead.status as LeadStatus] || lead.status,
    salesOwnerName: lead.salesOwnerName || 'Unassigned',
    campaignName: lead.campaignName || '-',
    createdAt: formatLeadDate(lead.createdAt),
    industryAI: lead.industryAI || '-',
    leadSource: lead.leadSource || '-',
    jobTitle: lead.jobTitle || '-',
    city: lead.city || '-',
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

  // Set column widths for better readability
  ws['!cols'] = EXCEL_COLUMN_WIDTHS;

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
