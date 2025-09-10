'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Invoice } from '@repo/types';
import { type InvoiceFormData } from '@/components/InvoiceForm';
import api from '@/lib/api';
import InvoiceForm from '@/components/InvoiceForm';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string } | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [extractedData, setExtractedData] = useState<Partial<Invoice> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const currentFile = event.target.files[0];
      setFile(currentFile);
      setFileInfo({ name: currentFile.name });
      setExtractedData(null);
      setPageNumber(1);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleExtract = async () => {
    if (!file || !fileInfo) {
      toast.error("Please upload a PDF first.");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { fileId } = uploadRes.data;
      const extractRes = await api.post('/extract', { fileId });
      setExtractedData({
        fileId,
        fileName: fileInfo.name,
        ...extractRes.data
      });
      toast.success("Data extracted successfully.");
    } catch (error: unknown) {
      console.error(error);
      let description = "An error occurred.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const errObj = error as { response?: { data?: { message?: string } } };
        description = errObj.response?.data?.message || description;
      }
      toast.error("Extraction Failed", {
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async (data: InvoiceFormData) => {
    try {
      await api.post('/invoices', data);
      toast.success('Invoice Saved!', {
        description: 'The new invoice has been successfully saved.',
      });
      // Reset the UI after saving
      setExtractedData(null);
      setFile(null);
      setFileInfo(null);
    } catch (error: unknown) {
      let description = 'Could not save the invoice.';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const errObj = error as { response?: { data?: { message?: string } } };
        description = errObj.response?.data?.message || description;
      }
      toast.error('Save Failed', {
        description,
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Invoice Extractor</h1>
          <Button variant="outline" asChild>
            <Link href="/invoices">View All Invoices</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PDF Uploader & Viewer */}
          <Card>
            <CardHeader>
              <CardTitle>1. Upload PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <Input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4" disabled={!!extractedData} />
              {file && (
                <div className="border rounded-lg bg-gray-100 p-2">
                  <div className="flex items-center justify-center gap-4 p-2 bg-white rounded-md shadow-sm mb-2">
                    <Button onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>Prev</Button>
                    <span>Page {pageNumber} of {numPages}</span>
                    <Button onClick={() => setPageNumber(p => Math.min(p + 1, numPages!))} disabled={pageNumber >= numPages!}>Next</Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button onClick={() => setZoom(z => z + 0.2)}>Zoom In</Button>
                    <Button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}>Zoom Out</Button>
                  </div>
                  <div className="overflow-auto h-[60vh]">
                    <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                      <Page pageNumber={pageNumber} scale={zoom} />
                    </Document>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

           {/* Extraction & Form  */}
          <Card>
            <CardHeader>
              <CardTitle>2. Extract & Verify Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExtract} disabled={!file || isLoading || !!extractedData} className="w-full mb-4">
                {isLoading ? 'Extracting...' : '✨ Extract with Gemini AI'}
              </Button>
              {extractedData ? (
                <InvoiceForm 
                  initialData={extractedData} 
                  onSave={handleSave}
                  isUpdating={false}
                />
              ) : (
                <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-gray-400">
                  <p>Extracted data will appear here...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}