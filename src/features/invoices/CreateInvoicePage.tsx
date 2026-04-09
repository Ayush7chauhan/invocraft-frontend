import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Receipt, Package } from 'lucide-react';
import invoicesService from '@/services/invoices.service';
import productsService from '@/services/products.service';
import partiesService from '@/services/parties.service';
import PageHeader from '@/components/common/PageHeader';
import FormField, { Input, Select, Textarea } from '@/components/common/FormField';
import { ButtonSpinner } from '@/components/common/LoadingSpinner';
import { parseApiError } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import dayjs from 'dayjs';

// ── Schema — matches backend StoreInvoiceRequest ───────────────────────────────
// Backend: party_id (required), invoice_date (required), discount, paid_amount, notes
// Items:   product_id (required), quantity (required, min:1), unit_price (required), tax_rate

const invoiceItemSchema = z.object({
  product_id: z.number().min(1, 'Select a product'),
  // name is display-only, not sent to API
  name: z.string().optional(),
  quantity: z.number().min(1, 'Qty must be ≥ 1'),
  unit_price: z.number().min(0, 'Price cannot be negative'),
  tax_rate: z.number().min(0).max(100).optional(),
  // total is display-only
  total: z.number().optional(),
});

const createInvoiceSchema = z.object({
  party_id: z.number().min(1, 'Select a customer or supplier'),   // required by backend
  invoice_date: z.string().min(1, 'Date is required'),            // backend: invoice_date
  items: z.array(invoiceItemSchema).min(1, 'Add at least one item'),
  discount: z.number().min(0).optional(),                         // backend: discount
  paid_amount: z.number().min(0),
  notes: z.string().optional(),
});

