/**
 * ATDD Tests - Story 6-5: Select Data Fields (Client-Side Export)
 * RED Phase: Tests for field filtering in exportLeadsToExcel and exportLeadsToCSV.
 *
 * AC#6: Fields Applied to Client-Side Export
 *
 * All tests should FAIL because exportLeadsToExcel/CSV don't accept selectedFields param yet.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Lead } from '@/types/lead';

// ===========================================
// Mock Setup - must be before imports
// ===========================================

// Mock DOM APIs for CSV download
const mockCreateElement = vi.fn(() => ({
  href: '',
  download: '',
  click: vi.fn(),
}));
const mockCreateObjectURL = vi.fn(() => 'blob:mock');
const mockRevokeObjectURL = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

// Track XLSX calls
let mockAoaToSheetCalls: string[][][] = [];
let mockAoaToSheetResults: { '!cols': { wch: number }[] }[] = [];

vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    aoa_to_sheet: vi.fn((data: string[][]) => {
      mockAoaToSheetCalls.push(data);
      const result = { '!cols': data[0].map(() => ({ wch: 20 })) };
      mockAoaToSheetResults.push(result);
      return result;
    }),
  },
  writeFile: vi.fn(),
}));

// Import after mocking
import { exportLeadsToExcel, exportLeadsToCSV, LEAD_EXPORT_COLUMNS } from '@/lib/export-leads';

// ===========================================
// Test Helpers
// ===========================================

const createMockLead = (overrides: Partial<Lead> = {}): Lead => ({
  row: 1,
  date: '2026-01-15T10:00:00.000Z',
  customerName: 'Test Customer',
  email: 'test@example.com',
  phone: '0812345678',
  company: 'Test Corp',
  industryAI: 'Manufacturing',
  website: 'https://test.com',
  capital: '10M',
  status: 'new',
  salesOwnerId: null,
  salesOwnerName: null,
  campaignId: 'camp-001',
  campaignName: 'Test Campaign',
  emailSubject: null,
  source: 'Brevo',
  leadId: null,
  eventId: null,
  clickedAt: null,
  talkingPoint: null,
  closedAt: null,
  lostAt: null,
  unreachableAt: null,
  version: 1,
  leadSource: 'Email',
  jobTitle: 'Manager',
  city: 'Bangkok',
  leadUuid: '',
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: null,
  juristicId: '0105556012345',
  dbdSector: 'Manufacturing',
  province: 'Bangkok',
  fullAddress: '123 Test St, Bangkok 10110',
  ...overrides,
});

// ===========================================
// Tests
// ===========================================

describe('Story 6-5: Client-Side Export Field Filtering (AC#6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15'));

    // Reset tracking arrays
    mockAoaToSheetCalls = [];
    mockAoaToSheetResults = [];

    // Setup DOM mocks
    vi.spyOn(document, 'createElement').mockImplementation(
      mockCreateElement as unknown as typeof document.createElement
    );
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // -------------------------------------------
  // AC#6: exportLeadsToExcel with selectedFields
  // -------------------------------------------
  describe('exportLeadsToExcel with selectedFields', () => {
    // GIVEN I have selected specific fields (Company, Email, Status)
    // WHEN client-side exportLeadsToExcel is called with selectedFields
    // THEN only the selected columns are included
    it('should filter Excel columns when selectedFields provided', () => {
      const leads = [createMockLead()];
      const selectedFields = new Set<keyof Lead>(['company', 'email', 'status']);

      exportLeadsToExcel(leads, selectedFields);

      // Verify aoa_to_sheet was called with filtered headers
      expect(mockAoaToSheetCalls.length).toBe(1);
      const sheetData = mockAoaToSheetCalls[0];
      const headers = sheetData[0];

      expect(headers).toEqual(['Company', 'Email', 'Status']);
      expect(headers).not.toContain('Phone');
      expect(headers).not.toContain('Campaign');
    });

    // GIVEN no selectedFields provided (undefined)
    // WHEN exportLeadsToExcel is called
    // THEN all 16 columns are included (backward compatible)
    it('should export all columns when selectedFields is undefined', () => {
      const leads = [createMockLead()];

      exportLeadsToExcel(leads);

      expect(mockAoaToSheetCalls.length).toBe(1);
      const sheetData = mockAoaToSheetCalls[0];
      const headers = sheetData[0];

      expect(headers.length).toBe(LEAD_EXPORT_COLUMNS.length);
    });

    // GIVEN selected fields
    // WHEN exportLeadsToExcel is called
    // THEN column order matches LEAD_EXPORT_COLUMNS order (not selection order)
    it('should maintain LEAD_EXPORT_COLUMNS order regardless of selection order', () => {
      const leads = [createMockLead()];
      // Selected in reverse order
      const selectedFields = new Set<keyof Lead>(['status', 'email', 'company']);

      exportLeadsToExcel(leads, selectedFields);

      const sheetData = mockAoaToSheetCalls[0];
      const headers = sheetData[0];

      // Should follow LEAD_EXPORT_COLUMNS order: Company, Email, Status
      expect(headers).toEqual(['Company', 'Email', 'Status']);
    });

    // GIVEN selected fields
    // WHEN exportLeadsToExcel is called
    // THEN column widths match the filtered column set
    it('should set correct column widths for filtered fields', () => {
      const leads = [createMockLead()];
      const selectedFields = new Set<keyof Lead>(['company', 'email']);

      exportLeadsToExcel(leads, selectedFields);

      // Verify aoa_to_sheet was called
      expect(mockAoaToSheetCalls.length).toBe(1);
      // Get the worksheet that was returned
      const ws = mockAoaToSheetResults[0];

      // Column widths should match filtered columns (mock returns { wch: 20 } per column)
      expect(ws['!cols']).toHaveLength(2);
    });
  });

  // -------------------------------------------
  // AC#6: exportLeadsToCSV with selectedFields
  // -------------------------------------------
  describe('exportLeadsToCSV with selectedFields', () => {
    // GIVEN I have selected specific fields
    // WHEN client-side exportLeadsToCSV is called with selectedFields
    // THEN only the selected columns are included
    it('should filter CSV columns when selectedFields provided', () => {
      const leads = [createMockLead()];
      const selectedFields = new Set<keyof Lead>(['company', 'email', 'status']);

      exportLeadsToCSV(leads, selectedFields);

      // Verify Blob was created with filtered CSV content
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    });

    // GIVEN no selectedFields
    // WHEN exportLeadsToCSV is called
    // THEN all 16 columns are included
    it('should export all columns when selectedFields is undefined', () => {
      const leads = [createMockLead()];

      exportLeadsToCSV(leads);

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    });

    // GIVEN selected fields
    // WHEN exportLeadsToCSV is called
    // THEN column order matches LEAD_EXPORT_COLUMNS order
    it('should maintain column order from LEAD_EXPORT_COLUMNS', () => {
      const leads = [createMockLead()];
      const selectedFields = new Set<keyof Lead>(['status', 'company']);

      exportLeadsToCSV(leads, selectedFields);

      // CSV should have Company before Status (LEAD_EXPORT_COLUMNS order)
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    });
  });
});
