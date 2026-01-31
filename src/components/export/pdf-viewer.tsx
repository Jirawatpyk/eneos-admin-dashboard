'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Skeleton } from '@/components/ui/skeleton';

// Configure PDF.js worker - local file avoids CSP and CDN availability issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  file: Blob | null;
  pageNumber: number;
  scale: number | undefined;
  width: number | undefined;
  onLoadSuccess: (data: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
}

function PdfLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 p-8" data-testid="pdf-loading">
      <Skeleton className="h-[600px] w-[450px] rounded-md" />
    </div>
  );
}

function PdfErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center" data-testid="pdf-error">
      <p className="text-sm text-destructive">{error}</p>
      <p className="text-xs text-muted-foreground">Try exporting as Excel or CSV instead.</p>
    </div>
  );
}

export function PdfViewer({
  file,
  pageNumber,
  scale,
  width,
  onLoadSuccess,
  onLoadError,
}: PdfViewerProps) {
  if (!file) {
    return <PdfErrorState error="No PDF file to display." />;
  }

  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      loading={<PdfLoadingSkeleton />}
      error={<PdfErrorState error="Failed to load PDF document." />}
    >
      <Page
        pageNumber={pageNumber}
        scale={scale}
        width={width}
        loading={<PdfLoadingSkeleton />}
        renderTextLayer
        renderAnnotationLayer
      />
    </Document>
  );
}
