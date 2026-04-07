import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../utils/api";

// UI Components
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";

// Report Sub-components
import OverviewSection from "../components/reports/OverviewSection";
import FilterSection from "../components/reports/FilterSection";
import ChartsSection from "../components/reports/ChartsSection";
import ListPanel from "../components/reports/ListPanel";

type ListType = "products" | "customers" | "transactions" | "invoices" | null;

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

type ProductItem = {
  id: number;
  name: string;
  stock_quantity?: number;
  selling_price?: number;
};

type CustomerItem = {
  id: number;
  name: string;
  mobile?: string;
};

type Party = {
  name?: string;
};

type TransactionItem = {
  id: number;
  party?: Party;
  note?: string;
  transaction_date: string;
  type: "credit" | "debit";
  amount: number | string;
};

type InvoiceItem = {
  id: number;
  invoice_number: string;
  party?: Party;
  invoice_date: string;
  total_amount?: number | string;
};

type ListItem = ProductItem | CustomerItem | TransactionItem | InvoiceItem;

function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  formatter = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(v),
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
  labelFormatter?: (l: string) => string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-4 min-w-[160px]">
      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2 mb-2">
        {labelFormatter ? labelFormatter(label ?? "") : label}
      </p>
      <div className="space-y-2">
        {payload.map((p, index) => (
          <div
            key={`${p.name ?? "item"}-${index}`}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
              {p.name ?? "Value"}
            </span>
            <span
              className="text-xs font-black"
              style={{ color: p.color ?? "inherit" }}
            >
              {formatter(Number(p.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatAxisCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function getDateRangeForFilter(period: FilterPeriodKey): {
  start_date: string;
  end_date: string;
} {
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
    const copy = new Date(d);
    const day = copy.getDay();
    const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
    copy.setDate(diff);
    return copy;
  };

  if (period === "this_week") {
    const start = getMonday(today);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start_date: toStr(start), end_date: toStr(end) };
  }

  if (period === "last_week") {
    const start = getMonday(today);
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

export default function Reports() {
  const navigate = useNavigate();
  const { setSidebarOpen } = useOutletContext<{ setSidebarOpen: (open: boolean) => void }>();

  const [summaryData, setSummaryData] = useState<ReportData | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<InvoiceItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const [filterPeriod, setFilterPeriod] = useState<FilterPeriodKey>("this_month");
  const [rangeData, setRangeData] = useState<ReportData | null>(null);
  const [loadingRange, setLoadingRange] = useState(false);

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  const [selectedList, setSelectedList] = useState<ListType>(null);
  const [listData, setListData] = useState<ListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const filterRange = useMemo(
    () => getDateRangeForFilter(filterPeriod),
    [filterPeriod],
  );

  const fetchList = useCallback(
    async (type: NonNullable<ListType>) => {
      setListLoading(true);
      setListData([]);

      try {
        const range = filterRange;

        if (type === "products") {
          const res = await api.get("/products");
          if (res.data?.success && Array.isArray(res.data.data)) {
            setListData(res.data.data as ProductItem[]);
          }
        } else if (type === "customers") {
          const res = await api.get("/parties", {
            params: { type: "customer" },
          });
          if (res.data?.success && Array.isArray(res.data.data)) {
            setListData(res.data.data as CustomerItem[]);
          }
        } else if (type === "transactions") {
          const res = await api.get("/transactions", { params: range });
          if (res.data?.success && Array.isArray(res.data.data)) {
            setListData(res.data.data as TransactionItem[]);
          }
        } else if (type === "invoices") {
          const res = await api.get("/invoices", { params: range });
          if (res.data?.success && Array.isArray(res.data.data)) {
            setListData(res.data.data as InvoiceItem[]);
          }
        }
      } catch (error) {
        console.error("Error fetching list:", error);
      } finally {
        setListLoading(false);
      }
    },
    [filterRange],
  );

  const handleCardClick = useCallback(
    (type: ListType) => {
      if (!type) return;
      setSelectedList(type);
      fetchList(type);
    },
    [fetchList],
  );

  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);

    try {
      const [summaryRes, invRes, txRes] = await Promise.all([
        api.get("/reports/summary"),
        api.get("/invoices", { params: { per_page: 5 } }),
        api.get("/transactions", { params: { per_page: 5 } }),
      ]);

      if (summaryRes.data?.success && summaryRes.data.data) {
        setSummaryData(summaryRes.data.data as ReportData);
      }

      if (invRes.data?.success && Array.isArray(invRes.data.data)) {
        setRecentInvoices((invRes.data.data as InvoiceItem[]).slice(0, 5));
      }

      if (txRes.data?.success && Array.isArray(txRes.data.data)) {
        setRecentTransactions(
          (txRes.data.data as TransactionItem[]).slice(0, 5),
        );
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
      setSummaryData(null);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchRangeData = useCallback(async () => {
    setLoadingRange(true);

    try {
      const res = await api.get("/reports/range", { params: filterRange });
      if (res.data?.success && res.data.data) {
        setRangeData(res.data.data as ReportData);
      } else {
        setRangeData(null);
      }
    } catch (error) {
      console.error("Error fetching range report:", error);
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
      if (res.data?.success && Array.isArray(res.data.data)) {
        setChartData(res.data.data as ChartPoint[]);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
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
    const fmt = (s: string) =>
      new Date(`${s}T12:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

    if (filterRange.start_date === filterRange.end_date) {
      return fmt(filterRange.start_date);
    }

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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Business Analytics"
        showBack={true}
        onBackClick={() => navigate(-1)}
        showMenu={true}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-10 pb-32 custom-scrollbar">
        {/* Overview & Recent Items */}
        <OverviewSection
          loading={loadingOverview}
          summaryData={summaryData}
          recentInvoices={recentInvoices}
          recentTransactions={recentTransactions}
          onCardClick={handleCardClick}
          formatAmount={formatAmount}
        />

        {/* Period Statistics */}
        <FilterSection
          loading={loadingRange}
          filterPeriod={filterPeriod}
          setFilterPeriod={(p: any) => setFilterPeriod(p)}
          periodOptions={FILTER_PERIOD_OPTIONS}
          rangeData={rangeData}
          filterPeriodLabel={filterPeriodLabel}
          formatAmount={formatAmount}
        />

        {/* Analytics Charts */}
        <ChartsSection
          loading={chartLoading}
          error={chartError}
          chartData={chartData}
          pieData={pieData}
          chartPeriodLabel={filterRangeLabel}
          fetchChartData={fetchChartData}
          formatAmount={formatAmount}
          formatAxisCurrency={formatAxisCurrency}
          ChartTooltip={ChartTooltip}
        />
      </div>

      {/* Slide-up Detail List */}
      <ListPanel
        selectedList={selectedList}
        listData={listData}
        loading={listLoading}
        filterRangeLabel={filterRangeLabel}
        onClose={() => setSelectedList(null)}
        formatAmount={formatAmount}
      />
    </PageContainer>
  );
}
