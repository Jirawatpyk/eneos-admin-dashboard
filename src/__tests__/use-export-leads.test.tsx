/**
 * Export Leads Hook Tests
 * Story 4.10: Quick Export
 *
 * AC#6: Export Progress Feedback
 * AC#7: Download Handling
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExportLeads, type ExportFormat } from '@/hooks/use-export-leads';
import type { Lead } from '@/types/lead';

// Mock toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock export functions
const mockExportLeadsToExcel = vi.fn();
const mockExportLeadsToCSV = vi.fn();
vi.mock('@/lib/export-leads', () => ({
  exportLeadsToExcel: (...args: unknown[]) => mockExportLeadsToExcel(...args),
  exportLeadsToCSV: (...args: unknown[]) => mockExportLeadsToCSV(...args),
}));

// Sample lead data
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
  ...overrides,
});

describe('useExportLeads', () => {
  const mockLeads: Lead[] = [
    createMockLead({ row: 1 }),
    createMockLead({ row: 2 }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Basic hook initialization
  it('returns exportLeads function and isExporting state', () => {
    const { result } = renderHook(() => useExportLeads());

    expect(result.current.exportLeads).toBeDefined();
    expect(typeof result.current.exportLeads).toBe('function');
    expect(result.current.isExporting).toBe(false);
  });

  // AC#6: Loading state during generation
  it('sets isExporting to true during export', async () => {
    const { result } = renderHook(() => useExportLeads());

    // Start export but don't await
    let exportPromise: Promise<void>;
    act(() => {
      exportPromise = result.current.exportLeads(mockLeads, 'excel');
    });

    // Should be exporting immediately
    expect(result.current.isExporting).toBe(true);

    // Complete the export
    await act(async () => {
      vi.advanceTimersByTime(200);
      await exportPromise;
    });

    // Should be done
    expect(result.current.isExporting).toBe(false);
  });

  // AC#6: Loading state resets after completion
  it('resets isExporting to false after successful export', async () => {
    const { result } = renderHook(() => useExportLeads());

    await act(async () => {
      const exportPromise = result.current.exportLeads(mockLeads, 'excel');
      vi.advanceTimersByTime(200);
      await exportPromise;
    });

    expect(result.current.isExporting).toBe(false);
  });

  // AC#7: Calls correct export function for Excel
  it('calls exportLeadsToExcel for Excel format', async () => {
    const { result } = renderHook(() => useExportLeads());

    await act(async () => {
      const exportPromise = result.current.exportLeads(mockLeads, 'excel');
      vi.advanceTimersByTime(200);
      await exportPromise;
    });

    expect(mockExportLeadsToExcel).toHaveBeenCalledWith(mockLeads);
    expect(mockExportLeadsToCSV).not.toHaveBeenCalled();
  });

  // AC#7: Calls correct export function for CSV
  it('calls exportLeadsToCSV for CSV format', async () => {
    const { result } = renderHook(() => useExportLeads());

    await act(async () => {
      const exportPromise = result.current.exportLeads(mockLeads, 'csv');
      vi.advanceTimersByTime(200);
      await exportPromise;
    });

    expect(mockExportLeadsToCSV).toHaveBeenCalledWith(mockLeads);
    expect(mockExportLeadsToExcel).not.toHaveBeenCalled();
  });

  // AC#7: Shows success toast for Excel export
  it('shows success toast after Excel export', async () => {
    const { result } = renderHook(() => useExportLeads());

    await act(async () => {
      const exportPromise = result.current.exportLeads(mockLeads, 'excel');
      vi.advanceTimersByTime(200);
      await exportPromise;
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export complete',
      description: 'Exported 2 leads to Excel.',
    });
  });

  // AC#7: Shows success toast for CSV export
  it('shows success toast after CSV export', async () => {
    const { result } = renderHook(() => useExportLeads());

    await act(async () => {
      const exportPromise = result.current.exportLeads(mockLeads, 'csv');
      vi.advanceTimersByTime(200);
      await exportPromise;
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export complete',
      description: 'Exported 2 leads to CSV.',
    });
  });

  // AC#7: Singular form for 1 lead
  it('uses singular form for 1 lead', async () => {
    const { result } = renderHook(() => useExportLeads());
    const singleLead = [createMockLead()];

    await act(async () => {
      const exportPromise = result.current.exportLeads(singleLead, 'excel');
      vi.advanceTimersByTime(200);
      await exportPromise;
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export complete',
      description: 'Exported 1 lead to Excel.',
    });
  });

  // AC#7: Shows error toast on empty array
  it('shows error toast for empty lead array', async () => {
    const { result } = renderHook(() => useExportLeads());

    await act(async () => {
      await result.current.exportLeads([], 'excel');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'No leads to export',
      description: 'Please select leads to export.',
      variant: 'destructive',
    });
    expect(mockExportLeadsToExcel).not.toHaveBeenCalled();
  });

  // AC#7: Shows error toast on export failure
  it('shows error toast on export failure', async () => {
    mockExportLeadsToExcel.mockImplementationOnce(() => {
      throw new Error('Export failed');
    });

    const { result } = renderHook(() => useExportLeads());

    await act(async () => {
      const exportPromise = result.current.exportLeads(mockLeads, 'excel');
      vi.advanceTimersByTime(200);
      await exportPromise;
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export failed',
      description: 'Unable to generate export file. Please try again.',
      variant: 'destructive',
    });
  });

  // AC#6: Resets isExporting after error
  it('resets isExporting to false after error', async () => {
    mockExportLeadsToExcel.mockImplementationOnce(() => {
      throw new Error('Export failed');
    });

    const { result } = renderHook(() => useExportLeads());

    await act(async () => {
      const exportPromise = result.current.exportLeads(mockLeads, 'excel');
      vi.advanceTimersByTime(200);
      await exportPromise;
    });

    expect(result.current.isExporting).toBe(false);
  });

  // Does not set loading for empty array
  it('does not enter loading state for empty array', async () => {
    const { result } = renderHook(() => useExportLeads());

    await act(async () => {
      await result.current.exportLeads([], 'excel');
    });

    // Should never have been in loading state (or already reset)
    expect(result.current.isExporting).toBe(false);
  });

  // Type safety for format parameter
  it('accepts valid format types', async () => {
    const { result } = renderHook(() => useExportLeads());

    const formats: ExportFormat[] = ['excel', 'csv'];

    for (const format of formats) {
      await act(async () => {
        const exportPromise = result.current.exportLeads(mockLeads, format);
        vi.advanceTimersByTime(200);
        await exportPromise;
      });
    }

    expect(mockExportLeadsToExcel).toHaveBeenCalledTimes(1);
    expect(mockExportLeadsToCSV).toHaveBeenCalledTimes(1);
  });
});
