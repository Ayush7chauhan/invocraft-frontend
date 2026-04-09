import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, TrendingDown, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import expensesService from '@/services/expenses.service';
import { confirmDelete } from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { PageLoader, ButtonSpinner } from '@/components/common/LoadingSpinner';
import FormField, { Input, Select, Textarea } from '@/components/common/FormField';
import { parseApiError } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/lib/utils';
import type { Expense } from '@/types';
import dayjs from 'dayjs';

// Backend PaymentMethod values — bank_transfer not bank
const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

const EXPENSE_CATEGORIES = [
  'Rent', 'Electricity', 'Staff Salary', 'Transport', 'Purchases',
  'Marketing', 'Maintenance', 'Other',
].map((c) => ({ value: c, label: c }));

// ── Schema — must match backend StoreExpenseRequest ───────────────────────────
const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().min(0.01, 'Amount must be > 0'),
  expense_date: z.string().min(1, 'Date is required'),          // backend: expense_date
  category: z.string().optional(),
  payment_method: z.enum(
    ['cash', 'upi', 'bank_transfer', 'cheque', 'other'] as const,
  ).optional(),
  reference_number: z.string().optional(),
  note: z.string().optional(),                                   // backend: note (not notes)
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', search],
    queryFn: async () => {
      const res = await expensesService.list({ search });
      return res.data.data as Expense[];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_date: dayjs().format('YYYY-MM-DD'),
      payment_method: 'cash',
    },
  });

  const createMutation = useMutation({
    mutationFn: expensesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Expense added');
      reset({ expense_date: dayjs().format('YYYY-MM-DD'), payment_method: 'cash' });
      setShowForm(false);
    },
    onError: (err) => {
      const apiErr = parseApiError(err);
      toast.error(apiErr.message);
      if (apiErr.errors) {
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          setError(field as keyof ExpenseFormValues, { message: msgs[0] });
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExpenseFormValues> }) =>
      expensesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated');
      setEditing(null);
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: expensesService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Expense deleted');
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const onSubmit = (values: ExpenseFormValues) => {
    if (editing) updateMutation.mutate({ id: editing.id, data: values });
    else createMutation.mutate(values);
  };

  const handleEdit = (expense: Expense) => {
    setEditing(expense);
    reset({
      title: expense.title,
      amount: expense.amount,
      expense_date: dayjs(expense.expense_date).format('YYYY-MM-DD'),
      category: expense.category ?? '',
      payment_method: expense.payment_method,
      reference_number: expense.reference_number ?? '',
      note: expense.note ?? '',
    });
    setShowForm(true);
  };

  const handleDelete = async (expense: Expense) => {
    const ok = await confirmDelete(expense.title);
    if (ok) deleteMutation.mutate(expense.id);
  };

  const handleCloseForm = () => { setShowForm(false); setEditing(null); reset(); };
  const isMutating = createMutation.isPending || updateMutation.isPending;

  const thisMonthTotal = expenses
    .filter((e) => dayjs(e.expense_date).isSame(dayjs(), 'month'))
    .reduce((sum, e) => sum + e.amount, 0);

  const methodLabel: Record<string, string> = {
    cash: 'Cash', upi: 'UPI', bank_transfer: 'Bank Transfer', cheque: 'Cheque', other: 'Other',
  };

  return (
    <div className="pb-24">
      <PageHeader
        title="Expenses"
        subtitle={`This month: ${formatCurrency(thisMonthTotal)}`}
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

      <div className="px-4 pt-2 pb-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search expenses..." />
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-4 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {editing ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button onClick={handleCloseForm} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <FormField label="Title" required error={errors.title?.message}>
                <Input {...register('title')} placeholder="Expense title" error={Boolean(errors.title)} />
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

                {/* expense_date — backend field name */}
                <FormField label="Date" required error={errors.expense_date?.message}>
                  <Input {...register('expense_date')} type="date" error={Boolean(errors.expense_date)} />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Category" error={errors.category?.message}>
                  <Select {...register('category')} options={EXPENSE_CATEGORIES} placeholder="Select..." />
                </FormField>

                <FormField label="Payment Method" error={errors.payment_method?.message}>
                  <Select {...register('payment_method')} options={PAYMENT_METHODS} />
                </FormField>
              </div>

              <FormField label="Reference No." error={errors.reference_number?.message}>
                <Input {...register('reference_number')} placeholder="Optional" />
              </FormField>

              {/* note — backend field name (not notes) */}
              <FormField label="Note" error={errors.note?.message}>
                <Textarea {...register('note')} placeholder="Optional note..." rows={2} />
              </FormField>

              <button
                type="submit"
                disabled={isMutating}
                className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isMutating && <ButtonSpinner />}
                {editing ? 'Update' : 'Add Expense'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <PageLoader />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={<TrendingDown size={32} />}
          title="No expenses yet"
          description="Track your business expenses here."
          action={
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl">
              Add Expense
            </button>
          }
        />
      ) : (
        <div className="px-4 space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    <TrendingDown size={18} className="text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{expense.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {expense.category && <span className="text-xs text-gray-400">{expense.category}</span>}
                      <span className="text-xs text-gray-400">
                        {dayjs(expense.expense_date).format('D MMM YYYY')}
                      </span>
                    </div>
                    {expense.payment_method && (
                      <span className="text-xs text-gray-400">
                        {methodLabel[expense.payment_method] ?? expense.payment_method}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                    -{formatCurrency(expense.amount)}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(expense)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(expense)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
