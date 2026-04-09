import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  ArrowDown,
  TrendingDown,
  Receipt,
  Plus,
  AlertTriangle,
  Package,
  Users,
} from 'lucide-react';
import dashboardService from '@/services/dashboard.service';
import StatCard from '@/components/common/StatCard';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import type { DashboardStats } from '@/types';
import dayjs from 'dayjs';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { shopName } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardService.getStats();
      return res.data.data as DashboardStats;
    },
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) return <PageLoader label="Loading dashboard..." />;

  const stats = data;

  return (
    <div className="pb-24 px-4 pt-4 space-y-5">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {shopName}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {dayjs().format('dddd, D MMMM YYYY')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickActionButton
          icon={<Receipt size={20} />}
          label="New Invoice"
          onClick={() => navigate(ROUTES.INVOICES_CREATE)}
          primary
        />
        <QuickActionButton
          icon={<Plus size={20} />}
          label="Add Customer"
          onClick={() => navigate(ROUTES.CUSTOMERS)}
        />
        <QuickActionButton
          icon={<Package size={20} />}
          label="Products"
          onClick={() => navigate(ROUTES.PRODUCTS)}
        />
        <QuickActionButton
          icon={<TrendingDown size={20} />}
          label="Add Expense"
          onClick={() => navigate(ROUTES.EXPENSES)}
        />
      </div>

      {/* Receivable / Payable */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="To Receive"
          value={formatCurrency(stats?.total_receivable ?? 0)}
          icon={<ArrowDown size={18} />}
          variant="success"
          onClick={() => navigate(ROUTES.CUSTOMERS)}
        />
        <StatCard
          label="To Pay"
          value={formatCurrency(stats?.total_payable ?? 0)}
          icon={<ArrowUp size={18} />}
          variant="danger"
          onClick={() => navigate(ROUTES.SUPPLIERS)}
        />
      </div>

      {/* Today / Month stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Today's Sales"
          value={formatCurrency(stats?.today_sales ?? 0)}
          icon={<Receipt size={18} />}
          variant="info"
        />
        <StatCard
          label="Month Expense"
          value={formatCurrency(stats?.month_expenses ?? 0)}
          icon={<TrendingDown size={18} />}
          variant="warning"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate(ROUTES.CUSTOMERS)}
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all active:scale-95"
        >
          <Users size={18} className="text-green-600" />
          Customers
        </button>
        <button
          onClick={() => navigate(ROUTES.PRODUCTS + '?lowStock=true')}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-sm text-sm font-medium transition-all active:scale-95 ${
            (stats?.low_stock_products?.length ?? 0) > 0
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <AlertTriangle size={18} className={(stats?.low_stock_products?.length ?? 0) > 0 ? 'text-red-500' : 'text-gray-400'} />
          Low Stock ({stats?.low_stock_products?.length ?? 0})
        </button>
      </div>

      {/* Low Stock Alert */}
      {(stats?.low_stock_products?.length ?? 0) > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Low Stock Alert
            </h3>
          </div>
          <div className="space-y-2">
            {stats!.low_stock_products.slice(0, 4).map((p) => (
              <div key={p.id} className="flex justify-between items-center">
                <span className="text-sm text-amber-700 dark:text-amber-300 truncate max-w-[200px]">
                  {p.name}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                  {p.stock_quantity} left
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(ROUTES.PRODUCTS)}
            className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-400 underline"
          >
            View all →
          </button>
        </div>
      )}

      {/* Recent Transactions */}
      {(stats?.recent_transactions?.length ?? 0) > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <button
              onClick={() => navigate(ROUTES.TRANSACTIONS)}
              className="text-xs text-green-600 dark:text-green-400 font-medium"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {stats!.recent_transactions.slice(0, 6).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'credit'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                  }`}
                >
                  {tx.type === 'credit' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {tx.party?.name ?? tx.note ?? (tx.type === 'credit' ? 'Payment received' : 'Payment sent')}
                  </p>
                  {tx.note && tx.party?.name && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {tx.note}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === 'credit'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {dayjs(tx.transaction_date).format('D MMM')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outstanding Invoices */}
      {(stats?.outstanding_invoices?.length ?? 0) > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Outstanding Invoices
            </h3>
            <button
              onClick={() => navigate(ROUTES.INVOICES)}
              className="text-xs text-green-600 dark:text-green-400 font-medium"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {stats!.outstanding_invoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    #{inv.invoice_number}
                  </p>
                  {inv.party?.name && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {inv.party.name}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(inv.total_amount - inv.paid_amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {dayjs(inv.invoice_date).format('D MMM')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuickActionButton({
  icon,
  label,
  onClick,
  primary = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all active:scale-95 shadow-sm ${
        primary
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
