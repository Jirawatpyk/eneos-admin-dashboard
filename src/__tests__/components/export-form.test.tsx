/**
 * Export Form Tests - PDF Preview
 * Story 6.2: Export to PDF
 *
 * AC#1: Preview PDF Button
 * AC#5: PDF Row Limit Warning
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExportForm } from '@/components/export/export-form';

// Mock hooks
const mockExportData = vi.fn();
const mockPreviewPdf = vi.fn();
const mockCancelPreview = vi.fn();

vi.mock('@/hooks/use-export', () => ({
  useExport: () => ({
    exportData: mockExportData,
    previewPdf: mockPreviewPdf,
    cancelPreview: mockCancelPreview,
    isExporting: false,
    isPreviewing: false,
    error: null,
  }),
}));

vi.mock('@/hooks/use-sales-owners', () => ({
  useSalesOwners: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/use-campaigns', () => ({
  useCampaigns: () => ({
    data: [],
    isLoading: false,
  }),
}));

// Story 6.4: Mock useLeads for useRecordCount dependency
vi.mock('@/hooks/use-leads', () => ({
  useLeads: () => ({
    data: undefined,
    pagination: { total: 100, page: 1, limit: 1, totalPages: 100 },
    availableFilters: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

// Mock PdfPreviewModal to avoid react-pdf complexity
vi.mock('@/components/export/pdf-preview-modal', () => ({
  PdfPreviewModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="pdf-preview-modal" role="dialog">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('ExportForm - PDF Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#1: Preview PDF Button
  describe('Preview PDF Button (AC#1)', () => {
    it('shows Preview PDF button when PDF format is selected', () => {
      render(<ExportForm />, { wrapper: createWrapper() });

      // Select PDF format
      const pdfRadio = screen.getByLabelText(/pdf/i);
      fireEvent.click(pdfRadio);

      expect(screen.getByRole('button', { name: /preview pdf/i })).toBeInTheDocument();
    });

    it('hides Preview PDF button when Excel format is selected', () => {
      render(<ExportForm />, { wrapper: createWrapper() });

      // Excel is default format
      expect(screen.queryByRole('button', { name: /preview pdf/i })).not.toBeInTheDocument();
    });

    it('hides Preview PDF button when CSV format is selected', () => {
      render(<ExportForm />, { wrapper: createWrapper() });

      // Select CSV format
      const csvRadio = screen.getByLabelText(/csv/i);
      fireEvent.click(csvRadio);

      expect(screen.queryByRole('button', { name: /preview pdf/i })).not.toBeInTheDocument();
    });

    it('calls previewPdf when Preview PDF button is clicked', async () => {
      const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
      mockPreviewPdf.mockResolvedValue({ blob: mockBlob, filename: 'test.pdf' });

      render(<ExportForm />, { wrapper: createWrapper() });

      // Select PDF format
      const pdfRadio = screen.getByLabelText(/pdf/i);
      await act(async () => {
        fireEvent.click(pdfRadio);
      });

      const previewButton = screen.getByRole('button', { name: /preview pdf/i });
      await act(async () => {
        fireEvent.click(previewButton);
      });

      await waitFor(() => {
        expect(mockPreviewPdf).toHaveBeenCalled();
      });
    });
  });

  // AC#5: PDF Row Limit Warning
  describe('PDF Limit Warning (AC#5)', () => {
    it('shows PDF limit warning when PDF format is selected', () => {
      render(<ExportForm />, { wrapper: createWrapper() });

      // Select PDF format
      const pdfRadio = screen.getByLabelText(/pdf/i);
      fireEvent.click(pdfRadio);

      expect(screen.getByText(/pdf limited to 100 rows/i)).toBeInTheDocument();
    });

    it('hides PDF limit warning when non-PDF format is selected', () => {
      render(<ExportForm />, { wrapper: createWrapper() });

      // Excel is default
      expect(screen.queryByText(/pdf limited to 100 rows/i)).not.toBeInTheDocument();
    });

    it('has link to switch to Excel format in warning banner', () => {
      render(<ExportForm />, { wrapper: createWrapper() });

      // Select PDF format
      const pdfRadio = screen.getByLabelText(/pdf/i);
      fireEvent.click(pdfRadio);

      const switchLink = screen.getByRole('button', { name: /switch to excel/i });
      expect(switchLink).toBeInTheDocument();
    });

    it('switches format to Excel when clicking the link in warning', () => {
      render(<ExportForm />, { wrapper: createWrapper() });

      // Select PDF format
      const pdfRadio = screen.getByLabelText(/pdf/i);
      fireEvent.click(pdfRadio);

      // Click switch to Excel
      const switchLink = screen.getByRole('button', { name: /switch to excel/i });
      fireEvent.click(switchLink);

      // Warning should disappear
      expect(screen.queryByText(/pdf limited to 100 rows/i)).not.toBeInTheDocument();
    });
  });

  // Preview modal integration
  describe('Preview Modal Integration', () => {
    it('opens preview modal after successful preview', async () => {
      const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
      mockPreviewPdf.mockResolvedValue({ blob: mockBlob, filename: 'test.pdf' });

      render(<ExportForm />, { wrapper: createWrapper() });

      // Select PDF format
      const pdfRadio = screen.getByLabelText(/pdf/i);
      await act(async () => {
        fireEvent.click(pdfRadio);
      });

      const previewButton = screen.getByRole('button', { name: /preview pdf/i });
      await act(async () => {
        fireEvent.click(previewButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('pdf-preview-modal')).toBeInTheDocument();
      });
    });
  });
});
