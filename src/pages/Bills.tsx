import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  Search,
  Calendar,
  Download,
  Eye,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import api from "../utils/api";
import { Card, CardContent } from "../components/ui/card";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type InvoiceStatus = "paid" | "unpaid" | "partial";

type Invoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  party?: {
    id: number;
    name: string;
    mobile: string | null;
  };
  total_amount: number;
  status?: InvoiceStatus;
  payment_status?: string;
  created_at: string;
};

type FullInvoiceItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  product?: { id: number; name: string };
};

type FullInvoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: string;
  paid_amount: number;
  notes?: string | null;
  party?: {
    id: number;
    name: string;
    mobile: string | null;
    address?: string | null;
  };
  items?: FullInvoiceItem[];
};

type BillsProps = {
  onBack: () => void;
  onCreateInvoice?: () => void;
};

export default function Bills({ onBack, onCreateInvoice }: BillsProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "paid" | "unpaid" | "partial"
  >("all");
  const [filterDate, setFilterDate] = useState<
    "all" | "today" | "week" | "month"
  >("all");
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
        params.payment_status =
          filterStatus === "partial" ? "partially_paid" : filterStatus;
      }

      if (filterDate !== "all") {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
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
        const list: Invoice[] = response.data.data.map(
          (inv: Record<string, unknown>) => ({
            id: Number(inv.id),
            invoice_number: String(inv.invoice_number ?? ""),
            invoice_date: String(inv.invoice_date ?? ""),
            party: inv.party as Invoice["party"],
            total_amount: Number(inv.total_amount) || 0,
            status:
              inv.payment_status === "partially_paid"
                ? "partial"
                : ((inv.payment_status as InvoiceStatus) ??
                  (inv.status as InvoiceStatus)),
            payment_status: String(inv.payment_status ?? ""),
            created_at: String(inv.created_at ?? ""),
          }),
        );

        setInvoices(list);
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
      maximumFractionDigits: 2,
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
    setViewInvoice(null);

    try {
      const res = await api.get(`/invoices/${invoice.id}`);
      if (res.data?.success && res.data?.data) {
        setViewInvoice(res.data.data as FullInvoice);
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
        setPdfInvoice(res.data.data as FullInvoice);
      }
    } catch (error) {
      console.error("Error fetching invoice for PDF:", error);
      setDownloadId(null);
    }
  };

  useEffect(() => {
    if (!pdfInvoice || !pdfRef.current) return;

    const timer = setTimeout(() => {
      html2canvas(pdfRef.current as HTMLDivElement, {
        scale: 2,
        useCORS: true,
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");

          const imgWidth = 210;
          const pageHeight = 297;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save(`Invoice_${pdfInvoice.invoice_number}.pdf`);
        })
        .catch((error) => console.error("PDF generation failed:", error))
        .finally(() => {
          setPdfInvoice(null);
          setDownloadId(null);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [pdfInvoice]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "unpaid":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "partial":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getInvoiceDateStr = (inv: Invoice) => {
    const raw = inv.invoice_date;
    if (!raw) return "";

    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;

    return toLocalDateString(
      new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    );
  };

  const filteredByDate = (() => {
    if (filterDate === "all") return invoices;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = toLocalDateString(today);

    let startStr: string;
    const endStr = todayStr;

    if (filterDate === "today") {
      startStr = todayStr;
    } else if (filterDate === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      startStr = toLocalDateString(weekStart);
    } else if (filterDate === "month") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      startStr = toLocalDateString(monthStart);
    } else {
      return invoices;
    }

    return invoices.filter((inv) => {
      const invDate = getInvoiceDateStr(inv);
      return invDate >= startStr && invDate <= endStr;
    });
  })();

  const filteredInvoices = filteredByDate.filter((invoice) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.trim().toLowerCase();

    return (
      invoice.invoice_number?.toLowerCase().includes(query) ||
      invoice.party?.name?.toLowerCase().includes(query) ||
      (invoice.party?.mobile && invoice.party.mobile.toString().includes(query))
    );
  });

  const safeTotal = (inv: Invoice) => Number(inv.total_amount) || 0;

  const totalAmount = filteredInvoices.reduce(
    (sum, inv) => sum + safeTotal(inv),
    0,
  );

  const paidAmount = filteredInvoices
    .filter((inv) => (inv.status ?? inv.payment_status) === "paid")
    .reduce((sum, inv) => sum + safeTotal(inv), 0);

  const unpaidAmount = filteredInvoices
    .filter((inv) => (inv.status ?? inv.payment_status) === "unpaid")
    .reduce((sum, inv) => sum + safeTotal(inv), 0);

  const paymentStatusLabel = (status: string) => {
    if (status === "partially_paid") return "Partial";
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "—";
  };

  let userData: {
    shop_name?: string;
    shop_address?: string;
    mobile_number?: string;
  } = {};

  if (typeof window !== "undefined") {
    try {
      userData = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      userData = {};
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* View Invoice Modal */}
      {(viewLoading || viewInvoice) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !viewLoading && setViewInvoice(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] dark:border-gray-700">
              <h2 className="text-lg font-bold text-[#111827] dark:text-white">
                Invoice Details
              </h2>
              <button
                onClick={() => setViewInvoice(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-[#111827] dark:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {viewLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#22C55E]" />
                </div>
              ) : viewInvoice ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Invoice #
                    </p>
                    <p className="text-sm font-semibold text-[#111827] dark:text-white">
                      {viewInvoice.invoice_number}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Date
                    </p>
                    <p className="text-sm text-[#111827] dark:text-white">
                      {formatDate(viewInvoice.invoice_date)}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </p>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                        viewInvoice.payment_status === "partially_paid"
                          ? "partial"
                          : (viewInvoice.payment_status ?? ""),
                      )}`}
                    >
                      {paymentStatusLabel(viewInvoice.payment_status ?? "")}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Bill To
                    </p>
                    <p className="text-sm text-[#111827] dark:text-white">
                      {viewInvoice.party?.name ?? "—"}
                    </p>
                    {viewInvoice.party?.mobile && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {viewInvoice.party.mobile}
                      </p>
                    )}
                    {viewInvoice.party?.address && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {viewInvoice.party.address}
                      </p>
                    )}
                  </div>

                  {viewInvoice.items && viewInvoice.items.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        Items
                      </p>
                      <div className="border border-[#E5E7EB] dark:border-gray-700 rounded-lg overflow-hidden">
                        {viewInvoice.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between py-2 px-3 border-b border-[#E5E7EB] dark:border-gray-700 last:border-0 text-sm"
                          >
                            <span className="text-[#111827] dark:text-white">
                              {item.product?.name ?? "Item"}
                            </span>
                            <span className="text-[#111827] dark:text-white">
                              {item.quantity} ×{" "}
                              {formatAmount(Number(item.unit_price))} ={" "}
                              {formatAmount(Number(item.total))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#E5E7EB] dark:border-gray-700">
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal
                      </span>
                      <span className="text-[#111827] dark:text-white">
                        {formatAmount(Number(viewInvoice.subtotal))}
                      </span>
                    </div>

                    {Number(viewInvoice.tax_amount) > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Tax
                        </span>
                        <span className="text-[#111827] dark:text-white">
                          {formatAmount(Number(viewInvoice.tax_amount))}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-[#111827] dark:text-white pt-2">
                      <span>Total</span>
                      <span>
                        {formatAmount(Number(viewInvoice.total_amount))}
                      </span>
                    </div>

                    {viewInvoice.paid_amount != null &&
                      Number(viewInvoice.paid_amount) > 0 && (
                        <div className="flex justify-between text-sm py-1 text-green-600 dark:text-green-400">
                          <span>Paid</span>
                          <span>
                            {formatAmount(Number(viewInvoice.paid_amount))}
                          </span>
                        </div>
                      )}
                  </div>

                  {viewInvoice.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Notes:</span>{" "}
                      {viewInvoice.notes}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Hidden PDF Div */}
      {pdfInvoice && (
        <div
          ref={pdfRef}
          style={{
            position: "absolute",
            left: -9999,
            top: 0,
            width: "210mm",
            backgroundColor: "#ffffff",
            padding: 24,
            color: "#111827",
            fontFamily: "sans-serif",
            fontSize: 14,
          }}
        >
          <div
            style={{
              borderBottom: "2px solid #d1d5db",
              paddingBottom: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: "0 0 4px 0",
                  }}
                >
                  {userData.shop_name || "My Shop"}
                </h1>
                <p style={{ fontSize: 14, color: "#4b5563", margin: 0 }}>
                  {userData.shop_address || ""}
                </p>
                {userData.mobile_number && (
                  <p
                    style={{
                      fontSize: 14,
                      color: "#4b5563",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Phone: {userData.mobile_number}
                  </p>
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: "0 0 4px 0",
                  }}
                >
                  INVOICE
                </h2>
                <p style={{ fontSize: 14, margin: 0 }}>
                  Invoice #: {pdfInvoice.invoice_number}
                </p>
                <p style={{ fontSize: 14, margin: "4px 0 0 0" }}>
                  Date: {formatDate(pdfInvoice.invoice_date)}
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px 0" }}>
              Bill To:
            </h3>
            <p style={{ fontSize: 14, margin: 0 }}>
              {pdfInvoice.party?.name ?? "—"}
            </p>
            {pdfInvoice.party?.mobile && (
              <p style={{ fontSize: 14, margin: "4px 0 0 0" }}>
                Phone: {pdfInvoice.party.mobile}
              </p>
            )}
            {pdfInvoice.party?.address && (
              <p style={{ fontSize: 14, margin: "4px 0 0 0" }}>
                {pdfInvoice.party.address}
              </p>
            )}
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #d1d5db" }}>
                <th style={{ textAlign: "left", padding: "8px 0" }}>Item</th>
                <th style={{ textAlign: "right", padding: "8px 0" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "8px 0" }}>Price</th>
                <th style={{ textAlign: "right", padding: "8px 0" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(pdfInvoice.items ?? []).map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "8px 0" }}>
                    {item.product?.name ?? "Item"}
                  </td>
                  <td style={{ textAlign: "right", padding: "8px 0" }}>
                    {item.quantity}
                  </td>
                  <td style={{ textAlign: "right", padding: "8px 0" }}>
                    {formatAmount(Number(item.unit_price))}
                  </td>
                  <td style={{ textAlign: "right", padding: "8px 0" }}>
                    {formatAmount(Number(item.total))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: 192, fontSize: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span>Subtotal:</span>
                <span>{formatAmount(Number(pdfInvoice.subtotal))}</span>
              </div>

              {Number(pdfInvoice.tax_amount) > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <span>Tax:</span>
                  <span>{formatAmount(Number(pdfInvoice.tax_amount))}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  fontWeight: 700,
                }}
              >
                <span>Total:</span>
                <span>{formatAmount(Number(pdfInvoice.total_amount))}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #e5e7eb",
              textAlign: "center",
              fontSize: 14,
              color: "#6b7280",
            }}
          >
            Thank you for your business!
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827] dark:text-white" />
        </button>

        <h1 className="text-lg font-bold text-[#111827] dark:text-white flex-1">
          Bills & Invoices
        </h1>

        {onCreateInvoice && (
          <button
            onClick={onCreateInvoice}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#22C55E] dark:bg-green-600 text-white text-sm font-medium hover:bg-green-700 dark:hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Bill
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-4 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                Total
              </p>
              <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                {formatAmount(totalAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="p-3">
              <p className="text-xs text-green-700 dark:text-green-300 mb-1">
                Paid
              </p>
              <p className="text-sm font-bold text-green-900 dark:text-green-100">
                {formatAmount(paidAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <CardContent className="p-3">
              <p className="text-xs text-red-700 dark:text-red-300 mb-1">
                Unpaid
              </p>
              <p className="text-sm font-bold text-red-900 dark:text-red-100">
                {formatAmount(unpaidAmount)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 space-y-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-145px z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number, customer name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {(["all", "paid", "unpaid", "partial"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                filterStatus === status
                  ? "bg-[#22C55E] dark:bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {(["all", "today", "week", "month"] as const).map((date) => (
            <button
              key={date}
              onClick={() => setFilterDate(date)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                filterDate === date
                  ? "bg-blue-500 dark:bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
              }`}
            >
              <Calendar className="w-4 h-4" />
              {date.charAt(0).toUpperCase() + date.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] dark:text-green-400" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No invoices found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => (
              <Card
                key={invoice.id}
                className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#111827] dark:text-white">
                          {invoice.invoice_number}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                            invoice.status ?? "",
                          )}`}
                        >
                          {invoice.status
                            ? invoice.status.charAt(0).toUpperCase() +
                              invoice.status.slice(1)
                            : "—"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {invoice.party?.name ?? "—"}
                        {invoice.party?.mobile && (
                          <span className="ml-2 text-xs">
                            • {invoice.party.mobile}
                          </span>
                        )}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(invoice.invoice_date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-[#111827] dark:text-white mb-1">
                        {formatAmount(invoice.total_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-[#E5E7EB] dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => handleView(invoice)}
                      className="flex-1 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(invoice)}
                      disabled={downloadId === invoice.id}
                      className="flex-1 py-2 px-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {downloadId === invoice.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
