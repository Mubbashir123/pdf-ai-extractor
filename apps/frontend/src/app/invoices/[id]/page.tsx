'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Invoice } from '@repo/types';
import { type InvoiceFormData } from '@/components/InvoiceForm';
import api from '@/lib/api';

import InvoiceForm from '@/components/InvoiceForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchInvoice = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/invoices/${id}`);
          setInvoice(response.data);
        } catch (error) {
          console.error("Failed to fetch invoice", error);
          toast.error("Failed to load invoice data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [id]);

  // UPDATING
  const handleUpdate = async (data: InvoiceFormData) => {
    try {
      await api.put(`/invoices/${id}`, data);
      toast.success("Invoice updated successfully!");
      router.push('/invoices');
    } catch (error) {
      toast.error("Failed to update invoice.");
      console.error(error);
    }
  };

  // DELETING the invoice
  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${id}`);
      toast.success("Invoice deleted successfully!");
      router.push('/invoices');
    } catch (error) {
      toast.error("Failed to delete invoice.");
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!invoice) {
    return <div className="p-8 text-center">Invoice not found.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/invoices">← Back to All Invoices</Link>
          </Button>
        </div>
        
        
        <InvoiceForm
          initialData={invoice}
          onSave={handleUpdate}
          isUpdating={true} 
        />

        <div className="mt-6 border-t pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Invoice</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this invoice record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </main>
  );
}