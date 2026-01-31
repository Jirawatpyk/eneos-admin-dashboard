/**
 * Export Form - Date Range Integration Tests
 * Story 6.4: Custom Date Range - AC#1, #2, #5, #6, #9
 *
 * Tests the integration of ExportDatePresets, ExportDateRangePicker,
 * and useRecordCount within the ExportForm component.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock hooks
const { mockUseExport, mockUseSalesOwners, mockUseCampaigns, mockUseLeads } = vi.hoisted(() => ({
  mockUseExport: vi.fn().mockReturnValue({
    exportData: vi.fn(),
    previewPdf: vi.fn(),
    cancelPreview: vi.fn(),
    isExporting: false,
    isPreviewing: false,
    error: null,
  }),
  mockUseSalesOwners: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  mockUseCampaigns: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  mockUseLeads: vi.fn().mockReturnValue({
    data: undefined,
    pagination: { total: 156, page: 1, limit: 1, totalPages: 156 },
    availableFilters: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-export', () => ({
  useExport: mockUseExport,
}));
vi.mock('@/hooks/use-sales-owners', () => ({
  useSalesOwners: mockUseSalesOwners,
}));
vi.mock('@/hooks/use-campaigns', () => ({
  useCampaigns: mockUseCampaigns,
}));
vi.mock('@/hooks/use-leads', () => ({
  useLeads: mockUseLeads,
}));

// Mock react-pdf to avoid DOMMatrix error in jsdom
vi.mock('react-pdf', () => ({
  Document: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Page: () => React.createElement('div', null, 'PDF Page'),
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
}));

// Mock PdfPreviewModal to avoid react-pdf dependency chain
vi.mock('@/components/export/pdf-preview-modal', () => ({
  PdfPreviewModal: () => null,
}));

import { ExportForm } from '@/components/export/export-form';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('ExportForm - Date Range Integration (Story 6.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLeads.mockReturnValue({
      data: undefined,
      pagination: { total: 156, page: 1, limit: 1, totalPages: 156 },
      availableFilters: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  describe('AC#1: Quick Date Presets', () => {
    it('renders preset buttons in the export form', () => {
      render(<ExportForm />, { wrapper: createWrapper() });
      expect(screen.getByTestId('export-date-presets')).toBeInTheDocument();
      expect(screen.getByTestId('preset-thisMonth')).toBeInTheDocument();
      expect(screen.getByTestId('preset-lastMonth')).toBeInTheDocument();
      expect(screen.getByTestId('preset-thisQuarter')).toBeInTheDocument();
      expect(screen.getByTestId('preset-thisYear')).toBeInTheDocument();
    });

    it('clicking a preset fills in the date range', () => {
      render(<ExportForm />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByTestId('preset-thisMonth'));

      // Trigger should now show a formatted date range instead of "All dates"
      const trigger = screen.getByTestId('date-range-trigger');
      expect(trigger).not.toHaveTextContent('All dates (no filter)');
    });

    it('clicking same active preset clears the date range (toggle)', () => {
      render(<ExportForm />, { wrapper: createWrapper() });

      // Click to activate
      fireEvent.click(screen.getByTestId('preset-thisMonth'));
      const trigger = screen.getByTestId('date-range-trigger');
      expect(trigger).not.toHaveTextContent('All dates (no filter)');

      // Click again to deactivate (toggle)
      fireEvent.click(screen.getByTestId('preset-thisMonth'));
      expect(screen.getByTestId('date-range-trigger')).toHaveTextContent('All dates (no filter)');
    });
  });

  describe('AC#5: Record Count Preview', () => {
    it('displays record count', () => {
      render(<ExportForm />, { wrapper: createWrapper() });
      expect(screen.getByTestId('record-count')).toHaveTextContent('Estimated records:');
      expect(screen.getByTestId('record-count')).toHaveTextContent('156');
    });

    it('shows loading state for record count', () => {
      mockUseLeads.mockReturnValue({
        data: undefined,
        pagination: undefined,
        availableFilters: undefined,
        isLoading: true,
        isFetching: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<ExportForm />, { wrapper: createWrapper() });
      expect(screen.getByTestId('record-count')).toHaveTextContent('...');
    });

    it('shows fallback when count fails', () => {
      mockUseLeads.mockReturnValue({
        data: undefined,
        pagination: undefined,
        availableFilters: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: null,
        refetch: vi.fn(),
      });

      render(<ExportForm />, { wrapper: createWrapper() });
      expect(screen.getByTestId('record-count')).toHaveTextContent('--');
    });
  });

  describe('AC#9: Campaign Filter Disclaimer', () => {
    it('does not show campaign disclaimer when campaign is "all"', () => {
      render(<ExportForm />, { wrapper: createWrapper() });
      expect(screen.queryByText('(excludes campaign filter)')).not.toBeInTheDocument();
    });
  });

  describe('AC#6: Display Selected Range', () => {
    it('shows "All dates (no filter)" when no date range selected', () => {
      render(<ExportForm />, { wrapper: createWrapper() });
      expect(screen.getByTestId('date-range-trigger')).toHaveTextContent('All dates (no filter)');
    });

    it('shows preset badge when a preset is active', () => {
      render(<ExportForm />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByTestId('preset-thisMonth'));
      expect(screen.getByTestId('preset-badge')).toHaveTextContent('This Month');
    });
  });

  describe('AC#2: Enhanced Date Range Picker', () => {
    it('renders the enhanced date range trigger', () => {
      render(<ExportForm />, { wrapper: createWrapper() });
      expect(screen.getByTestId('date-range-trigger')).toBeInTheDocument();
    });
  });

  describe('Date Range Section Container', () => {
    it('has correct data-testid for the section', () => {
      render(<ExportForm />, { wrapper: createWrapper() });
      expect(screen.getByTestId('date-range-section')).toBeInTheDocument();
    });
  });
});
