import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Receipt, Eye, Trash2, ChevronRight } from 'lucide-react';
import invoicesService from '@/services/invoices.service';
import { confirmDelete } from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { PageLoader } from '@/components/common/LoadingSpinner';
import Badge, { invoiceStatusBadge } from '@/components/common/Badge';
import { parseApiError } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/lib/utils';
import type { Invoice } from '@/types';
import dayjs from 'dayjs';

// Backend payment_status values
const STATUS_FILTERS = ['all', 'unpaid', 'partially_paid', 'paid', 'cancelled'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'All',
  unpaid: 'Unpaid',
  partially_paid: 'Partial',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', search, statusFilter],
    queryFn: async () => {
      const res = await invoicesService.list({
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      return res.data.data as Invoice[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: invoicesService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Invoice deleted');
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const handleDelete = async (invoice: Invoice) => {
    const ok = await confirmDelete(`Invoice #${invoice.invoice_number}`);
    if (ok) deleteMutation.mutate(invoice.id);
  };

  return (
    <div className="pb-24">
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoices`}
        backPath={ROUTES.DASHBOARD}
        actions={
          <button
            onClick={() => navigate(ROUTES.INVOICES_CREATE)}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 active:scale-95 transition-colors"
          >
            <Plus size={16} />
            New
          </button>
        }
      />

      {/* Search + Filters */}
      <div className="px-4 pt-2 pb-3 space-y-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoices..." />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      {isLoading ? (
        <PageLoader />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<Receipt size={32} />}
          title="No invoices found"
          description="Create your first invoice to start billing."
          action={
            <button
              onClick={() => navigate(ROUTES.INVOICES_CREATE)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl"
            >
              Create Invoice
            </button>
          }
        />
      ) : (
        <div className="px-4 space-y-2">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onView={() => navigate(ROUTES.INVOICES_VIEW(invoice.id))}
              onDelete={() => handleDelete(invoice)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InvoiceCard({
  invoice,
  onView,
  onDelete,
}: {
  invoice: Invoice;
  onView: () => void;
  onDelete: () => void;
}) {
  const dueAmount = invoice.total_amount - invoice.paid_amount;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
            <Receipt size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                #{invoice.invoice_number}
              </p>
              <Badge variant={invoiceStatusBadge(invoice.payment_status)}>
                {invoice.payment_status === 'partially_paid' ? 'Partial' : invoice.payment_status}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {invoice.party?.name ?? 'Walk-in Customer'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {dayjs(invoice.invoice_date).format('D MMM YYYY')}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {formatCurrency(invoice.total_amount)}
          </p>
          {dueAmount > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              Due: {formatCurrency(dueAmount)}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onView}
              className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
              aria-label="View"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
            <button onClick={onView} className="p-1.5 text-gray-400 rounded-lg">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
