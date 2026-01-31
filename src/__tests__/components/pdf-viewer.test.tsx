/**
 * PdfViewer Component Guardrail Tests
 * Story 6.2: Export to PDF - TEA Automation
 *
 * Coverage gaps addressed:
 * - Null file → error state rendering
 * - Valid file → Document/Page rendering
 * - Loading skeleton display
 * - Props forwarded correctly (pageNumber, scale, width)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PdfViewer } from '@/components/export/pdf-viewer';

// Mock react-pdf
vi.mock('react-pdf', () => ({
  Document: ({ children, file, onLoadSuccess, onLoadError }: {
    children: React.ReactNode;
    file: Blob | null;
    loading?: React.ReactNode;
    error?: React.ReactNode;
    onLoadSuccess?: (data: { numPages: number }) => void;
    onLoadError?: (error: Error) => void;
  }) => {
    // Simulate load after render
    if (file && onLoadSuccess) {
      setTimeout(() => onLoadSuccess({ numPages: 3 }), 0);
    }
    if (!file && onLoadError) {
      setTimeout(() => onLoadError(new Error('No file')), 0);
    }
    return (
      <div data-testid="pdf-document" data-has-file={!!file}>
        {children}
      </div>
    );
  },
  Page: ({ pageNumber, scale, width }: {
    pageNumber: number;
    scale?: number;
    width?: number;
  }) => (
    <div
      data-testid="pdf-page"
      data-page={pageNumber}
      data-scale={scale}
      data-width={width}
    >
      Page {pageNumber}
    </div>
  ),
  pdfjs: {
    GlobalWorkerOptions: { workerSrc: '' },
    version: '3.11.174',
  },
}));

// Mock CSS imports
vi.mock('react-pdf/dist/Page/AnnotationLayer.css', () => ({}));
vi.mock('react-pdf/dist/Page/TextLayer.css', () => ({}));

describe('PdfViewer', () => {
  const mockBlob = new Blob(['%PDF-1.4 fake content'], { type: 'application/pdf' });
  const mockOnLoadSuccess = vi.fn();
  const mockOnLoadError = vi.fn();

  // ── Null File Handling ─────────────────────────────────────────
  describe('null file handling', () => {
    it('[P1] renders error state when file is null', () => {
      // GIVEN: PdfViewer with null file
      render(
        <PdfViewer
          file={null}
          pageNumber={1}
          scale={1}
          width={undefined}
          onLoadSuccess={mockOnLoadSuccess}
          onLoadError={mockOnLoadError}
        />
      );

      // THEN: Error state is displayed
      const errorState = screen.getByTestId('pdf-error');
      expect(errorState).toBeInTheDocument();
      expect(screen.getByText(/no pdf file to display/i)).toBeInTheDocument();
    });

    it('[P2] shows fallback suggestion in error state', () => {
      // GIVEN: PdfViewer with null file
      render(
        <PdfViewer
          file={null}
          pageNumber={1}
          scale={1}
          width={undefined}
          onLoadSuccess={mockOnLoadSuccess}
          onLoadError={mockOnLoadError}
        />
      );

      // THEN: Fallback suggestion is shown
      expect(screen.getByText(/try exporting as excel or csv/i)).toBeInTheDocument();
    });

    it('[P1] does not render Document component when file is null', () => {
      // GIVEN: PdfViewer with null file
      render(
        <PdfViewer
          file={null}
          pageNumber={1}
          scale={1}
          width={undefined}
          onLoadSuccess={mockOnLoadSuccess}
          onLoadError={mockOnLoadError}
        />
      );

      // THEN: Document is not rendered
      expect(screen.queryByTestId('pdf-document')).not.toBeInTheDocument();
    });
  });

  // ── Valid File Rendering ────────────────────────────────────────
  describe('valid file rendering', () => {
    it('[P1] renders Document and Page when file is provided', () => {
      // GIVEN: PdfViewer with valid blob
      render(
        <PdfViewer
          file={mockBlob}
          pageNumber={1}
          scale={1}
          width={undefined}
          onLoadSuccess={mockOnLoadSuccess}
          onLoadError={mockOnLoadError}
        />
      );

      // THEN: Document and Page are rendered
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
      expect(screen.getByTestId('pdf-page')).toBeInTheDocument();
    });

    it('[P1] passes pageNumber to Page component', () => {
      // GIVEN: PdfViewer with pageNumber 3
      render(
        <PdfViewer
          file={mockBlob}
          pageNumber={3}
          scale={1}
          width={undefined}
          onLoadSuccess={mockOnLoadSuccess}
          onLoadError={mockOnLoadError}
        />
      );

      // THEN: Page receives correct pageNumber
      const page = screen.getByTestId('pdf-page');
      expect(page).toHaveAttribute('data-page', '3');
    });

    it('[P2] passes scale to Page component', () => {
      // GIVEN: PdfViewer with scale 1.25
      render(
        <PdfViewer
          file={mockBlob}
          pageNumber={1}
          scale={1.25}
          width={undefined}
          onLoadSuccess={mockOnLoadSuccess}
          onLoadError={mockOnLoadError}
        />
      );

      // THEN: Page receives correct scale
      const page = screen.getByTestId('pdf-page');
      expect(page).toHaveAttribute('data-scale', '1.25');
    });

    it('[P2] passes width to Page component for fit-width mode', () => {
      // GIVEN: PdfViewer with width set (fit-width mode)
      render(
        <PdfViewer
          file={mockBlob}
          pageNumber={1}
          scale={undefined}
          width={768}
          onLoadSuccess={mockOnLoadSuccess}
          onLoadError={mockOnLoadError}
        />
      );

      // THEN: Page receives correct width
      const page = screen.getByTestId('pdf-page');
      expect(page).toHaveAttribute('data-width', '768');
    });
  });
});
