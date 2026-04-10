import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Receipt, User, Calendar, Hash, Tag,
  Trash2, Package, CreditCard, FileText,
} from 'lucide-react';
import invoicesService from '@/services/invoices.service';
import { confirmDelete } from '@/components/common/ConfirmDialog';
import { PageLoader } from '@/components/common/LoadingSpinner';
import Badge, { invoiceStatusBadge } from '@/components/common/Badge';
import { parseApiError } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import type { Invoice } from '@/types';
import dayjs from 'dayjs';

export default function ViewInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const invoiceId = Number(id);

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const res = await invoicesService.show(invoiceId);
      return res.data.data as Invoice;
    },
    enabled: !isNaN(invoiceId),
  });

  const deleteMutation = useMutation({
    mutationFn: invoicesService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Invoice deleted');
      navigate(ROUTES.INVOICES, { replace: true });
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const handleDelete = async () => {
    if (!invoice) return;
    const ok = await confirmDelete(`Invoice #${invoice.invoice_number}`);
    if (ok) deleteMutation.mutate(invoice.id);
  };

  if (isLoading) return <PageLoader label="Loading invoice..." />;

  if (isError || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Receipt size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Invoice not found</p>
        <button
          onClick={() => navigate(ROUTES.INVOICES)}
          className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium"
        >
          ← Back to Invoices
        </button>
      </div>
    );
  }

  const subtotal = invoice.items?.reduce((sum, item) => {
    const tax = Number(item.tax_rate ?? 0);
    return sum + item.quantity * item.unit_price * (1 + tax / 100);
  }, 0) ?? invoice.total_amount;

  const discount = invoice.discount ?? 0;
  const dueAmount = Math.max(0, invoice.total_amount - invoice.paid_amount);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.INVOICES)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">
              #{invoice.invoice_number}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Invoice Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={invoiceStatusBadge(invoice.payment_status)}>
            {invoice.payment_status === 'partially_paid' ? 'Partial' : invoice.payment_status}
          </Badge>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            aria-label="Delete invoice"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Meta Info */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-3">
          <InfoRow icon={<Hash size={14} />} label="Invoice No." value={`#${invoice.invoice_number}`} />
          <InfoRow icon={<User size={14} />} label="Customer" value={invoice.party?.name ?? 'Walk-in Customer'} />
          <InfoRow
            icon={<Calendar size={14} />}
            label="Date"
            value={dayjs(invoice.invoice_date).format('D MMMM YYYY')}
          />
          {invoice.notes && (
            <InfoRow icon={<FileText size={14} />} label="Notes" value={invoice.notes} />
          )}
        </div>

        {/* Items */}
        {(invoice.items?.length ?? 0) > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <Package size={15} className="text-green-600 dark:text-green-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Items ({invoice.items!.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {invoice.items!.map((item, idx) => {
                const itemTotal = item.quantity * item.unit_price * (1 + (item.tax_rate ?? 0) / 100);
                return (
                  <div key={item.id ?? idx} className="px-4 py-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          Item #{idx + 1}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatCurrency(item.unit_price)} × {item.quantity}
                          {(item.tax_rate ?? 0) > 0 && ` + ${item.tax_rate}% tax`}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={15} className="text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Payment Summary</h3>
          </div>

          <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
          {discount > 0 && (
            <SummaryRow label="Discount" value={`-${formatCurrency(discount)}`} valueClass="text-red-600 dark:text-red-400" />
          )}
          <SummaryRow label="Total" value={formatCurrency(invoice.total_amount)} bold />

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2">
            <SummaryRow
              label="Paid"
              value={formatCurrency(invoice.paid_amount)}
              valueClass="text-green-600 dark:text-green-400"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Due Amount</span>
              <span className={`text-base font-bold ${dueAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {formatCurrency(dueAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Status tag */}
        <div className="flex items-center gap-2 text-xs text-gray-400 pb-4">
          <Tag size={12} />
          Created {dayjs(invoice.created_at).format('D MMM YYYY, h:mm A')}
        </div>

      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 flex justify-between gap-2 min-w-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
        <span className="text-xs font-medium text-gray-900 dark:text-white text-right break-words max-w-[200px]">
          {value}
        </span>
      </div>
    </div>
  );
}

function SummaryRow({
  label, value, bold = false, valueClass = '',
}: { label: string; value: string; bold?: boolean; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </span>
      <span className={`text-sm font-semibold ${valueClass || (bold ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200')}`}>
        {value}
      </span>
    </div>
  );
}
