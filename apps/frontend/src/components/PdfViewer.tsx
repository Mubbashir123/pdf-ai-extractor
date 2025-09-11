'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;

export interface PdfViewerProps {
  file: File | null;
  pageNumber: number;
  numPages: number | null;
  zoom: number;
  setPageNumber: (page: number) => void;
  setNumPages: (pages: number) => void;
  setZoom: (zoom: number) => void;
}

export default function PdfViewer({
  file,
  pageNumber,
  numPages,
  zoom,
  setPageNumber,
  setNumPages,
  setZoom,
}: PdfViewerProps) {
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="border rounded-lg bg-gray-100 p-2">
      <div className="flex items-center justify-center gap-4 p-2 bg-white rounded-md shadow-sm mb-2">
        <Button onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))} disabled={pageNumber <= 1}>Prev</Button>
        <span>Page {pageNumber} of {numPages}</span>
        <Button onClick={() => setPageNumber(Math.min(pageNumber + 1, numPages!))} disabled={!!numPages && pageNumber >= numPages}>Next</Button>
        <Separator orientation="vertical" className="h-6" />
        <Button onClick={() => setZoom(zoom + 0.2)}>Zoom In</Button>
        <Button onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>Zoom Out</Button>
      </div>
      <div className="overflow-auto h-[60vh]">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} scale={zoom} />
        </Document>
      </div>
    </div>
  );
}

