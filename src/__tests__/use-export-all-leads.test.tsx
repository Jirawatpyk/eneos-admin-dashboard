/**
 * Export All Leads Hook Tests
 * Technical Debt: Export All Feature
 *
 * Tests:
 * - Initial state (not exporting)
 * - Export progress tracking
 * - Successful export to Excel
 * - Successful export to CSV
 * - Error handling
 * - Empty result handling
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { useExportAllLeads, type ExportFormat } from '@/hooks/use-export-all-leads';
import { fetchAllLeadsForExport } from '@/lib/api/export-all-leads';
import { exportLeadsToExcel, exportLeadsToCSV } from '@/lib/export-leads';
import { toast } from '@/hooks/use-toast';
import type { Lead } from '@/types/lead';

// Mock dependencies
vi.mock('@/lib/api/export-all-leads', () => ({
  fetchAllLeadsForExport: vi.fn(),
  ExportAllError: class ExportAllError extends Error {},
}));

vi.mock('@/lib/export-leads', () => ({
  exportLeadsToExcel: vi.fn(),
  exportLeadsToCSV: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock lead data
const mockLeads: Lead[] = [
  {
    row: 1,
    date: '2024-01-01',
    customerName: 'John Doe',
    email: 'john@example.com',
    phone: '0812345678',
    company: 'Test Company',
    industryAI: 'Manufacturing',
    website: 'https://example.com',
    capital: '100M',
    status: 'new',
    salesOwnerId: null,
    salesOwnerName: null,
    campaignId: 'camp1',
    campaignName: 'Test Campaign',
    emailSubject: 'Test Subject',
    source: 'Brevo',
    leadId: 'lead1',
    eventId: 'event1',
    clickedAt: '2024-01-01T00:00:00Z',
    talkingPoint: 'Test talking point',
    closedAt: null,
    lostAt: null,
    unreachableAt: null,
    version: 1,
    leadSource: 'Website',
    jobTitle: 'Manager',
    city: 'Bangkok',
    leadUuid: 'uuid-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  },
  {
    row: 2,
    date: '2024-01-02',
    customerName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '0898765432',
    company: 'Another Company',
    industryAI: 'Retail',
    website: null,
    capital: null,
    status: 'contacted',
    salesOwnerId: 'sales1',
    salesOwnerName: 'Bob Sales',
    campaignId: 'camp2',
    campaignName: 'Second Campaign',
    emailSubject: null,
    source: 'Brevo',
    leadId: 'lead2',
    eventId: 'event2',
    clickedAt: null,
    talkingPoint: null,
    closedAt: null,
    lostAt: null,
    unreachableAt: null,
    version: 1,
    leadSource: 'Brevo',
    jobTitle: 'Director',
    city: 'Chiang Mai',
    leadUuid: 'uuid-2',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

describe('useExportAllLeads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns not exporting initially', () => {
      const { result } = renderHook(() => useExportAllLeads());

      expect(result.current.isExporting).toBe(false);
      expect(result.current.progress).toBeNull();
    });
  });

  describe('exportAllLeads', () => {
    it('exports leads to Excel successfully', async () => {
      (fetchAllLeadsForExport as Mock).mockResolvedValue({
        leads: mockLeads,
        total: 2,
      });

      const { result } = renderHook(() => useExportAllLeads());

      await act(async () => {
        await result.current.exportAllLeads({}, 'excel');
      });

      expect(fetchAllLeadsForExport).toHaveBeenCalledWith({}, expect.any(Function));
      expect(exportLeadsToExcel).toHaveBeenCalledWith(mockLeads);
      expect(toast).toHaveBeenCalledWith({
        title: 'Export complete',
        description: 'Exported 2 leads to Excel.',
      });
      expect(result.current.isExporting).toBe(false);
    });

    it('exports leads to CSV successfully', async () => {
      (fetchAllLeadsForExport as Mock).mockResolvedValue({
        leads: mockLeads,
        total: 2,
      });

      const { result } = renderHook(() => useExportAllLeads());

      await act(async () => {
        await result.current.exportAllLeads({}, 'csv');
      });

      expect(fetchAllLeadsForExport).toHaveBeenCalledWith({}, expect.any(Function));
      expect(exportLeadsToCSV).toHaveBeenCalledWith(mockLeads);
      expect(toast).toHaveBeenCalledWith({
        title: 'Export complete',
        description: 'Exported 2 leads to CSV.',
      });
    });

    it('passes filters to fetchAllLeadsForExport', async () => {
      (fetchAllLeadsForExport as Mock).mockResolvedValue({
        leads: mockLeads,
        total: 2,
      });

      const filters = {
        status: ['new', 'contacted'] as ('new' | 'contacted' | 'claimed' | 'closed' | 'lost' | 'unreachable')[],
        search: 'test',
        owner: ['sales1'],
      };

      const { result } = renderHook(() => useExportAllLeads());

      await act(async () => {
        await result.current.exportAllLeads(filters, 'excel');
      });

      expect(fetchAllLeadsForExport).toHaveBeenCalledWith(filters, expect.any(Function));
    });

    it('sets isExporting to true during export', async () => {
      let resolvePromise: (value: { leads: Lead[]; total: number }) => void;
      const promise = new Promise<{ leads: Lead[]; total: number }>((resolve) => {
        resolvePromise = resolve;
      });

      (fetchAllLeadsForExport as Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useExportAllLeads());

      // Start export
      act(() => {
        void result.current.exportAllLeads({}, 'excel');
      });

      // Should be exporting
      expect(result.current.isExporting).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ leads: mockLeads, total: 2 });
      });

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });
    });

    it('handles empty results', async () => {
      (fetchAllLeadsForExport as Mock).mockResolvedValue({
        leads: [],
        total: 0,
      });

      const { result } = renderHook(() => useExportAllLeads());

      await act(async () => {
        await result.current.exportAllLeads({}, 'excel');
      });

      expect(exportLeadsToExcel).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith({
        title: 'No leads to export',
        description: 'No leads match the current filters.',
        variant: 'destructive',
      });
    });

    it('handles errors gracefully', async () => {
      const error = new Error('Network error');
      (fetchAllLeadsForExport as Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useExportAllLeads());

      await act(async () => {
        await result.current.exportAllLeads({}, 'excel');
      });

      expect(exportLeadsToExcel).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith({
        title: 'Export failed',
        description: 'Failed to export leads. Please try again.',
        variant: 'destructive',
      });
      expect(result.current.isExporting).toBe(false);
    });

    it('resets progress after export completes', async () => {
      (fetchAllLeadsForExport as Mock).mockResolvedValue({
        leads: mockLeads,
        total: 2,
      });

      const { result } = renderHook(() => useExportAllLeads());

      await act(async () => {
        await result.current.exportAllLeads({}, 'excel');
      });

      expect(result.current.progress).toBeNull();
    });

    it('uses singular form for 1 lead', async () => {
      (fetchAllLeadsForExport as Mock).mockResolvedValue({
        leads: [mockLeads[0]],
        total: 1,
      });

      const { result } = renderHook(() => useExportAllLeads());

      await act(async () => {
        await result.current.exportAllLeads({}, 'excel');
      });

      expect(toast).toHaveBeenCalledWith({
        title: 'Export complete',
        description: 'Exported 1 lead to Excel.',
      });
    });
  });
});
