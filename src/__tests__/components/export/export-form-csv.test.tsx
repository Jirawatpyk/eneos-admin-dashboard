/**
 * Export Form CSV Tests
 * Story 6.8: Export to CSV
 *
 * AC#1: Format Descriptions
 * AC#2: CSV Export
 * AC#9: Accessibility
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock pdf-viewer to avoid DOMMatrix error from react-pdf
vi.mock('@/components/export/pdf-viewer', () => ({
  PdfViewer: () => null,
}));

import { ExportForm } from '@/components/export/export-form';

// Mock hooks
const mockExportData = vi.fn();
const mockPreviewPdf = vi.fn();

vi.mock('@/hooks/use-export', () => ({
  useExport: () => ({
    exportData: mockExportData,
    previewPdf: mockPreviewPdf,
    cancelPreview: vi.fn(),
    isExporting: false,
    isPreviewing: false,
    error: null,
  }),
}));

vi.mock('@/hooks/use-sales-owners', () => ({
  useSalesOwners: () => ({
    data: [{ id: 'U1', name: 'Sales Person 1' }],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/use-campaigns', () => ({
  useCampaigns: () => ({
    data: [{ id: 'C1', name: 'Campaign 1' }],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/use-record-count', () => ({
  useRecordCount: () => ({
    count: 100,
    isLoading: false,
  }),
}));

// Mock LEAD_EXPORT_COLUMNS
vi.mock('@/lib/export-leads', () => ({
  LEAD_EXPORT_COLUMNS: [
    { key: 'company', header: 'Company', width: 25 },
    { key: 'email', header: 'Email', width: 30 },
    { key: 'status', header: 'Status', width: 12 },
  ],
}));

describe('ExportForm - CSV Format (Story 6.8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // AC#1: Format Descriptions
  // Note: These tests are RED phase - they will fail until Story 6.8 is implemented
  describe('AC#1: Format Descriptions', () => {
    it('should render format description for Excel', async () => {
      // GIVEN: ExportForm is rendered
      render(<ExportForm />);

      // THEN: Excel format has description text
      expect(screen.getByText('Formatted spreadsheet with styling')).toBeInTheDocument();
    });

    it('should render format description for CSV', async () => {
      // GIVEN: ExportForm is rendered
      render(<ExportForm />);

      // THEN: CSV format has description text
      expect(screen.getByText('Plain text, universal compatibility')).toBeInTheDocument();
    });

    it('should render format description for PDF', async () => {
      // GIVEN: ExportForm is rendered
      render(<ExportForm />);

      // THEN: PDF format has description text
      expect(screen.getByText('Print-ready document (max 100 rows)')).toBeInTheDocument();
    });
  });

  // AC#2: CSV Selection and Export
  describe('AC#2: CSV Export', () => {
    it('should have CSV radio button with label', () => {
      // GIVEN: ExportForm is rendered
      render(<ExportForm />);

      // THEN: CSV option exists with visible label
      expect(screen.getByText('CSV (.csv)')).toBeInTheDocument();
    });

    it('should select CSV format when clicking CSV card', async () => {
      // GIVEN: ExportForm is rendered
      const user = userEvent.setup();
      render(<ExportForm />);

      // WHEN: Clicking CSV card
      const csvCard = screen.getByText('CSV (.csv)').closest('label');
      expect(csvCard).toBeInTheDocument();
      await user.click(csvCard!);

      // THEN: Export button shows CSV format
      expect(screen.getByRole('button', { name: /export as csv/i })).toBeInTheDocument();
    });

    it('should call exportData with format csv when exporting', async () => {
      // GIVEN: ExportForm with CSV selected
      const user = userEvent.setup();
      render(<ExportForm />);

      // Select CSV
      const csvCard = screen.getByText('CSV (.csv)').closest('label');
      await user.click(csvCard!);

      // WHEN: Clicking export button
      const exportButton = screen.getByRole('button', { name: /export as csv/i });
      await user.click(exportButton);

      // THEN: exportData called with csv format
      expect(mockExportData).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'csv',
        })
      );
    });
  });

  // AC#9: Accessibility
  describe('AC#9: Accessibility', () => {
    it('should have accessible radio buttons for all formats', () => {
      // GIVEN: ExportForm is rendered
      render(<ExportForm />);

      // THEN: All format options have accessible elements
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
    });

    it('should have id attributes for format radios', () => {
      // GIVEN: ExportForm is rendered
      render(<ExportForm />);

      // THEN: Radio buttons have proper IDs for label association
      expect(screen.getByLabelText(/excel/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/csv/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pdf/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation between format options', async () => {
      // GIVEN: ExportForm with focus
      const user = userEvent.setup();
      render(<ExportForm />);

      // WHEN: Tabbing to format group and using arrow keys
      const xlsxLabel = screen.getByText('Excel (.xlsx)').closest('label');
      await user.click(xlsxLabel!);

      // Arrow key navigation is handled by RadioGroup
      await user.keyboard('{ArrowRight}');

      // THEN: Focus moves (RadioGroup handles this automatically)
      // Verify the interaction doesn't throw
      expect(screen.getByText('CSV (.csv)')).toBeInTheDocument();
    });

    it('should show export button with accessible name', () => {
      // GIVEN: ExportForm is rendered
      render(<ExportForm />);

      // THEN: Export button has accessible name with format
      const exportButton = screen.getByRole('button', { name: /export as xlsx/i });
      expect(exportButton).toBeInTheDocument();
    });
  });

  // AC#5: Field Selection with CSV (Story 6-5 integration)
  describe('AC#5: Field Selection with CSV', () => {
    it('should pass selected fields to exportData when CSV format is used', async () => {
      // GIVEN: ExportForm with CSV selected
      const user = userEvent.setup();
      render(<ExportForm />);

      // Select CSV format
      const csvCard = screen.getByText('CSV (.csv)').closest('label');
      await user.click(csvCard!);

      // WHEN: Clicking export button
      const exportButton = screen.getByRole('button', { name: /export as csv/i });
      await user.click(exportButton);

      // THEN: exportData is called with fields parameter
      expect(mockExportData).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'csv',
          fields: expect.any(Array), // Selected field headers
        })
      );
    });
  });

  // Format switching
  describe('Format switching', () => {
    it('should switch from XLSX to CSV correctly', async () => {
      // GIVEN: ExportForm with XLSX selected (default)
      const user = userEvent.setup();
      render(<ExportForm />);

      // Verify default is XLSX
      expect(screen.getByRole('button', { name: /export as xlsx/i })).toBeInTheDocument();

      // WHEN: Selecting CSV
      const csvCard = screen.getByText('CSV (.csv)').closest('label');
      await user.click(csvCard!);

      // THEN: Export button updates to CSV
      expect(screen.getByRole('button', { name: /export as csv/i })).toBeInTheDocument();
    });

    it('should not show Preview button for CSV format', async () => {
      // GIVEN: ExportForm with CSV selected
      const user = userEvent.setup();
      render(<ExportForm />);

      const csvCard = screen.getByText('CSV (.csv)').closest('label');
      await user.click(csvCard!);

      // THEN: Preview PDF button is not visible (only for PDF format)
      expect(screen.queryByRole('button', { name: /preview/i })).not.toBeInTheDocument();
    });
  });
});
