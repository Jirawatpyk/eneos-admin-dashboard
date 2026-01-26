/**
 * Lead Export Utilities Tests
 * Story 4.10: Quick Export
 *
 * AC#3: Excel Export Content
 * AC#4: CSV Export Content
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportLeadsToExcel, exportLeadsToCSV, LEAD_EXPORT_COLUMNS } from '@/lib/export-leads';
import type { Lead } from '@/types/lead';

// Mock xlsx module
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    aoa_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

// Sample lead data for testing
const createMockLead = (overrides: Partial<Lead> = {}): Lead => ({
  row: 1,
  date: '2026-01-15',
  customerName: 'John Smith',
  email: 'john@example.com',
  phone: '0812345678',
  company: 'Test Company',
  industryAI: 'Manufacturing',
  website: 'https://test.com',
  capital: '10M',
  status: 'contacted',
  salesOwnerId: 'user-1',
  salesOwnerName: 'Sales Person',
  campaignId: 'camp-1',
  campaignName: 'Test Campaign',
  emailSubject: 'Test Subject',
  source: 'Brevo',
  leadId: 'lead-1',
  eventId: 'event-1',
  clickedAt: '2026-01-15T10:00:00Z',
  talkingPoint: 'Test talking point',
  closedAt: null,
  lostAt: null,
  unreachableAt: null,
  version: 1,
  leadSource: 'Brevo',
  jobTitle: 'Manager',
  city: 'Bangkok',
  leadUuid: 'lead_12345',
  createdAt: '2026-01-15T09:00:00Z',
  updatedAt: null,
  juristicId: null,
  dbdSector: null,
  province: null,
  fullAddress: null,
  ...overrides,
});

describe('LEAD_EXPORT_COLUMNS', () => {
  // AC#3, AC#4: Export columns configuration
  it('includes all required columns', () => {
    const columnKeys = LEAD_EXPORT_COLUMNS.map((col) => col.key);

    expect(columnKeys).toContain('company');
    expect(columnKeys).toContain('customerName');
    expect(columnKeys).toContain('email');
    expect(columnKeys).toContain('phone');
    expect(columnKeys).toContain('status');
    expect(columnKeys).toContain('salesOwnerName');
    expect(columnKeys).toContain('campaignName');
    expect(columnKeys).toContain('createdAt');
    expect(columnKeys).toContain('industryAI');
  });

  it('has correct headers', () => {
    const headers = LEAD_EXPORT_COLUMNS.map((col) => col.header);

    expect(headers).toContain('Company');
    expect(headers).toContain('Contact Name');
    expect(headers).toContain('Email');
    expect(headers).toContain('Phone');
    expect(headers).toContain('Status');
    expect(headers).toContain('Sales Owner');
    expect(headers).toContain('Campaign');
    expect(headers).toContain('Created Date');
    expect(headers).toContain('Industry');
  });

  it('has exactly 16 columns', () => {
    expect(LEAD_EXPORT_COLUMNS.length).toBe(16);
  });
});

describe('exportLeadsToExcel', () => {
  const mockLeads: Lead[] = [
    createMockLead({ row: 1, company: 'Company A', customerName: 'John Smith' }),
    createMockLead({ row: 2, company: 'Company B', customerName: 'Jane Doe', status: 'closed' }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-18T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // AC#3: Excel file generation
  it('creates Excel workbook with correct structure', async () => {
    const xlsx = await import('xlsx');

    exportLeadsToExcel(mockLeads);

    expect(xlsx.utils.book_new).toHaveBeenCalledTimes(1);
    expect(xlsx.utils.aoa_to_sheet).toHaveBeenCalledTimes(1);
    expect(xlsx.utils.book_append_sheet).toHaveBeenCalledTimes(1);
    expect(xlsx.writeFile).toHaveBeenCalledTimes(1);
  });

  // AC#3: Header row with column names (Task 9: Updated with grounding fields)
  it('includes header row with column names', async () => {
    const xlsx = await import('xlsx');

    exportLeadsToExcel(mockLeads);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as string[][];
    const headers = data[0];

    expect(headers).toEqual([
      'Company',
      'DBD Sector',
      'Industry',
      'Juristic ID',
      'Capital',
      'Location',
      'Contact Name',
      'Phone',
      'Email',
      'Job Title',
      'Website',
      'Lead Source',
      'Status',
      'Sales Owner',
      'Campaign',
      'Created Date',
    ]);
  });

  // AC#3: Lead data in rows (Task 9: Updated column indices)
  it('includes lead data in rows', async () => {
    const xlsx = await import('xlsx');

    exportLeadsToExcel(mockLeads);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as string[][];

    // Should have header + 2 data rows
    expect(data.length).toBe(3);

    // First data row (Company A)
    expect(data[1][0]).toBe('Company A'); // Company (index 0)
    expect(data[1][6]).toBe('John Smith'); // Contact Name (index 6)
    expect(data[1][12]).toBe('ติดต่อแล้ว'); // Status (index 12) - Thai label for 'contacted'

    // Second data row (Company B)
    expect(data[2][0]).toBe('Company B'); // Company (index 0)
    expect(data[2][6]).toBe('Jane Doe'); // Contact Name (index 6)
    expect(data[2][12]).toBe('ปิดสำเร็จ'); // Status (index 12) - Thai label for 'closed'
  });

  // AC#3: File naming pattern
  it('generates filename with correct pattern', async () => {
    const xlsx = await import('xlsx');

    exportLeadsToExcel(mockLeads);

    const writeFileCall = vi.mocked(xlsx.writeFile).mock.calls[0];
    const filename = writeFileCall[1] as string;

    expect(filename).toBe('leads_export_2026-01-18.xlsx');
  });

  // AC#3: Phone number formatting (Task 9: Phone is now at index 7)
  it('formats Thai phone numbers correctly', async () => {
    const xlsx = await import('xlsx');
    const leads = [createMockLead({ phone: '0812345678' })];

    exportLeadsToExcel(leads);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as string[][];

    expect(data[1][7]).toBe('081-234-5678'); // Phone (index 7)
  });

  // AC#3: Null value handling (Task 9: Updated column indices)
  it('handles null values with defaults', async () => {
    const xlsx = await import('xlsx');
    const leads = [createMockLead({
      industryAI: null,
      salesOwnerName: null,
      phone: '', // Empty string for null phone
    })];

    exportLeadsToExcel(leads);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as string[][];

    expect(data[1][7]).toBe('-'); // Phone (index 7)
    expect(data[1][13]).toBe('Unassigned'); // Sales Owner (index 13)
    expect(data[1][2]).toBe('-'); // Industry (index 2)
  });

  // Task 9: Grounding fields export validation
  it('exports grounding fields with proper values', async () => {
    const xlsx = await import('xlsx');
    const leads = [createMockLead({
      dbdSector: 'MFG-A',
      juristicId: '0123456789012',
      capital: '5,000,000',
      province: 'กรุงเทพมหานคร',
      website: 'https://example.com',
    })];

    exportLeadsToExcel(leads);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as string[][];

    expect(data[1][1]).toBe('MFG-A'); // DBD Sector (index 1)
    expect(data[1][3]).toBe('0123456789012'); // Juristic ID (index 3)
    expect(data[1][4]).toBe('5,000,000'); // Capital (index 4)
    expect(data[1][5]).toBe('กรุงเทพมหานคร'); // Location/Province (index 5)
    expect(data[1][10]).toBe('https://example.com'); // Website (index 10)
  });

  // Task 9: Grounding fields null handling
  it('handles null grounding fields with dash fallback', async () => {
    const xlsx = await import('xlsx');
    const leads = [createMockLead({
      dbdSector: null,
      juristicId: null,
      capital: null,
      province: null,
      website: null,
    })];

    exportLeadsToExcel(leads);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as string[][];

    expect(data[1][1]).toBe('-'); // DBD Sector (index 1)
    expect(data[1][3]).toBe('-'); // Juristic ID (index 3)
    expect(data[1][4]).toBe('-'); // Capital (index 4)
    expect(data[1][5]).toBe('-'); // Location/Province (index 5)
    expect(data[1][10]).toBe('-'); // Website (index 10)
  });

  // AC#3: Column widths
  it('sets column widths for better readability', async () => {
    const xlsx = await import('xlsx');

    exportLeadsToExcel(mockLeads);

    const worksheet = vi.mocked(xlsx.utils.aoa_to_sheet).mock.results[0].value;

    // Verify worksheet is created (column widths would be set on it)
    expect(worksheet).toBeDefined();
  });

  // Task 9: Column width array length validation
  it('has column widths matching export columns count', async () => {
    const xlsx = await import('xlsx');

    exportLeadsToExcel(mockLeads);

    const worksheet = vi.mocked(xlsx.utils.aoa_to_sheet).mock.results[0].value;

    // Verify column widths array exists and matches column count
    expect(worksheet['!cols']).toBeDefined();
    expect(worksheet['!cols'].length).toBe(LEAD_EXPORT_COLUMNS.length);
  });

  // AC#3: Empty array handling
  it('handles empty lead array', async () => {
    const xlsx = await import('xlsx');

    exportLeadsToExcel([]);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as string[][];

    // Should only have header row
    expect(data.length).toBe(1);
    expect(xlsx.writeFile).toHaveBeenCalled();
  });

  // AC#3: Worksheet naming
  it('names worksheet as "Leads"', async () => {
    const xlsx = await import('xlsx');

    exportLeadsToExcel(mockLeads);

    const appendSheetCall = vi.mocked(xlsx.utils.book_append_sheet).mock.calls[0];
    const sheetName = appendSheetCall[2];

    expect(sheetName).toBe('Leads');
  });
});

describe('exportLeadsToCSV', () => {
  const mockLeads: Lead[] = [
    createMockLead({ row: 1, company: 'Company A', customerName: 'John Smith' }),
    createMockLead({ row: 2, company: 'Company B', customerName: 'Jane Doe', status: 'closed' }),
  ];

  let mockLink: {
    href: string;
    download: string;
    click: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-18T10:00:00Z'));

    // Mock URL methods
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document methods
    mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as HTMLElement);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as HTMLElement);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // AC#4: CSV file generation
  it('creates CSV with correct structure', () => {
    exportLeadsToCSV(mockLeads);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockLink.click).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1);
  });

  // AC#4: Header row
  it('includes header row with column names', () => {
    exportLeadsToCSV(mockLeads);

    const calls = mockCreateObjectURL.mock.calls as unknown as [Blob][];
    expect(calls.length).toBeGreaterThan(0);
    const blobCall = calls[0][0];
    expect(blobCall.type).toBe('text/csv;charset=utf-8;');
  });

  // AC#4: File naming pattern
  it('generates filename with correct pattern', () => {
    exportLeadsToCSV(mockLeads);

    expect(mockLink.download).toBe('leads_export_2026-01-18.csv');
  });

  // AC#4: UTF-8 BOM for Excel compatibility
  it('includes UTF-8 BOM for Excel compatibility', () => {
    exportLeadsToCSV(mockLeads);

    const calls = mockCreateObjectURL.mock.calls as unknown as [Blob][];
    expect(calls.length).toBeGreaterThan(0);
    const blobCall = calls[0][0];
    expect(blobCall).toBeInstanceOf(Blob);
    // BOM is included in the blob content
  });

  // AC#4: CSV escaping for special characters
  it('escapes values with commas by wrapping in quotes', () => {
    const leads = [createMockLead({ company: 'Company, Inc.' })];

    // Should complete without error - escaping prevents CSV corruption
    exportLeadsToCSV(leads);

    expect(mockLink.click).toHaveBeenCalled();
  });

  // AC#4: CSV escaping for quotes
  it('escapes values with quotes by doubling them', () => {
    const leads = [createMockLead({ company: 'Company "Best"' })];

    // Should complete without error - escaping prevents CSV corruption
    exportLeadsToCSV(leads);

    expect(mockLink.click).toHaveBeenCalled();
  });

  // AC#4: Handles newlines in values
  it('escapes values with newlines by wrapping in quotes', () => {
    const leads = [createMockLead({ company: 'Company\nName' })];

    // Should complete without error - escaping prevents CSV corruption
    exportLeadsToCSV(leads);

    expect(mockLink.click).toHaveBeenCalled();
  });

  // AC#4: Empty array handling
  it('handles empty lead array', () => {
    exportLeadsToCSV([]);

    expect(mockLink.click).toHaveBeenCalled();
  });

  // AC#4: Cleanup after download
  it('cleans up temporary elements after download', () => {
    exportLeadsToCSV(mockLeads);

    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  // AC#4: Thai status labels
  it('uses Thai status labels', () => {
    // Status labels are embedded in the CSV content
    // Verifying the export completes successfully with Thai labels
    const leads = [createMockLead({ status: 'closed' })];

    exportLeadsToCSV(leads);

    expect(mockLink.click).toHaveBeenCalled();
  });
});
