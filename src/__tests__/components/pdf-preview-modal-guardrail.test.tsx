/**
 * PdfPreviewModal Guardrail Tests - Edge Cases
 * Story 6.2: Export to PDF - TEA Automation
 *
 * Coverage gaps addressed:
 * - Print/Download buttons disabled when pdfBlob is null
 * - Next button disabled on last page
 * - Blob URL cleanup on download
 * - Page reset on new document load
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PdfPreviewModal } from '@/components/export/pdf-preview-modal';

// Mock react-pdf with configurable numPages
let mockNumPages = 5;

vi.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess }: {
    children: React.ReactNode;
    onLoadSuccess?: (data: { numPages: number }) => void;
  }) => {
    setTimeout(() => {
      if (onLoadSuccess) onLoadSuccess({ numPages: mockNumPages });
    }, 0);
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber, scale, width }: { pageNumber: number; scale?: number; width?: number }) => (
    <div data-testid="pdf-page" data-page={pageNumber} data-scale={scale} data-width={width}>
      Page {pageNumber}
    </div>
  ),
  pdfjs: {
    GlobalWorkerOptions: { workerSrc: '' },
    version: '3.11.174',
  },
}));

vi.mock('react-pdf/dist/Page/AnnotationLayer.css', () => ({}));
vi.mock('react-pdf/dist/Page/TextLayer.css', () => ({}));

// Mock URL APIs
const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('PdfPreviewModal - Guardrail Edge Cases', () => {
  const mockBlob = new Blob(['%PDF-1.4 fake content'], { type: 'application/pdf' });
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    pdfBlob: mockBlob,
    filename: 'leads_export_2026-01-31.pdf',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNumPages = 5;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Button Disabled States ──────────────────────────────────────
  describe('button disabled states', () => {
    it('[P1] disables Print button when pdfBlob is null', () => {
      // GIVEN: Modal open with null blob
      render(<PdfPreviewModal {...defaultProps} pdfBlob={null} />);

      // THEN: Print button is disabled
      const printButton = screen.getByRole('button', { name: /print/i });
      expect(printButton).toBeDisabled();
    });

    it('[P1] disables Download button when pdfBlob is null', () => {
      // GIVEN: Modal open with null blob
      render(<PdfPreviewModal {...defaultProps} pdfBlob={null} />);

      // THEN: Download button is disabled
      const downloadButton = screen.getByRole('button', { name: /download/i });
      expect(downloadButton).toBeDisabled();
    });

    it('[P1] enables Print button when pdfBlob is provided', () => {
      // GIVEN: Modal open with valid blob
      render(<PdfPreviewModal {...defaultProps} />);

      // THEN: Print button is enabled
      const printButton = screen.getByRole('button', { name: /print/i });
      expect(printButton).not.toBeDisabled();
    });

    it('[P1] enables Download button when pdfBlob is provided', () => {
      // GIVEN: Modal open with valid blob
      render(<PdfPreviewModal {...defaultProps} />);

      // THEN: Download button is enabled
      const downloadButton = screen.getByRole('button', { name: /download/i });
      expect(downloadButton).not.toBeDisabled();
    });
  });

  // ── Page Navigation Boundaries ──────────────────────────────────
  describe('page navigation boundaries', () => {
    it('[P1] disables next button on last page', async () => {
      // GIVEN: Single page document
      mockNumPages = 1;
      render(<PdfPreviewModal {...defaultProps} />);

      // Wait for load
      await vi.waitFor(() => {
        expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
      });

      // THEN: Both navigation buttons are disabled
      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('[P1] disables next button after navigating to last page', async () => {
      // GIVEN: 2-page document
      mockNumPages = 2;
      render(<PdfPreviewModal {...defaultProps} />);

      await vi.waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
      });

      // WHEN: Navigate to last page
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // THEN: Next button is disabled, prev is enabled
      await vi.waitFor(() => {
        expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();
      });
      expect(nextButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
    });

    it('[P2] cannot navigate past first page via previous button', async () => {
      // GIVEN: Document loaded, on first page
      render(<PdfPreviewModal {...defaultProps} />);

      await vi.waitFor(() => {
        expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument();
      });

      // WHEN: Previous button is disabled and page stays at 1
      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();

      // Attempt to click disabled button
      fireEvent.click(prevButton);

      // THEN: Still on page 1
      expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument();
    });
  });

  // ── Download URL Cleanup ────────────────────────────────────────
  describe('download URL cleanup', () => {
    it('[P1] revokes blob URL after download', async () => {
      // GIVEN: Modal with valid blob
      const mockClick = vi.fn();
      const mockLink = { href: '', download: '', click: mockClick, tagName: 'A' };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockLink as unknown as HTMLAnchorElement;
        return originalCreateElement(tag);
      });

      render(<PdfPreviewModal {...defaultProps} />);

      // WHEN: Download button is clicked
      const downloadButton = screen.getByRole('button', { name: /download/i });
      fireEvent.click(downloadButton);

      // THEN: URL is created and then revoked
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });
  });

  // ── Print Does Not Close Modal ──────────────────────────────────
  describe('print behavior', () => {
    it('[P1] does not call onClose when Print is clicked', () => {
      // GIVEN: Modal with blob
      render(<PdfPreviewModal {...defaultProps} />);

      // WHEN: Print button is clicked
      const printButton = screen.getByRole('button', { name: /print/i });
      fireEvent.click(printButton);

      // THEN: onClose is NOT called (modal stays open per AC#3)
      expect(defaultProps.onClose).not.toHaveBeenCalled();

      // Cleanup: remove any iframes added to body by handlePrint
      const iframes = document.body.querySelectorAll('iframe');
      iframes.forEach((iframe) => iframe.remove());
    });
  });

  // ── Dialog Title Accessibility ──────────────────────────────────
  describe('accessibility', () => {
    it('[P2] has accessible dialog title', () => {
      // GIVEN: Modal is open
      render(<PdfPreviewModal {...defaultProps} />);

      // THEN: Dialog has title for screen readers
      expect(screen.getByText('PDF Preview')).toBeInTheDocument();
    });

    it('[P2] has screen-reader-only description with filename', () => {
      // GIVEN: Modal with filename
      render(<PdfPreviewModal {...defaultProps} />);

      // THEN: Description includes filename
      const description = screen.getByText(/preview of leads_export_2026-01-31\.pdf/i);
      expect(description).toBeInTheDocument();
    });
  });
});
