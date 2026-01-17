/**
 * Export Utilities Tests
 * Story 3.8: Export Individual Performance Report
 *
 * AC#3: Excel Export Content
 * AC#5: Period-Based Export
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPeriodLabel,
  sanitizeFilename,
  exportIndividualToExcel,
  type ExportPeriodInfo,
} from '@/lib/export-utils';
import type { SalesPersonMetrics } from '@/types/sales';

// Mock xlsx module
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    aoa_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe('getPeriodLabel', () => {
  // AC#5: Period information in export
  it('returns correct label for week period', () => {
    expect(getPeriodLabel('week')).toBe('This Week');
  });

  it('returns correct label for month period', () => {
    expect(getPeriodLabel('month')).toBe('This Month');
  });

  it('returns correct label for quarter period', () => {
    expect(getPeriodLabel('quarter')).toBe('This Quarter');
  });

  it('returns correct label for lastQuarter period', () => {
    expect(getPeriodLabel('lastQuarter')).toBe('Last Quarter');
  });

  it('returns correct label for custom period', () => {
    expect(getPeriodLabel('custom')).toBe('Custom Range');
  });
});

describe('sanitizeFilename', () => {
  // AC#3: File naming - remove invalid chars, keep Thai, truncate
  it('removes filesystem-invalid characters', () => {
    expect(sanitizeFilename('file/name')).toBe('file_name');
    expect(sanitizeFilename('file\\name')).toBe('file_name');
    expect(sanitizeFilename('file:name')).toBe('file_name');
    expect(sanitizeFilename('file*name')).toBe('file_name');
    expect(sanitizeFilename('file?name')).toBe('file_name');
    expect(sanitizeFilename('file"name')).toBe('file_name');
    expect(sanitizeFilename('file<name')).toBe('file_name');
    expect(sanitizeFilename('file>name')).toBe('file_name');
    expect(sanitizeFilename('file|name')).toBe('file_name');
  });

  it('keeps Thai characters (Unicode support)', () => {
    expect(sanitizeFilename('สมชาย')).toBe('สมชาย');
    expect(sanitizeFilename('นายสมชาย ใจดี')).toBe('นายสมชาย ใจดี');
  });

  it('truncates to max 50 characters', () => {
    const longName = 'a'.repeat(60);
    expect(sanitizeFilename(longName)).toBe('a'.repeat(50));
    expect(sanitizeFilename(longName).length).toBe(50);
  });

  it('handles names with mixed characters and invalid chars', () => {
    expect(sanitizeFilename('Test/User:Name')).toBe('Test_User_Name');
  });

  it('keeps regular names unchanged', () => {
    expect(sanitizeFilename('John Smith')).toBe('John Smith');
    expect(sanitizeFilename('John_Smith')).toBe('John_Smith');
  });

  // Edge cases (Code Review M3)
  it('handles empty string', () => {
    expect(sanitizeFilename('')).toBe('');
  });

  it('handles whitespace only', () => {
    expect(sanitizeFilename('   ')).toBe('   ');
  });

  it('handles name with only invalid characters', () => {
    expect(sanitizeFilename('/:*?')).toBe('____');
  });

  it('handles name with spaces and invalid chars', () => {
    expect(sanitizeFilename('John / Smith : CEO')).toBe('John _ Smith _ CEO');
  });
});

describe('exportIndividualToExcel', () => {
  const mockSalesPerson: SalesPersonMetrics = {
    userId: 'user-1',
    name: 'John Smith',
    email: 'john@eneos.co.th',
    claimed: 50,
    contacted: 40,
    closed: 15,
    lost: 5,
    unreachable: 3,
    conversionRate: 30,
    avgResponseTime: 45,
  };

  const mockPeriodInfo: ExportPeriodInfo = {
    period: 'month',
    from: new Date('2026-01-01'),
    to: new Date('2026-01-15'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#3: Excel file generation
  it('creates Excel workbook with correct data', async () => {
    const xlsx = await import('xlsx');

    await exportIndividualToExcel(mockSalesPerson, mockPeriodInfo);

    expect(xlsx.utils.book_new).toHaveBeenCalled();
    expect(xlsx.utils.aoa_to_sheet).toHaveBeenCalled();
    expect(xlsx.utils.book_append_sheet).toHaveBeenCalled();
    expect(xlsx.writeFile).toHaveBeenCalled();
  });

  // AC#3: File naming pattern
  it('generates filename with correct pattern', async () => {
    const xlsx = await import('xlsx');

    await exportIndividualToExcel(mockSalesPerson, mockPeriodInfo);

    const writeFileCall = vi.mocked(xlsx.writeFile).mock.calls[0];
    const filename = writeFileCall[1] as string;

    expect(filename).toMatch(/^John Smith_performance_\d{4}-\d{2}-\d{2}\.xlsx$/);
  });

  // AC#3: Thai name support in filename
  it('handles Thai names in filename', async () => {
    const xlsx = await import('xlsx');
    const thaiPerson: SalesPersonMetrics = {
      ...mockSalesPerson,
      name: 'สมชาย',
    };

    await exportIndividualToExcel(thaiPerson, mockPeriodInfo);

    const writeFileCall = vi.mocked(xlsx.writeFile).mock.calls[0];
    const filename = writeFileCall[1] as string;

    expect(filename).toContain('สมชาย');
  });

  // AC#3: Long name truncation
  it('truncates long names in filename', async () => {
    const xlsx = await import('xlsx');
    const longNamePerson: SalesPersonMetrics = {
      ...mockSalesPerson,
      name: 'A'.repeat(60),
    };

    await exportIndividualToExcel(longNamePerson, mockPeriodInfo);

    const writeFileCall = vi.mocked(xlsx.writeFile).mock.calls[0];
    const filename = writeFileCall[1] as string;

    // Filename should have truncated name (50 chars) + _performance_ + date + .xlsx
    expect(filename.startsWith('A'.repeat(50))).toBe(true);
  });

  // AC#3: Null/undefined metrics fallback
  it('handles null/undefined metrics with fallback to 0', async () => {
    const xlsx = await import('xlsx');
    const partialPerson = {
      userId: 'user-1',
      name: 'Test User',
      email: 'test@eneos.co.th',
      claimed: 0,
      contacted: 0,
      closed: 0,
      lost: 0,
      unreachable: 0,
      conversionRate: 0,
      avgResponseTime: 0,
    } as SalesPersonMetrics;

    // Should not throw
    await expect(exportIndividualToExcel(partialPerson, mockPeriodInfo)).resolves.not.toThrow();
    expect(xlsx.writeFile).toHaveBeenCalled();
  });

  // AC#5: Include period information
  it('includes period information in export', async () => {
    const xlsx = await import('xlsx');

    await exportIndividualToExcel(mockSalesPerson, mockPeriodInfo);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as (string | number)[][];

    // Check that period info is included in the data
    const flatData = data.flat().map(String);
    expect(flatData).toContain('This Month');
    expect(flatData.some(item => item.includes('Jan 1, 2026'))).toBe(true);
  });

  // AC#3: Include target comparison if available
  it('includes target comparison when provided', async () => {
    const xlsx = await import('xlsx');
    const target = {
      closed: 20,
      progress: 75,
      status: 'below' as const,
    };

    await exportIndividualToExcel(mockSalesPerson, mockPeriodInfo, target);

    const aoaCall = vi.mocked(xlsx.utils.aoa_to_sheet).mock.calls[0];
    const data = aoaCall[0] as (string | number)[][];

    const flatData = data.flat().map(String);
    expect(flatData).toContain('Target Comparison');
    expect(flatData).toContain('75.0%');
    expect(flatData).toContain('Below Target');
  });
});
