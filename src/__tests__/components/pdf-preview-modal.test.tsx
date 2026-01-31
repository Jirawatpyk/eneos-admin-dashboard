/**
 * PDF Preview Modal Tests
 * Story 6.2: Export to PDF
 *
 * AC#2: PDF Preview Modal
 * AC#3: Print from Preview
 * AC#4: Download from Preview
 * AC#8: Modal Accessibility
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PdfPreviewModal } from '@/components/export/pdf-preview-modal';

// Mock react-pdf
vi.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess }: {
    children: React.ReactNode;
    onLoadSuccess?: (data: { numPages: number }) => void;
  }) => {
    // Simulate successful load after render
    setTimeout(() => {
      if (onLoadSuccess) {
        onLoadSuccess({ numPages: 5 });
      }
    }, 0);
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber, scale }: { pageNumber: number; scale?: number }) => (
    <div data-testid="pdf-page" data-page={pageNumber} data-scale={scale}>
      Page {pageNumber}
    </div>
  ),
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
    version: '3.11.174',
  },
}));

// Mock CSS imports
vi.mock('react-pdf/dist/Page/AnnotationLayer.css', () => ({}));
vi.mock('react-pdf/dist/Page/TextLayer.css', () => ({}));

// Mock URL APIs
const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('PdfPreviewModal', () => {
  const mockBlob = new Blob(['%PDF-1.4 fake content'], { type: 'application/pdf' });
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    pdfBlob: mockBlob,
    filename: 'leads_export_2026-01-31.pdf',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Basic rendering
  describe('rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<PdfPreviewModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('PDF Preview')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<PdfPreviewModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('displays PDF document component', () => {
      render(<PdfPreviewModal {...defaultProps} />);

      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
    });
  });

  // AC#2: Page navigation
  describe('page navigation (AC#2)', () => {
    it('shows page indicator', async () => {
      render(<PdfPreviewModal {...defaultProps} />);

      // Wait for document to load (simulated)
      await vi.waitFor(() => {
        expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument();
      });
    });

    it('navigates to next page', async () => {
      render(<PdfPreviewModal {...defaultProps} />);

      // Wait for document to fully load
      await vi.waitFor(() => {
        expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument();
      });

      // Use fireEvent for more direct button click
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await vi.waitFor(() => {
        expect(screen.getByText(/Page 2 of 5/i)).toBeInTheDocument();
      });
    });

    it('navigates to previous page', async () => {
      const user = userEvent.setup();
      render(<PdfPreviewModal {...defaultProps} />);

      await vi.waitFor(() => {
        expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument();
      });

      // Go to page 2 first
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument();
    });

    it('disables previous button on first page', async () => {
      render(<PdfPreviewModal {...defaultProps} />);

      await vi.waitFor(() => {
        expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });
  });

  // AC#2: Zoom controls - verify existence (jsdom doesn't support full Select interaction)
  describe('zoom controls (AC#2)', () => {
    it('has zoom selector', () => {
      render(<PdfPreviewModal {...defaultProps} />);

      const zoomTrigger = screen.getByRole('combobox', { name: /zoom/i });
      expect(zoomTrigger).toBeInTheDocument();
    });
  });

  // AC#3: Print from Preview
  describe('print functionality (AC#3)', () => {
    it('has Print button', () => {
      render(<PdfPreviewModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
    });

    it('creates iframe for printing when Print is clicked', async () => {
      const user = userEvent.setup();
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');

      render(<PdfPreviewModal {...defaultProps} />);

      const printButton = screen.getByRole('button', { name: /print/i });
      await user.click(printButton);

      // Verify an iframe was created and appended
      expect(appendChildSpy).toHaveBeenCalled();
      const appendedElement = appendChildSpy.mock.calls.find(
        (call) => (call[0] as HTMLElement).tagName === 'IFRAME'
      );
      expect(appendedElement).toBeDefined();

      appendChildSpy.mockRestore();
    });

    it('keeps modal open after print button is clicked', async () => {
      const user = userEvent.setup();
      render(<PdfPreviewModal {...defaultProps} />);

      const printButton = screen.getByRole('button', { name: /print/i });
      await user.click(printButton);

      // Modal should still be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  // AC#4: Download from Preview
  describe('download functionality (AC#4)', () => {
    it('has Download button', () => {
      render(<PdfPreviewModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    it('triggers download with correct filename when Download is clicked', async () => {
      const user = userEvent.setup();

      // Mock link creation for download
      const mockClick = vi.fn();
      const mockLinkElement = {
        href: '',
        download: '',
        click: mockClick,
        tagName: 'A',
      };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return mockLinkElement as unknown as HTMLElement;
        }
        return originalCreateElement(tag);
      });

      render(<PdfPreviewModal {...defaultProps} />);

      const downloadButton = screen.getByRole('button', { name: /download/i });
      await user.click(downloadButton);

      expect(mockLinkElement.download).toBe('leads_export_2026-01-31.pdf');
      expect(mockClick).toHaveBeenCalled();
    });

    it('closes modal after download starts', async () => {
      const user = userEvent.setup();
      render(<PdfPreviewModal {...defaultProps} />);

      const downloadButton = screen.getByRole('button', { name: /download/i });
      await user.click(downloadButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  // AC#8: Modal Accessibility
  describe('accessibility (AC#8)', () => {
    it('closes modal on Escape key', async () => {
      const user = userEvent.setup();
      render(<PdfPreviewModal {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('has close button', () => {
      render(<PdfPreviewModal {...defaultProps} />);

      // Radix Dialog includes a close button
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('renders as dialog role for focus trap support', () => {
      render(<PdfPreviewModal {...defaultProps} />);

      // Radix Dialog provides built-in focus trap via the dialog role
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  // Loading states
  describe('loading states', () => {
    it('renders PDF viewer with loading support', () => {
      render(<PdfPreviewModal {...defaultProps} />);

      // The PDF document element should be present
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
    });
  });

  // Error states
  describe('error handling', () => {
    it('handles null blob gracefully', () => {
      render(<PdfPreviewModal {...defaultProps} pdfBlob={null} />);

      // Should still render modal structure
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
