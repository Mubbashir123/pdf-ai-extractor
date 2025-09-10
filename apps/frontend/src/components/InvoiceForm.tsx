'use client';

import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Resolver,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ---------------- Schema ----------------
const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(0, 'Quantity must be positive'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be positive'),
  total: z.coerce.number().optional(),
});

const invoiceSchema = z.object({
  _id: z.string().optional(),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  vendor: z.object({
    name: z.string().min(1, 'Vendor name is required'),
    address: z.string().optional(),
  }),
  invoice: z.object({
    number: z.string().min(1, 'Invoice number is required'),
    date: z.string().min(1, 'Invoice date is required'),
    lineItems: z.array(lineItemSchema),
  }),
});

// ✅ Schema type
 export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// ---------------- Props ----------------
interface InvoiceFormProps {
  initialData: Partial<InvoiceFormData>;
  onSave: (data: InvoiceFormData) => void;
  isUpdating?: boolean;
}

// ---------------- Component ----------------
export default function InvoiceForm({
  initialData,
  onSave,
  isUpdating = false,
}: InvoiceFormProps) {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormData>,
    defaultValues: {
      _id: initialData._id ?? undefined,
      fileId: initialData.fileId ?? undefined,
      fileName: initialData.fileName ?? undefined,
      vendor: {
        name: initialData.vendor?.name ?? '',
        address: initialData.vendor?.address ?? '',
      },
      invoice: {
        number: initialData.invoice?.number ?? '',
        date: initialData.invoice?.date ?? '',
        lineItems: initialData.invoice?.lineItems ?? [],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'invoice.lineItems',
  });

  const onSubmit: SubmitHandler<InvoiceFormData> = (data) => {
    onSave(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isUpdating ? 'Edit Invoice' : 'Verify Extracted Data'}
          </CardTitle>
          <CardDescription>Correct any fields before saving.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Vendor */}
          <div className="space-y-2">
            <h3 className="font-semibold">Vendor</h3>
            <div>
              <Label htmlFor="vendor.name">Vendor Name</Label>
              <Input id="vendor.name" {...form.register('vendor.name')} />
              {form.formState.errors.vendor?.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.vendor.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="vendor.address">Address</Label>
              <Input id="vendor.address" {...form.register('vendor.address')} />
            </div>
          </div>

          {/* Invoice */}
          <div className="space-y-2">
            <h3 className="font-semibold">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice.number">Invoice Number</Label>
                <Input id="invoice.number" {...form.register('invoice.number')} />
                {form.formState.errors.invoice?.number && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.invoice.number.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="invoice.date">Invoice Date</Label>
                <Input id="invoice.date" {...form.register('invoice.date')} />
                {form.formState.errors.invoice?.date && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.invoice.date.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="font-semibold mb-2">Line Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="w-[120px]">Unit Price</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input
                        {...form.register(
                          `invoice.lineItems.${index}.description`
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="any"
                        {...form.register(
                          `invoice.lineItems.${index}.quantity`,
                          { valueAsNumber: true }
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="any"
                        {...form.register(
                          `invoice.lineItems.${index}.unitPrice`,
                          { valueAsNumber: true }
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        X
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                append({
                  description: '',
                  quantity: 1,
                  unitPrice: 0,
                  total: 0,
                })
              }
            >
              Add Line Item
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit">
            {isUpdating ? 'Update Invoice' : 'Save Invoice'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
