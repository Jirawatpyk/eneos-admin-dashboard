'use client';

import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PdfViewer } from '@/components/export/pdf-viewer';

type ZoomLevel = '0.75' | '1' | '1.25' | 'width';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  filename: string;
}

export function PdfPreviewModal({
  isOpen,
  onClose,
  pdfBlob,
  filename,
}: PdfPreviewModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<ZoomLevel>('1');
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const handleLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  }, []);

  const handleLoadError = useCallback((error: Error) => {
    console.error('[PdfPreviewModal] PDF load failed:', error.message);
    setNumPages(0);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(numPages, prev + 1));
  }, [numPages]);

  const handleDownload = useCallback(() => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    // AC#4: Close modal after download starts
    onClose();
  }, [pdfBlob, filename, onClose]);

  const handlePrint = useCallback(() => {
    if (!pdfBlob) return;

    // AC#3: Iframe technique for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const blobUrl = URL.createObjectURL(pdfBlob);

    const cleanup = () => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      URL.revokeObjectURL(blobUrl);
    };

    iframe.onerror = cleanup;

    iframe.onload = () => {
      iframe.contentWindow?.print();
      // Use afterprint event for proper lifecycle, fallback to timeout
      if (iframe.contentWindow) {
        iframe.contentWindow.addEventListener('afterprint', cleanup);
        // Fallback for browsers that don't fire afterprint
        setTimeout(cleanup, 60000);
      } else {
        setTimeout(cleanup, 1000);
      }
    };

    iframe.src = blobUrl;
    // AC#3: Modal remains open after print dialog closes
  }, [pdfBlob]);

  // Calculate scale based on zoom selection
  const getScale = (): number | undefined => {
    if (zoom === 'width') return undefined;
    return Number(zoom);
  };

  // Calculate width for "Fit Width" mode using actual container width
  const getWidth = (): number | undefined => {
    if (zoom === 'width') {
      const containerWidth = viewerContainerRef.current?.clientWidth;
      return containerWidth ? containerWidth - 32 : 800; // minus padding, fallback 800
    }
    return undefined;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-w-4xl flex-col h-[90vh]">
        <DialogHeader>
          <DialogTitle>PDF Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Preview of {filename}
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b pb-2">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[100px] text-center text-sm">
              Page {currentPage} of {numPages || '...'}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <Select
            value={zoom}
            onValueChange={(value) => setZoom(value as ZoomLevel)}
          >
            <SelectTrigger className="w-[130px]" aria-label="Zoom level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.75">75%</SelectItem>
              <SelectItem value="1">100%</SelectItem>
              <SelectItem value="1.25">125%</SelectItem>
              <SelectItem value="width">Fit Width</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PDF Viewer */}
        <div ref={viewerContainerRef} className="flex-1 overflow-auto flex justify-center bg-muted/30 rounded-md">
          <PdfViewer
            file={pdfBlob}
            pageNumber={currentPage}
            scale={getScale()}
            width={getWidth()}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
          />
        </div>

        {/* Footer Actions */}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handlePrint} disabled={!pdfBlob}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} disabled={!pdfBlob}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
