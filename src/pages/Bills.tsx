import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import jsPDF from "jspdf";
import { toCanvas } from "html-to-image";
import { Plus } from "lucide-react";
import api from "../utils/api";

// UI Components
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

// Bill Sub-components
import BillSummary from "../components/bills/BillSummary";
import BillFilters from "../components/bills/BillFilters";
import BillListItem from "../components/bills/BillListItem";
import InvoiceModal from "../components/bills/InvoiceModal";

import type { Invoice } from "../types/api";

type FullInvoice = Invoice; // Simplified since we updated the main type

export default function Bills() {
  const navigate = useNavigate();
  const { setSidebarOpen } = useOutletContext<{ setSidebarOpen: (open: boolean) => void }>();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid" | "partial">("all");
  const [filterDate, setFilterDate] = useState<"all" | "today" | "week" | "month">("all");
  const [viewInvoice, setViewInvoice] = useState<FullInvoice | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [downloadId, setDownloadId] = useState<number | null>(null);
  const [pdfInvoice, setPdfInvoice] = useState<FullInvoice | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const toLocalDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    void fetchInvoices();
  }, [filterStatus, filterDate]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};

      if (filterStatus !== "all") {
        params.payment_status = filterStatus === "partial" ? "partially_paid" : filterStatus;
      }

      if (filterDate !== "all") {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayStr = toLocalDateString(today);

        if (filterDate === "today") {
          params.start_date = todayStr;
          params.end_date = todayStr;
        } else if (filterDate === "week") {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          params.start_date = toLocalDateString(weekStart);
          params.end_date = todayStr;
        } else if (filterDate === "month") {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          params.start_date = toLocalDateString(monthStart);
          params.end_date = todayStr;
        }
      }

      const response = await api.get("/invoices", { params });

      if (response.data.success && Array.isArray(response.data.data)) {
        setInvoices(response.data.data);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleView = async (invoice: Invoice) => {
    setViewLoading(true);
    try {
      const res = await api.get(`/invoices/${invoice.id}`);
      if (res.data?.success && res.data?.data) {
        setViewInvoice(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    setDownloadId(invoice.id);
    try {
      const res = await api.get(`/invoices/${invoice.id}`);
      if (res.data?.success && res.data?.data) {
        setPdfInvoice(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching invoice for PDF:", error);
      setDownloadId(null);
    }
  };

  useEffect(() => {
    if (!pdfInvoice || !pdfRef.current) return;

    const timer = setTimeout(() => {
      toCanvas(pdfRef.current as HTMLDivElement, {
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
          pdf.save(`Invoice_${pdfInvoice.invoice_number}.pdf`);
        })
        .finally(() => {
          setPdfInvoice(null);
          setDownloadId(null);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [pdfInvoice]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.trim().toLowerCase();
      return (
        invoice.invoice_number?.toLowerCase().includes(query) ||
        invoice.party?.name?.toLowerCase().includes(query) ||
        invoice.party?.mobile?.toString().includes(query)
      );
    });
  }, [invoices, searchQuery]);

  const totals = useMemo(() => {
    const total = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paid = filteredInvoices
      .filter((inv) => inv.payment_status === "paid")
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    const unpaid = filteredInvoices
      .filter((inv) => inv.payment_status === "unpaid")
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    return { total, paid, unpaid };
  }, [filteredInvoices]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <PageContainer>
      <PageHeader
        title="Bills & Invoices"
        showBack={true}
        onBackClick={() => navigate(-1)}
        showMenu={true}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32 custom-scrollbar">
        <BillSummary
          totalAmount={formatAmount(totals.total)}
          paidAmount={formatAmount(totals.paid)}
          unpaidAmount={formatAmount(totals.unpaid)}
        />

        <BillFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
        />

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent shadow-xl" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Invoices</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <EmptyState
              title="No Invoices Found"
              description="Create your first invoice to start tracking your sales."
              actionLabel="Create Bill"
              onAction={() => navigate("/bills/create")}
            />
          ) : (
            filteredInvoices.map((inv) => (
              <BillListItem
                key={inv.id}
                invoice={inv}
                onView={handleView}
                onDownload={handleDownload}
                downloadingId={downloadId}
                formatAmount={formatAmount}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </div>

      <Button
        onClick={() => navigate("/bills/create")}
        className="fixed right-6 bottom-28 w-14 h-14 rounded-full shadow-2xl bg-green-500 hover:bg-green-600 hover:scale-105 active:scale-95 shadow-green-500/40 z-40 transition-all duration-300 flex items-center justify-center p-0"
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>

      <InvoiceModal
        invoice={viewInvoice}
        loading={viewLoading}
        onClose={() => setViewInvoice(null)}
        formatAmount={formatAmount}
        formatDate={formatDate}
      />

      {/* Fix: Must maintain presence in DOM otherwise html-to-image outputs 0x0 empty chunk */}
      <div className="absolute left-[-9999px] top-0 opacity-0 pointer-events-none">
        {pdfInvoice && (
          <div ref={pdfRef} className="w-[210mm] p-10 bg-white text-gray-900 font-sans">
            <div className="border-b-2 border-gray-200 pb-6 mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight">{user.shop_name || "My Shop"}</h1>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{user.shop_address}</p>
                <p className="text-xs font-bold text-gray-500 mt-1">Phone: {user.mobile_number}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black text-green-500 uppercase">INVOICE</h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1"># {pdfInvoice.invoice_number}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{formatDate(pdfInvoice.invoice_date)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