type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showProductSearch, setShowProductSearch] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');

  // ── Data ──────────────────────────────────────────────────────────────────────

  const { data: parties = [] } = useQuery({
    queryKey: ['parties'],
    queryFn: async () => {
      const res = await partiesService.list();
      return res.data.data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', productSearch],
    queryFn: async () => {
      const res = await productsService.list({ search: productSearch });
      return res.data.data as Product[];
    },
    enabled: showProductSearch !== null,
  });

  // ── Form ──────────────────────────────────────────────────────────────────────

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      invoice_date: dayjs().format('YYYY-MM-DD'),
      paid_amount: 0,
      items: [{ product_id: 0, name: '', quantity: 1, unit_price: 0, total: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const items = watch('items');
  const discountAmt = watch('discount') ?? 0;
  const paidAmount = watch('paid_amount') ?? 0;

  // ── Computed totals ───────────────────────────────────────────────────────────

  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const tax = Number(item.tax_rate) || 0;
    return sum + qty * price * (1 + tax / 100);
  }, 0);

  const totalAmount = Math.max(0, subtotal - Number(discountAmt));
  const dueAmount = Math.max(0, totalAmount - Number(paidAmount));

  // ── Update item total on change ───────────────────────────────────────────────

  const updateItemTotal = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item) return;
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const tax = Number(item.tax_rate) || 0;
      const total = qty * price * (1 + tax / 100);
      setValue(`items.${index}.total`, parseFloat(total.toFixed(2)));
    },
    [items, setValue],
  );

  // ── Select a product for an item ─────────────────────────────────────────────

  const selectProduct = (product: Product, index: number) => {
    setValue(`items.${index}.product_id`, product.id);
    setValue(`items.${index}.name`, product.name);
    setValue(`items.${index}.unit_price`, product.selling_price);
    setValue(`items.${index}.quantity`, 1);
    setValue(`items.${index}.tax_rate`, Number(product.tax_rate ?? 0));
    setValue(`items.${index}.total`, product.selling_price);
    setShowProductSearch(null);
    setProductSearch('');
  };

  // ── Mutation ──────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: invoicesService.create,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Invoice #${res.data.data.invoice_number} created!`);
      navigate(ROUTES.INVOICES);
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const onSubmit = (values: CreateInvoiceFormValues) => {
    // Strip display-only fields before sending to API
    const payload = {
      party_id: values.party_id,
      invoice_date: values.invoice_date,
      discount: Number(values.discount) || 0,
      paid_amount: Number(values.paid_amount) || 0,
      notes: values.notes,
      items: values.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
      })),
    };
    createMutation.mutate(payload);
  };

  const partyOptions = parties.map((p) => ({ value: p.id, label: p.name }));

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="pb-32">
      <PageHeader title="Create Invoice" backPath={ROUTES.INVOICES} />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-4 space-y-4">
        {/* Party + Date */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Invoice Details</h3>

          <FormField label="Customer / Supplier" required error={errors.party_id?.message}>
            <Select
              {...register('party_id', { valueAsNumber: true })}
              options={partyOptions}
              placeholder="Select party..."
              error={Boolean(errors.party_id)}
            />
          </FormField>

          <FormField label="Invoice Date" required error={errors.invoice_date?.message}>
            <Input
              {...register('invoice_date')}
              type="date"
              error={Boolean(errors.invoice_date)}
            />
          </FormField>
        </div>

        {/* Items */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Items ({fields.length})
            </h3>
            <button
              type="button"
              onClick={() => append({ product_id: 0, name: '', quantity: 1, unit_price: 0, tax_rate: 0, total: 0 })}
              className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium"
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 space-y-3">
                {/* Product search */}
                <div className="relative">
                  <FormField label={`Item ${index + 1}`} error={errors.items?.[index]?.product_id?.message}>
                    <div className="flex gap-2">
                      <div className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 truncate">
                        {items[index]?.name || (
                          <span className="text-gray-400">No product selected</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowProductSearch(showProductSearch === index ? null : index)}
                        className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="Search products"
                      >
                        <Package size={16} />
                      </button>
                    </div>
                  </FormField>

                  {/* Product search dropdown */}
                  {showProductSearch === index && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border-b border-gray-100 dark:border-gray-700 outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {products.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-gray-400">No products found</p>
                        ) : (
                          products.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => selectProduct(product, index)}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(product.selling_price)} · Stock: {product.stock_quantity}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Qty, Price, Tax */}
                <div className="grid grid-cols-3 gap-2">
                  <FormField label="Qty" error={errors.items?.[index]?.quantity?.message}>
                    <Input
                      {...register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                        onChange: () => updateItemTotal(index),
                      })}
                      type="number"
                      step="1"
                      min={1}
                      placeholder="1"
                      error={Boolean(errors.items?.[index]?.quantity)}
                    />
                  </FormField>
                  <FormField label="Price (₹)" error={errors.items?.[index]?.unit_price?.message}>
                    <Input
                      {...register(`items.${index}.unit_price`, {
                        valueAsNumber: true,
                        onChange: () => updateItemTotal(index),
                      })}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      error={Boolean(errors.items?.[index]?.unit_price)}
                    />
                  </FormField>
                  <FormField label="Tax %">
                    <Input
                      {...register(`items.${index}.tax_rate`, {
                        valueAsNumber: true,
                        onChange: () => updateItemTotal(index),
                      })}
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      placeholder="0"
                    />
                  </FormField>
                </div>

                {/* Row total + remove */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Total: {formatCurrency(items[index]?.total ?? 0)}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal bar */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>
        </div>

        {errors.items?.root && (
          <p className="text-sm text-red-600 text-center">{errors.items.root.message}</p>
        )}

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            <Receipt size={16} className="inline-block mr-2 text-green-600" />
            Payment
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Discount (₹)" error={errors.discount?.message}>
              <Input
                {...register('discount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Paid Amount (₹)" required error={errors.paid_amount?.message}>
              <Input
                {...register('paid_amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                error={Boolean(errors.paid_amount)}
              />
            </FormField>
          </div>

          {/* Summary */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
            {Number(discountAmt) > 0 && (
              <SummaryRow label="Discount" value={`-${formatCurrency(Number(discountAmt))}`} className="text-red-600 dark:text-red-400" />
            )}
            <SummaryRow label="Total" value={formatCurrency(totalAmount)} bold />
            <SummaryRow label="Paid" value={formatCurrency(Number(paidAmount))} className="text-green-600 dark:text-green-400" />
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Due Amount</span>
              <span className={`text-base font-bold ${dueAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {formatCurrency(dueAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <FormField label="Notes" error={errors.notes?.message}>
            <Textarea {...register('notes')} placeholder="Add any notes to the invoice..." rows={3} />
          </FormField>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          {createMutation.isPending && <ButtonSpinner />}
          <Receipt size={18} />
          Create Invoice · {formatCurrency(totalAmount)}
        </button>

        {dueAmount > 0 && (
          <p className="text-xs text-gray-400 text-center">
            {formatCurrency(dueAmount)} will be pending from customer
          </p>
        )}
      </form>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
  className = '',
}: {
  label: string;
  value: string;
  bold?: boolean;
  className?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </span>
      <span className={`text-sm font-semibold ${className || (bold ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200')}`}>
        {value}
      </span>
    </div>
  );
}
