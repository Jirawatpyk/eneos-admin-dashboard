/**
 * Export Individual Hook Tests
 * Story 3.8: Export Individual Performance Report
 *
 * AC#6: Export Progress Feedback
 * AC#7: Download Handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useExportIndividual } from '@/hooks/use-export-individual';
import type { SalesPersonMetrics } from '@/types/sales';

// Mock dependencies
const mockToast = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock('@/hooks/use-sales-period-filter', () => ({
  useSalesPeriodFilter: () => ({
    period: 'month' as const,
    from: new Date('2026-01-01'),
    to: new Date('2026-01-15'),
    isCustom: false,
  }),
}));

// Mock export utils
const mockExportIndividualToExcel = vi.fn();

vi.mock('@/lib/export-utils', () => ({
  exportIndividualToExcel: (...args: unknown[]) => mockExportIndividualToExcel(...args),
}));

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

describe('useExportIndividual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExportIndividualToExcel.mockResolvedValue(undefined);
  });

  it('returns exportToExcel, exportToPDF, and isExporting', () => {
    const { result } = renderHook(() => useExportIndividual());

    expect(result.current.exportToExcel).toBeDefined();
    expect(result.current.exportToPDF).toBeDefined();
    expect(result.current.isExporting).toBe(false);
  });

  // AC#6: Loading state during generation
  it('sets isExporting to true during export', async () => {
    // Make export take some time
    mockExportIndividualToExcel.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useExportIndividual());

    expect(result.current.isExporting).toBe(false);

    act(() => {
      result.current.exportToExcel(mockSalesPerson);
    });

    // isExporting should be true while exporting
    expect(result.current.isExporting).toBe(true);

    // Wait for export to complete
    await waitFor(() => {
      expect(result.current.isExporting).toBe(false);
    });
  });

  // AC#7: Success toast notification
  it('shows success toast on successful export', async () => {
    const { result } = renderHook(() => useExportIndividual());

    await act(async () => {
      await result.current.exportToExcel(mockSalesPerson);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Report downloaded',
      description: "John Smith's performance report has been exported.",
    });
  });

  // AC#7: Error toast on failure
  it('shows error toast on export failure', async () => {
    mockExportIndividualToExcel.mockRejectedValue(new Error('Export failed'));

    const { result } = renderHook(() => useExportIndividual());

    await act(async () => {
      await result.current.exportToExcel(mockSalesPerson);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export failed',
      description: 'Unable to generate report. Please try again.',
      variant: 'destructive',
    });
  });

  // AC#6: Generation completes and resets loading state
  it('resets isExporting to false after completion', async () => {
    const { result } = renderHook(() => useExportIndividual());

    await act(async () => {
      await result.current.exportToExcel(mockSalesPerson);
    });

    expect(result.current.isExporting).toBe(false);
  });

  // AC#6: Generation completes even on error
  it('resets isExporting to false even on error', async () => {
    mockExportIndividualToExcel.mockRejectedValue(new Error('Export failed'));

    const { result } = renderHook(() => useExportIndividual());

    await act(async () => {
      await result.current.exportToExcel(mockSalesPerson);
    });

    expect(result.current.isExporting).toBe(false);
  });

  // Test with target data
  it('passes target data to export function', async () => {
    const target = { closed: 20, progress: 75, status: 'below' as const };

    const { result } = renderHook(() => useExportIndividual());

    await act(async () => {
      await result.current.exportToExcel(mockSalesPerson, target);
    });

    expect(mockExportIndividualToExcel).toHaveBeenCalledWith(
      mockSalesPerson,
      expect.objectContaining({
        period: 'month',
      }),
      target
    );
  });

  // PDF placeholder
  it('shows coming soon toast for PDF export', async () => {
    const { result } = renderHook(() => useExportIndividual());

    act(() => {
      result.current.exportToPDF(mockSalesPerson);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Coming Soon',
      description: 'PDF export will be available in a future update.',
    });
  });

  // Test period info is passed correctly
  it('passes current period info from filter hook', async () => {
    const { result } = renderHook(() => useExportIndividual());

    await act(async () => {
      await result.current.exportToExcel(mockSalesPerson);
    });

    expect(mockExportIndividualToExcel).toHaveBeenCalledWith(
      mockSalesPerson,
      expect.objectContaining({
        period: 'month',
        from: expect.any(Date),
        to: expect.any(Date),
      }),
      undefined
    );
  });
});
