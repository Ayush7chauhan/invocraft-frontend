import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, FileText, Users, Package, Loader2, X, RefreshCw, BarChart3, AlertCircle, Calendar, Receipt } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import api from "../utils/api";
import { Card, CardContent } from "../components/ui/card";
import Footer from "../components/Footer";

type ListType = "products" | "customers" | "transactions" | "invoices" | null;

type ReportsProps = {
  onBack: () => void;
  initialView?: "all" | "filter" | "chart";
};

type ReportData = {
  period: string;
  total_sales: number;
  total_purchases: number;
  total_receivable: number;
  total_payable: number;
  total_transactions: number;
  total_invoices: number;
  total_customers: number;
  total_products: number;
  net_profit: number;
  expenses: number;
  total_credit?: number;
  total_debit?: number;
};

/** Period filter for Part 2 & 3: today, yesterday, this week, last week, this month, last month */
type FilterPeriodKey =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month";

type ChartPoint = {
  label: string;
  period: string;
  total_sales: number;
  expenses: number;
  net_profit: number;
};

/** Professional tooltip for charts: currency formatting + dark mode */
function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  formatter = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v),
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  labelFormatter?: (l: string) => string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl px-3 py-2 min-w-[140px] ring-2 ring-gray-100 dark:ring-gray-700/50">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-1 mb-1">
        {labelFormatter ? labelFormatter(label ?? "") : label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="text-gray-500 dark:text-gray-400">{p.name}</span>
          <span className="font-semibold text-gray-900 dark:text-white" style={{ color: p.color }}>
            {formatter(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Compact Y-axis label for INR (1K, 10K, 1L) */
function formatAxisCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

/** Get start_date and end_date for filter period */
function getDateRangeForFilter(period: FilterPeriodKey): { start_date: string; end_date: string } {
  const toStr = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (period === "today") {
    return { start_date: toStr(today), end_date: toStr(today) };
  }
  if (period === "yesterday") {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { start_date: toStr(y), end_date: toStr(y) };
  }
  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  if (period === "this_week") {
    const start = getMonday(new Date(today));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start_date: toStr(start), end_date: toStr(end) };
  }
  if (period === "last_week") {
    const start = getMonday(new Date(today));
    start.setDate(start.getDate() - 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start_date: toStr(start), end_date: toStr(end) };
  }
  if (period === "this_month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start_date: toStr(start), end_date: toStr(end) };
  }
  // last_month
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 0);
  return { start_date: toStr(start), end_date: toStr(end) };
}

const FILTER_PERIOD_OPTIONS: { value: FilterPeriodKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
];

export default function Reports({ onBack }: ReportsProps) {
  // Part 1: Overview & Recent
  const [summaryData, setSummaryData] = useState<ReportData | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  // Part 2: Filter + metrics (same filter drives Part 3 charts)
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriodKey>("this_month");
  const [rangeData, setRangeData] = useState<ReportData | null>(null);
  const [loadingRange, setLoadingRange] = useState(false);
  // Part 3: Charts
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  // List panel (from card click)
  const [selectedList, setSelectedList] = useState<ListType>(null);
  const [listData, setListData] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const filterRange = useMemo(() => getDateRangeForFilter(filterPeriod), [filterPeriod]);

  const fetchList = useCallback(async (type: NonNullable<ListType>) => {
    setListLoading(true);
    setListData([]);
    try {
      const range = filterRange;
      if (type === "products") {
        const res = await api.get("/products");
        if (res.data?.success && Array.isArray(res.data.data)) setListData(res.data.data);
      } else if (type === "customers") {
        const res = await api.get("/parties", { params: { type: "customer" } });
        if (res.data?.success && Array.isArray(res.data.data)) setListData(res.data.data);
      } else if (type === "transactions") {
        const res = await api.get("/transactions", { params: range });
        if (res.data?.success && Array.isArray(res.data.data)) setListData(res.data.data);
      } else if (type === "invoices") {
        const res = await api.get("/invoices", { params: range });
        if (res.data?.success && Array.isArray(res.data.data)) setListData(res.data.data);
      }
    } catch (e) {
      console.error("Error fetching list:", e);
    } finally {
      setListLoading(false);
    }
  }, [filterRange]);

  const handleCardClick = useCallback((type: ListType) => {
    if (!type) return;
    setSelectedList(type);
    fetchList(type);
  }, [fetchList]);

  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const [summaryRes, invRes, txRes] = await Promise.all([
        api.get("/reports/summary"),
        api.get("/invoices", { params: { per_page: 5 } }),
        api.get("/transactions", { params: { per_page: 5 } }),
      ]);
      if (summaryRes.data?.success && summaryRes.data.data) setSummaryData(summaryRes.data.data);
      if (invRes.data?.success && Array.isArray(invRes.data.data)) setRecentInvoices(invRes.data.data.slice(0, 5));
      if (txRes.data?.success && Array.isArray(txRes.data.data)) setRecentTransactions(txRes.data.data.slice(0, 5));
    } catch (e) {
      console.error("Error fetching overview:", e);
      setSummaryData(null);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchRangeData = useCallback(async () => {
    setLoadingRange(true);
    try {
      const res = await api.get("/reports/range", { params: filterRange });
      if (res.data?.success && res.data.data) setRangeData(res.data.data);
      else setRangeData(null);
    } catch (e) {
      console.error("Error fetching range report:", e);
      setRangeData(null);
    } finally {
      setLoadingRange(false);
    }
  }, [filterRange]);

  const fetchChartData = useCallback(async () => {
    setChartLoading(true);
    setChartError(null);
    try {
      const res = await api.get("/reports/chart", { params: filterRange });
      if (res.data?.success && Array.isArray(res.data.data)) setChartData(res.data.data);
      else setChartData([]);
    } catch (e) {
      console.error("Error fetching chart data:", e);
      setChartError("Failed to load chart data. Please try again.");
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [filterRange]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchRangeData();
    fetchChartData();
  }, [fetchRangeData, fetchChartData]);

  const chartTotals = useMemo(() => {
    const sales = chartData.reduce((s, d) => s + d.total_sales, 0);
    const expenses = chartData.reduce((s, d) => s + d.expenses, 0);
    const profit = chartData.reduce((s, d) => s + d.net_profit, 0);
    return { sales, expenses, profit };
  }, [chartData]);

  const filterPeriodLabel = useMemo(() => {
    const opt = FILTER_PERIOD_OPTIONS.find((o) => o.value === filterPeriod);
    return opt?.label ?? filterPeriod;
  }, [filterPeriod]);

  const filterRangeLabel = useMemo(() => {
    const fmt = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    if (filterRange.start_date === filterRange.end_date) return fmt(filterRange.start_date);
    return `${fmt(filterRange.start_date)} – ${fmt(filterRange.end_date)}`;
  }, [filterRange]);

  const pieData = useMemo(() => {
    const sales = chartTotals.sales;
    const expenses = chartTotals.expenses;
    return [
      { name: "Total Sales", value: sales, color: "#22C55E" },
      { name: "Expenses", value: expenses, color: "#EF4444" },
    ].filter((d) => d.value > 0);
  }, [chartTotals.sales, chartTotals.expenses]);

  const chartPeriodLabel = filterRangeLabel;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cardClass =
    "cursor-pointer rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-out border-0";


  const renderListPanel = () => {
    if (!selectedList) return null;
    const titles: Record<NonNullable<ListType>, string> = {
      products: "Products",
      customers: "Customers",
      transactions: "Transactions",
      invoices: "Invoices",
    };
    const title = titles[selectedList];
    const dateLabel = (selectedList === "transactions" || selectedList === "invoices") ? filterRangeLabel : null;
    return (
      <div className="mt-6 animate-slide-up report-stagger-0 rounded-2xl border-0 bg-white dark:bg-gray-800 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {title} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({listData.length})</span>
            </h3>
            {dateLabel && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{dateLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelectedList(null)}
            className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all duration-200"
            aria-label="Close list"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-3 space-y-2 hide-scrollbar">
          {listLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] dark:text-green-400" />
            </div>
          ) : listData.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">No items found</p>
          ) : selectedList === "products" ? (
            listData.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200/80 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111827] dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {item.stock_quantity ?? 0} · ₹{Number(item.selling_price ?? 0).toFixed(0)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : selectedList === "customers" ? (
            listData.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200/80 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111827] dark:text-white truncate">{item.name}</p>
                    {item.mobile && <p className="text-xs text-gray-500 dark:text-gray-400">{item.mobile}</p>}
                  </div>
                </div>
              </div>
            ))
          ) : selectedList === "transactions" ? (
            listData.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200/80 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111827] dark:text-white truncate">{tx.party?.name ?? "—"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx.note || new Date(tx.transaction_date).toLocaleDateString("en-IN")}</p>
                </div>
                <span className={`text-sm font-bold ml-2 ${tx.type === "credit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {tx.type === "credit" ? "+" : "-"}{formatAmount(Number(tx.amount))}
                </span>
              </div>
            ))
          ) : (
            listData.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200/80 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111827] dark:text-white truncate">{inv.invoice_number}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{inv.party?.name ?? "—"} · {new Date(inv.invoice_date).toLocaleDateString("en-IN")}</p>
                </div>
                <span className="text-sm font-bold text-[#111827] dark:text-white ml-2">{formatAmount(Number(inv.total_amount ?? 0))}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/80">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 shadow-sm sticky top-0 z-20">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 tracking-tight">
          Reports
        </h1>
      </header>

      {/* Content: 3 parts */}
      <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar space-y-10">
        {/* ========== PART 1: Overview & Recent (first) ========== */}
        <section className="animate-slide-up report-stagger-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 pl-1 border-l-4 border-emerald-500 dark:border-emerald-400">
            <span className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            Overview & Recent
          </h2>
          {loadingOverview ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/60 dark:bg-gray-800/40 shadow-inner">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500 dark:text-emerald-400 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading overview…</p>
            </div>
          ) : (
            <div className="space-y-5">
              {summaryData && (
                <div className="grid grid-cols-2 gap-4">
                  <Card className={`${cardClass} animate-slide-up report-stagger-1 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 border-emerald-200/60 dark:border-emerald-700/50`} onClick={() => handleCardClick("invoices")}>
                    <CardContent className="p-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Total Sales</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1.5">{formatAmount(summaryData.total_sales)}</p>
                    </CardContent>
                  </Card>
                  <Card className={`${cardClass} animate-slide-up report-stagger-2 bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 border-violet-200/60 dark:border-violet-700/50`} onClick={() => handleCardClick("invoices")}>
                    <CardContent className="p-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">Net Profit</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1.5">{formatAmount(summaryData.net_profit)}</p>
                    </CardContent>
                  </Card>
                  <Card className={`${cardClass} animate-slide-up report-stagger-3 bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/50 shadow-md`} onClick={() => handleCardClick("invoices")}>
                    <CardContent className="p-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Invoices</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1.5">{summaryData.total_invoices}</p>
                    </CardContent>
                  </Card>
                  <Card className={`${cardClass} animate-slide-up report-stagger-4 bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/50 shadow-md`} onClick={() => handleCardClick("transactions")}>
                    <CardContent className="p-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Transactions</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1.5">{summaryData.total_transactions}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4">
                <div className="animate-slide-up report-stagger-5">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-500" /> Recent Invoices
                  </p>
                  <Card className="rounded-2xl border-0 shadow-md overflow-hidden bg-white dark:bg-gray-800/80 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      {recentInvoices.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">No recent invoices</p>
                      ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                          {recentInvoices.map((inv: any, i: number) => (
                            <li key={inv.id} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{inv.invoice_number}</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2">{formatAmount(Number(inv.total_amount ?? 0))}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div className="animate-slide-up report-stagger-6">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Recent Transactions
                  </p>
                  <Card className="rounded-2xl border-0 shadow-md overflow-hidden bg-white dark:bg-gray-800/80 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      {recentTransactions.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">No recent transactions</p>
                      ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                          {recentTransactions.map((tx: any) => (
                            <li key={tx.id} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.party?.name ?? "—"}</span>
                              <span className={`text-sm font-semibold ${tx.type === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                {tx.type === "credit" ? "+" : "−"}{formatAmount(Number(tx.amount))}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========== PART 2: Report filters + 6 metrics ========== */}
        <section className="animate-slide-up report-stagger-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 pl-1 border-l-4 border-amber-500 dark:border-amber-400">
            <span className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </span>
            Report by period
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Filter: Date · Weekly · Monthly</label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as FilterPeriodKey)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:ring-emerald-400/30 transition-all duration-200"
            >
              {FILTER_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {loadingRange ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/60 dark:bg-gray-800/40 shadow-inner">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
            </div>
          ) : rangeData ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: 1, label: "Total Sales", value: formatAmount(rangeData.total_sales), sub: filterPeriodLabel, className: "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 border-emerald-200/60 dark:border-emerald-700/50", labelCls: "text-emerald-700 dark:text-emerald-300", valCls: "text-gray-900 dark:text-white", subCls: "text-emerald-600/80 dark:text-emerald-400/80" },
                { num: 2, label: "Total Profit", value: formatAmount(rangeData.net_profit), sub: filterPeriodLabel, className: "bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 border-violet-200/60 dark:border-violet-700/50", labelCls: "text-violet-700 dark:text-violet-300", valCls: "text-gray-900 dark:text-white", subCls: "text-violet-600/80 dark:text-violet-400/80" },
                { num: 3, label: "Total Expenses", value: formatAmount(rangeData.expenses), sub: filterPeriodLabel, className: "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-800/20 border-red-200/60 dark:border-red-700/50", labelCls: "text-red-700 dark:text-red-300", valCls: "text-gray-900 dark:text-white", subCls: "text-red-600/80 dark:text-red-400/80" },
                { num: 4, label: "Bills & Invoices", value: `${rangeData.total_invoices} invoices`, sub: formatAmount(rangeData.total_sales) + " sales", className: "bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/50 shadow-md", labelCls: "text-gray-700 dark:text-gray-300", valCls: "text-gray-900 dark:text-white", subCls: "text-gray-500 dark:text-gray-400" },
                { num: 5, label: "Total Credit", value: formatAmount(rangeData.total_credit ?? 0), sub: filterPeriodLabel, className: "bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/50 shadow-md", labelCls: "text-gray-700 dark:text-gray-300", valCls: "text-emerald-600 dark:text-emerald-400", subCls: "text-gray-500 dark:text-gray-400" },
                { num: 6, label: "Total Debit", value: formatAmount(rangeData.total_debit ?? 0), sub: filterPeriodLabel, className: "bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/50 shadow-md", labelCls: "text-gray-700 dark:text-gray-300", valCls: "text-red-600 dark:text-red-400", subCls: "text-gray-500 dark:text-gray-400" },
              ].map((item, i) => (
                <Card key={item.num} className={`rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${item.className}`}>
                  <CardContent className="p-4">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${item.labelCls}`}>{item.num}. {item.label}</p>
                    <p className={`text-lg font-bold mt-1 ${item.valCls}`}>{item.value}</p>
                    <p className={`text-[10px] mt-0.5 ${item.subCls}`}>{item.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/60 dark:bg-gray-800/40 py-10 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No data for this period.</p>
            </div>
          )}
        </section>

        {/* ========== PART 3: Charts (same filter) ========== */}
        <section className="animate-slide-up report-stagger-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3 pl-1 border-l-4 border-blue-500 dark:border-blue-400">
            <span className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </span>
            Charts
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 ml-1">Same period: {filterPeriodLabel}</p>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => fetchChartData()}
              disabled={chartLoading}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-emerald-500/50 disabled:opacity-50 transition-all duration-200 shadow-sm"
              title="Refresh charts"
            >
              <RefreshCw className={`w-4 h-4 ${chartLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          {chartLoading && chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/60 dark:bg-gray-800/40 shadow-inner border border-dashed border-gray-200 dark:border-gray-600">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500 dark:text-emerald-400 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading chart data…</p>
              </div>
            ) : chartError ? (
              <Card className="rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50/30 dark:bg-red-900/10 shadow-md overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mb-3" />
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Could not load charts</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mb-4">{chartError}</p>
                  <button
                    type="button"
                    onClick={() => fetchChartData()}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-sm font-medium transition-all duration-200"
                  >
                    Try again
                  </button>
                </CardContent>
              </Card>
            ) : chartData.length === 0 ? (
              <Card className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/40 shadow-sm">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <BarChart3 className="w-14 h-14 text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No data for this period</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Try another period or add invoices and expenses to see charts.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* KPI summary cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Card className="rounded-2xl border-0 shadow-md overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-4">
                      <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Total Sales</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formatAmount(chartTotals.sales)}</p>
                      <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">{chartPeriodLabel}</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-0 shadow-md overflow-hidden bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-4">
                      <p className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide">Net Profit</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formatAmount(chartTotals.profit)}</p>
                      <p className="text-[10px] text-violet-600/80 dark:text-violet-400/80 mt-0.5">{chartPeriodLabel}</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-0 shadow-md overflow-hidden bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-800/20 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-4">
                      <p className="text-[10px] font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">Expenses</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formatAmount(chartTotals.expenses)}</p>
                      <p className="text-[10px] text-red-600/80 dark:text-red-400/80 mt-0.5">{chartPeriodLabel}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Total Sales – Area chart */}
                <Card className="rounded-2xl border-0 shadow-md dark:bg-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300 mb-4">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-white mb-1">Total Sales</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{chartPeriodLabel}</p>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-gray-500" />
                          <YAxis tick={{ fontSize: 11 }} className="text-gray-500" tickFormatter={formatAxisCurrency} />
                          <Tooltip content={<ChartTooltip formatter={(v) => formatAmount(v)} labelFormatter={(l) => l} />} />
                          <Area type="monotone" dataKey="total_sales" name="Total Sales" stroke="#22C55E" strokeWidth={2} fill="url(#salesGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Net Profit – Line chart */}
                <Card className="rounded-2xl border-0 shadow-md dark:bg-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300 mb-4">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-white mb-1">Net Profit</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{chartPeriodLabel}</p>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-gray-500" />
                          <YAxis tick={{ fontSize: 11 }} className="text-gray-500" tickFormatter={formatAxisCurrency} />
                          <Tooltip content={<ChartTooltip formatter={(v) => formatAmount(v)} labelFormatter={(l) => l} />} />
                          <Line type="monotone" dataKey="net_profit" name="Net Profit" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales vs Expenses by period – Stacked bar */}
                <Card className="rounded-2xl border-0 shadow-md dark:bg-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300 mb-4">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-white mb-1">Sales vs Expenses by period</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{chartPeriodLabel}</p>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-gray-500" />
                          <YAxis tick={{ fontSize: 11 }} className="text-gray-500" tickFormatter={formatAxisCurrency} />
                          <Tooltip
                            content={
                              <ChartTooltip
                                formatter={(v) => formatAmount(v)}
                                labelFormatter={(l) => l}
                              />
                            }
                          />
                          <Legend />
                          <Bar dataKey="total_sales" name="Sales" fill="#22C55E" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales vs Expenses – Pie (totals) */}
                <Card className="rounded-2xl border-0 shadow-md dark:bg-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-white mb-1">Sales vs Expenses (total)</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{chartPeriodLabel}</p>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} stroke="transparent" />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => formatAmount(v)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
        </section>

        {renderListPanel()}
      </div>

      <Footer />
    </div>
  );
}

