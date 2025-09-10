'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Invoice } from '@repo/types';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/invoices?q=${searchTerm}`);
        setInvoices(response.data);
      } catch (error) {
        console.error('Failed to fetch invoices', error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const formatCurrency = (amount: number | undefined, currency: string | undefined = 'USD') => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Saved Invoices</h1>
          <Button asChild>
            <Link href="/">+ New Invoice</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Records</CardTitle>
            <CardDescription>Search for invoices by vendor name or invoice number.</CardDescription>
            <div className="pt-4">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Vendor</TableHead>
      <TableHead>Invoice #</TableHead>
      <TableHead>Date</TableHead>
      <TableHead className="text-right">Total</TableHead>
      <TableHead className="w-[100px]">Actions</TableHead> 
    </TableRow>
  </TableHeader>
  <TableBody>
    {isLoading ? (
      <TableRow>
        <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
      </TableRow>
    ) : invoices.length > 0 ? (
      invoices.map((invoice) => (
        <TableRow key={invoice._id}>
          <TableCell className="font-medium">{invoice.vendor.name}</TableCell>
          <TableCell><Badge variant="outline">{invoice.invoice.number}</Badge></TableCell>
          <TableCell>{new Date(invoice.invoice.date).toLocaleDateString()}</TableCell>
          <TableCell className="text-right">{formatCurrency(invoice.invoice.total, invoice.invoice.currency)}</TableCell>
          <TableCell>
            <Button asChild variant="outline" size="sm">
              <Link href={`/invoices/${invoice._id}`}>Edit</Link>
            </Button>
          </TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={5} className="h-24 text-center">No invoices found.</TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}