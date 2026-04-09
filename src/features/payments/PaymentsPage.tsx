import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, CreditCard, ArrowDownCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import paymentsService from '@/services/payments.service';
import partiesService from '@/services/parties.service';
import { confirmDelete } from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { PageLoader, ButtonSpinner } from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import FormField, { Input, Select, Textarea } from '@/components/common/FormField';
import { parseApiError } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/lib/utils';
import type { Payment } from '@/types';
import dayjs from 'dayjs';

// Backend PaymentMethod enum values
const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },  // backend: bank_transfer
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

const paymentSchema = z.object({
  party_id: z.number().min(1, 'Select a party'),
  payment_date: z.string().min(1, 'Date is required'),       // backend: payment_date
  payment_method: z.enum(                                     // backend: payment_method
    ['cash', 'upi', 'bank_transfer', 'cheque', 'other'] as const,
  ),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  invoice_id: z.number().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  // UI-only type filter — not sent to backend
  const [typeFilter, setTypeFilter] = useState<'all' | 'customer' | 'supplier'>('all');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', search],
    queryFn: async () => {
      const res = await paymentsService.list({ search });
      return res.data.data as Payment[];
    },
  });

  const { data: parties = [] } = useQuery({
    queryKey: ['parties'],
    queryFn: async () => {
      const res = await partiesService.list();
      return res.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_method: 'cash',
      payment_date: dayjs().format('YYYY-MM-DD'),
    },
  });

  const createMutation = useMutation({
    mutationFn: paymentsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Payment recorded successfully');
      reset({
        payment_method: 'cash',
        payment_date: dayjs().format('YYYY-MM-DD'),
      });
      setShowForm(false);
    },
    onError: (err) => {
      const apiErr = parseApiError(err);
      toast.error(apiErr.message);
      if (apiErr.errors) {
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          setError(field as keyof PaymentFormValues, { message: msgs[0] });
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: paymentsService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment deleted');
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const onSubmit = (values: PaymentFormValues) => createMutation.mutate(values);

  const handleDelete = async (payment: Payment) => {
    const ok = await confirmDelete(`payment of ${formatCurrency(payment.amount)}`);
    if (ok) deleteMutation.mutate(payment.id);
  };

  const partyOptions = parties.map((p) => ({ value: p.id, label: p.name }));

  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="pb-24">
      <PageHeader
        title="Payments"
        subtitle={`Total recorded: ${formatCurrency(totalAmount)}`}
        backPath={ROUTES.DASHBOARD}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 active:scale-95 transition-colors"
          >
            <Plus size={16} />
            Add
          </button>
        }
      />

      <div className="px-4 pt-2 pb-3 space-y-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search payments..." />
        {/* UI-only filter */}
        <div className="flex gap-2">
          {(['all', 'customer', 'supplier'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Add Payment Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-4 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Record Payment</h3>
              <button
                onClick={() => { setShowForm(false); reset(); }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              {/* Party — REQUIRED by backend */}
              <FormField label="Party" required error={errors.party_id?.message}>
                <Select
                  {...register('party_id', { valueAsNumber: true })}
                  options={partyOptions}
                  placeholder="Select customer / supplier..."
                  error={Boolean(errors.party_id)}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Amount (₹)" required error={errors.amount?.message}>
                  <Input
                    {...register('amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={Boolean(errors.amount)}
                  />
                </FormField>

                {/* payment_date — backend field name */}
                <FormField label="Date" required error={errors.payment_date?.message}>
                  <Input
                    {...register('payment_date')}
                    type="date"
                    error={Boolean(errors.payment_date)}
                  />
                </FormField>
              </div>

              {/* payment_method — backend field name */}
              <FormField label="Payment Method" required error={errors.payment_method?.message}>
                <Select
                  {...register('payment_method')}
                  options={PAYMENT_METHODS}
                  error={Boolean(errors.payment_method)}
                />
              </FormField>

              <FormField label="Reference / UTR" error={errors.reference_number?.message}>
                <Input
                  {...register('reference_number')}
                  placeholder="Reference number (optional)"
                />
              </FormField>

              <FormField label="Notes" error={errors.notes?.message}>
                <Textarea {...register('notes')} placeholder="Optional notes..." rows={2} />
              </FormField>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending && <ButtonSpinner />}
                Record Payment
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {isLoading ? (
        <PageLoader />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={32} />}
          title="No payments yet"
          description="Record payments received from customers or paid to suppliers."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl"
            >
              Add Payment
            </button>
          }
        />
      ) : (
        <div className="px-4 space-y-2">
          {payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onDelete={() => handleDelete(payment)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentCard({
  payment,
  onDelete,
}: {
  payment: Payment;
  onDelete: () => void;
}) {
  const methodLabel: Record<string, string> = {
    cash: 'Cash',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    other: 'Other',
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
            <ArrowDownCircle size={18} className="text-green-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {payment.party?.name ?? 'Unknown Party'}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge variant="success">Payment</Badge>
              <span className="text-xs text-gray-400 capitalize">
                {methodLabel[payment.payment_method as string] ?? payment.payment_method}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {dayjs(payment.payment_date).format('D MMM YYYY')}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p className="text-base font-bold text-green-600 dark:text-green-400">
            +{formatCurrency(payment.amount)}
          </p>
          {payment.reference_number && (
            <span className="text-xs text-gray-400 font-mono">
              {payment.reference_number}
            </span>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
