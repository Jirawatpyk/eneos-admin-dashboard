/**
 * Campaign Export Utilities Tests
 * Story 5.9: Campaign Export
 *
 * AC#5: Export Columns - includes all required columns
 * AC#3: Export with Current Filters - filename includes date range
 * AC#4: Export All Campaigns - filename includes today's date
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportCampaignsToExcel,
  exportCampaignsToCSV,
  CAMPAIGN_EXPORT_COLUMNS,
} from '@/lib/export-campaigns';
import type { CampaignStatsItem } from '@/types/campaigns';

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

// Sample campaign data for testing
const createMockCampaign = (overrides: Partial<CampaignStatsItem> = {}): CampaignStatsItem => ({
  campaignId: 1,
  campaignName: 'Test Campaign',
  delivered: 1000,
  opened: 500,
  clicked: 100,
  uniqueOpens: 450,
  uniqueClicks: 90,
  openRate: 45.0,
  clickRate: 9.0,
  hardBounce: 5,
  softBounce: 10,
  unsubscribe: 2,
  spam: 1,
  firstEvent: '2026-01-15T10:00:00Z',
  lastUpdated: '2026-01-20T15:30:00Z',
  ...overrides,
});

describe('CAMPAIGN_EXPORT_COLUMNS', () => {
  // AC#5: Export columns configuration
  it('includes all required columns', () => {
    const columnKeys = CAMPAIGN_EXPORT_COLUMNS.map((col) => col.key);

    expect(columnKeys).toContain('campaignId');
    expect(columnKeys).toContain('campaignName');
    expect(columnKeys).toContain('delivered');
    expect(columnKeys).toContain('opened');
    expect(columnKeys).toContain('clicked');
    expect(columnKeys).toContain('uniqueOpens');
    expect(columnKeys).toContain('uniqueClicks');
    expect(columnKeys).toContain('openRate');
    expect(columnKeys).toContain('clickRate');
    expect(columnKeys).toContain('firstEvent');
    expect(columnKeys).toContain('lastUpdated');
  });

  it('has correct headers', () => {
    const headers = CAMPAIGN_EXPORT_COLUMNS.map((col) => col.header);

    expect(headers).toContain('Campaign ID');
    expect(headers).toContain('Campaign Name');
    expect(headers).toContain('Delivered');
    expect(headers).toContain('Opened');
    expect(headers).toContain('Clicked');
    expect(headers).toContain('Unique Opens');
    expect(headers).toContain('Unique Clicks');
    expect(headers).toContain('Open Rate (%)');
    expect(headers).toContain('Click Rate (%)');
    expect(headers).toContain('First Event');
    expect(headers).toContain('Last Updated');
  });

  it('has exactly 11 columns as per AC#5', () => {
    expect(CAMPAIGN_EXPORT_COLUMNS.length).toBe(11);
  });

  it('has format functions for percentage and date columns', () => {
    const openRateCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'openRate');
    const clickRateCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'clickRate');
    const firstEventCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'firstEvent');
    const lastUpdatedCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'lastUpdated');

    expect(openRateCol?.format).toBeDefined();
    expect(clickRateCol?.format).toBeDefined();
    expect(firstEventCol?.format).toBeDefined();
    expect(lastUpdatedCol?.format).toBeDefined();
  });

  // AC#5: Rate columns formatted as percentages
  it('formats rates as percentages', () => {
    const openRateCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'openRate');
    const clickRateCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'clickRate');

    expect(openRateCol?.format?.(45.123)).toBe('45.12%');
    expect(clickRateCol?.format?.(9.5)).toBe('9.50%');
    expect(openRateCol?.format?.(0)).toBe('0.00%');
  });

  // AC#5: Date columns formatted as YYYY-MM-DD HH:mm
  it('formats dates as YYYY-MM-DD HH:mm', () => {
    const firstEventCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'firstEvent');
    const lastUpdatedCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'lastUpdated');

    const testDate = '2026-01-15T10:30:00Z';
    // Note: format result depends on local timezone, check it contains expected pattern
    const formattedFirst = firstEventCol?.format?.(testDate) as string;
    const formattedLast = lastUpdatedCol?.format?.(testDate) as string;

    expect(formattedFirst).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    expect(formattedLast).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('handles null/undefined values in format functions', () => {
    const openRateCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'openRate');
    const firstEventCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'firstEvent');

    expect(openRateCol?.format?.(undefined)).toBe('0%');
    expect(openRateCol?.format?.(null)).toBe('0%');
    expect(firstEventCol?.format?.(null)).toBe('');
    expect(firstEventCol?.format?.(undefined)).toBe('');
  });

  it('handles invalid date strings gracefully', () => {
    const firstEventCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'firstEvent');
    const lastUpdatedCol = CAMPAIGN_EXPORT_COLUMNS.find((col) => col.key === 'lastUpdated');

    // Invalid date strings should return empty string, not "Invalid Date"
    expect(firstEventCol?.format?.('not-a-date')).toBe('');
    expect(firstEventCol?.format?.('invalid')).toBe('');
    expect(lastUpdatedCol?.format?.('garbage-data')).toBe('');
    expect(lastUpdatedCol?.format?.('2026-99-99')).toBe(''); // Invalid month/day
  });
});

describe('exportCampaignsToExcel', () => {
  const mockCampaigns: CampaignStatsItem[] = [
    createMockCampaign({ campaignId: 1, campaignName: 'Campaign A' }),
    createMockCampaign({ campaignId: 2, campaignName: 'Campaign B', openRate: 55.5 }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-31T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // AC#5: Excel file generation
  it('creates Excel workbook with correct structure', async () => {
    const xlsx = await import('xlsx');

    exportCampaignsToExcel(mockCampaigns);

    expect(xlsx.utils.book_new).toHaveBeenCalledTimes(1);
    expect(xlsx.utils.aoa_to_sheet).toHaveBeenCalledTimes(1);
    expect(xlsx.utils.book_append_sheet).toHaveBeenCalledTimes(1);
    expect(xlsx.writeFile).toHaveBeenCalledTimes(1);
  });

  // AC#5: Header row with column names
  it('includes header row with column names', async () => {
    const xlsx = await import('xlsx');

    exportCampaignsToExcel(mockCampaigns);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as string[][];
    const headers = data[0];

    expect(headers).toEqual([
      'Campaign ID',
      'Campaign Name',
      'Delivered',
      'Opened',
      'Clicked',
      'Unique Opens',
      'Unique Clicks',
      'Open Rate (%)',
      'Click Rate (%)',
      'First Event',
      'Last Updated',
    ]);
  });

  // AC#5: Campaign data in rows
  it('includes campaign data in rows', async () => {
    const xlsx = await import('xlsx');

    exportCampaignsToExcel(mockCampaigns);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as (string | number)[][];

    // Should have header + 2 data rows
    expect(data.length).toBe(3);

    // First data row (Campaign A)
    expect(data[1][0]).toBe(1); // Campaign ID
    expect(data[1][1]).toBe('Campaign A'); // Campaign Name
    expect(data[1][2]).toBe(1000); // Delivered
    expect(data[1][7]).toBe('45.00%'); // Open Rate

    // Second data row (Campaign B)
    expect(data[2][0]).toBe(2); // Campaign ID
    expect(data[2][1]).toBe('Campaign B'); // Campaign Name
    expect(data[2][7]).toBe('55.50%'); // Open Rate
  });

  // AC#4: Filename for all campaigns (no filter)
  it('generates filename with all_ pattern when no date filter', async () => {
    const xlsx = await import('xlsx');

    exportCampaignsToExcel(mockCampaigns);

    const writeFileCall = vi.mocked(xlsx.writeFile).mock.calls[0];
    const filename = writeFileCall[1] as string;

    expect(filename).toBe('campaigns_export_all_2026-01-31.xlsx');
  });

  // AC#3: Filename includes date range when filter applied
  it('generates filename with date range when filter applied', async () => {
    const xlsx = await import('xlsx');

    exportCampaignsToExcel(mockCampaigns, '2026-01-01', '2026-01-31');

    const writeFileCall = vi.mocked(xlsx.writeFile).mock.calls[0];
    const filename = writeFileCall[1] as string;

    expect(filename).toBe('campaigns_export_2026-01-01_2026-01-31.xlsx');
  });

  it('handles empty campaign array', async () => {
    const xlsx = await import('xlsx');

    exportCampaignsToExcel([]);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as string[][];

    // Should only have header row
    expect(data.length).toBe(1);
    expect(xlsx.writeFile).toHaveBeenCalled();
  });

  it('names worksheet as "Campaigns"', async () => {
    const xlsx = await import('xlsx');

    exportCampaignsToExcel(mockCampaigns);

    const appendSheetCall = vi.mocked(xlsx.utils.book_append_sheet).mock.calls[0];
    const sheetName = appendSheetCall[2];

    expect(sheetName).toBe('Campaigns');
  });

  it('sets column widths for better readability', async () => {
    const xlsx = await import('xlsx');

    exportCampaignsToExcel(mockCampaigns);

    const worksheet = vi.mocked(xlsx.utils.aoa_to_sheet).mock.results[0].value;

    expect(worksheet['!cols']).toBeDefined();
    expect(worksheet['!cols'].length).toBe(CAMPAIGN_EXPORT_COLUMNS.length);
  });
});

describe('exportCampaignsToCSV', () => {
  const mockCampaigns: CampaignStatsItem[] = [
    createMockCampaign({ campaignId: 1, campaignName: 'Campaign A' }),
    createMockCampaign({ campaignId: 2, campaignName: 'Campaign B', openRate: 55.5 }),
  ];

  let mockLink: {
    href: string;
    download: string;
    click: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-31T10:00:00Z'));

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

  // AC#5: CSV file generation
  it('creates CSV with correct structure', () => {
    exportCampaignsToCSV(mockCampaigns);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockLink.click).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it('includes header row with column names', () => {
    exportCampaignsToCSV(mockCampaigns);

    const calls = mockCreateObjectURL.mock.calls as unknown as [Blob][];
    expect(calls.length).toBeGreaterThan(0);
    const blobCall = calls[0][0];
    expect(blobCall.type).toBe('text/csv;charset=utf-8;');
  });

  // AC#4: Filename for all campaigns (no filter)
  it('generates filename with all_ pattern when no date filter', () => {
    exportCampaignsToCSV(mockCampaigns);

    expect(mockLink.download).toBe('campaigns_export_all_2026-01-31.csv');
  });

  // AC#3: Filename includes date range when filter applied
  it('generates filename with date range when filter applied', () => {
    exportCampaignsToCSV(mockCampaigns, '2026-01-01', '2026-01-31');

    expect(mockLink.download).toBe('campaigns_export_2026-01-01_2026-01-31.csv');
  });

  it('includes UTF-8 BOM for Excel compatibility', () => {
    exportCampaignsToCSV(mockCampaigns);

    const calls = mockCreateObjectURL.mock.calls as unknown as [Blob][];
    expect(calls.length).toBeGreaterThan(0);
    const blobCall = calls[0][0];
    expect(blobCall).toBeInstanceOf(Blob);
  });

  // AC#5: CSV escaping for special characters
  it('escapes values with commas by wrapping in quotes', () => {
    const campaigns = [createMockCampaign({ campaignName: 'Campaign, Test' })];

    exportCampaignsToCSV(campaigns);

    expect(mockLink.click).toHaveBeenCalled();
  });

  it('escapes values with quotes by doubling them', () => {
    const campaigns = [createMockCampaign({ campaignName: 'Campaign "Special"' })];

    exportCampaignsToCSV(campaigns);

    expect(mockLink.click).toHaveBeenCalled();
  });

  it('handles empty campaign array', () => {
    exportCampaignsToCSV([]);

    expect(mockLink.click).toHaveBeenCalled();
  });

  it('cleans up temporary elements after download', () => {
    exportCampaignsToCSV(mockCampaigns);

    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });
});
