import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Plus,
  X,
  FileText,
  Download,
  Eye,
  Trash2,
  Calendar,
  Loader2,
  CheckCircle2,
  Wallet,
  CircleDollarSign,
} from "lucide-react";
import api from "../utils/api";
import { Autocomplete } from "../components/ui/autocomplete";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";

type Party = {
  id: number;
  name: string;
  mobile: string | null;
  address: string | null;
  type: "customer" | "supplier" | "both";
};

type Product = {
  id: number;
  name: string;
  category: string | null;
  selling_price: number;
  stock_quantity: number;
  tax_rate: number;
};

type InvoiceItem = {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total: number;
};

type CreateInvoiceProps = {
  onBack: () => void;
  onGoToBills?: () => void;
  onGoToDashboard?: () => void;
};

const emptyModalItem = {
  product_id: 0,
  product_name: "",
  quantity: 1,
  unit_price: 0,
  tax_rate: 0,
};

export default function CreateInvoice({
  onBack,
  onGoToBills,
  onGoToDashboard,
}: CreateInvoiceProps) {
  const [parties, setParties] = useState<Party[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState(emptyModalItem);

  const [formData, setFormData] = useState({
    party_id: "",
    invoice_date: new Date().toISOString().split("T")[0],
    invoice_number: "",
    notes: "",
    terms: "",
    payment_status: "unpaid" as "unpaid" | "paid" | "partially_paid",
    paid_amount: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchParties();
    fetchProducts();
    generateInvoiceNumber();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await api.get("/parties", {
        params: { type: "customer" },
      });
      if (response.data.success) {
        setParties(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    setFormData((prev) => ({
      ...prev,
      invoice_number: `INV-${year}${month}${day}-${random}`,
    }));
  };

  const addItem = () => {
    setEditingItemId(null);
    setModalItem(emptyModalItem);
    setShowAddItemModal(true);
  };

  const openEditItem = (item: InvoiceItem) => {
    setEditingItemId(item.id);
    setModalItem({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate,
    });
    setShowAddItemModal(true);
  };

  const modalItemSubtotal = modalItem.quantity * modalItem.unit_price;
  const modalItemTax = (modalItemSubtotal * modalItem.tax_rate) / 100;
  const modalItemTotal = modalItemSubtotal + modalItemTax;

  const addItemFromModal = (andAddAnother: boolean) => {
    if (!modalItem.product_id || modalItem.quantity <= 0) return;
    const product = products.find((p) => p.id === modalItem.product_id);
    const name = (product?.name ?? modalItem.product_name) || "Item";
    const newItem: InvoiceItem = {
      id: editingItemId ?? Date.now().toString(),
      product_id: modalItem.product_id,
      product_name: name,
      quantity: modalItem.quantity,
      unit_price: modalItem.unit_price,
      tax_rate: modalItem.tax_rate,
      subtotal: modalItemSubtotal,
      tax_amount: modalItemTax,
      total: modalItemTotal,
    };
    if (editingItemId) {
      setItems(items.map((i) => (i.id === editingItemId ? newItem : i)));
      setShowAddItemModal(false);
      setEditingItemId(null);
    } else {
      setItems([...items, newItem]);
      if (andAddAnother) {
        setModalItem(emptyModalItem);
      } else {
        setShowAddItemModal(false);
      }
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = <K extends keyof InvoiceItem>(
    id: string,
    field: K,
    value: InvoiceItem[K],
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        const updated: InvoiceItem = {
          ...item,
          [field]: value,
        };

        // If product changed, update product details
        if (field === "product_id") {
          const product = products.find((p) => p.id === Number(value));
          if (product) {
            updated.product_name = product.name;
            updated.unit_price = product.selling_price;
            updated.tax_rate = product.tax_rate ?? 0;
          }
        }

        // Recalculate totals
        updated.subtotal = updated.quantity * updated.unit_price;
        updated.tax_amount = (updated.subtotal * updated.tax_rate) / 100;
        updated.total = updated.subtotal + updated.tax_amount;

        return updated;
      }),
    );
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = items.reduce((sum, item) => sum + item.tax_amount, 0);
    const total = subtotal + totalTax;
    return { subtotal, totalTax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.party_id) {
      newErrors.party_id = "Please select a customer";
    }
    if (!formData.invoice_number) {
      newErrors.invoice_number = "Invoice number is required";
    }
    if (items.length === 0) {
      newErrors.items = "Please add at least one item";
    }
    if (items.some((item) => !item.product_id || item.quantity <= 0)) {
      newErrors.items = "Please fill all item details correctly";
    }
    const totalAmount = calculateTotals().total;
    if (formData.payment_status === "partially_paid") {
      const paid = parseFloat(formData.paid_amount) || 0;
      if (paid <= 0) {
        newErrors.paid_amount = "Enter amount received for partial payment";
      } else if (paid >= totalAmount) {
        newErrors.paid_amount = "Use Paid if full amount received";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const totalAmount = calculateTotals().total;
      let paidAmount = 0;
      if (formData.payment_status === "paid") {
        paidAmount = totalAmount;
      } else if (formData.payment_status === "partially_paid") {
        paidAmount = parseFloat(formData.paid_amount) || 0;
      }

      const payload = {
        party_id: parseInt(formData.party_id),
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        notes: formData.notes || null,
        terms: formData.terms || null,
        payment_status: formData.payment_status,
        paid_amount: paidAmount,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
        })),
      };

      const response = await api.post("/invoices", payload);
      if (response.data.success) {
        window.dispatchEvent(new CustomEvent("dashboard-refresh"));
        setShowSuccess(true);
      }
    } catch (error: unknown) {
      setErrors({
        submit: axios.isAxiosError(error)
          ? (error.response?.data?.message ?? "Failed to create invoice.")
          : "Failed to create invoice.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = () => {
    setIsGeneratingPDF(true);
  };

  useEffect(() => {
    if (!isGeneratingPDF || !pdfRef.current) return;
    const timer = setTimeout(() => {
      if (!pdfRef.current) {
        setIsGeneratingPDF(false);
        return;
      }
      html2canvas(pdfRef.current, { scale: 2, useCORS: true, logging: false })
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
          pdf.save(`Invoice_${formData.invoice_number}.pdf`);
        })
        .catch((err) => {
          console.error("Error generating PDF:", err);
          alert("Failed to generate PDF. Please try again.");
        })
        .finally(() => setIsGeneratingPDF(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [isGeneratingPDF, formData.invoice_number]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const selectedParty = parties.find(
    (p) => p.id === parseInt(formData.party_id),
  );
  const totals = calculateTotals();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] dark:text-white mb-2">
            Invoice created successfully!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            What would you like to do next?
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={() => (onGoToBills ? onGoToBills() : onBack())}
              className="w-full py-3.5 rounded-xl font-semibold bg-[#22C55E] dark:bg-green-600 text-white hover:bg-[#16A34A] dark:hover:bg-green-700 transition-colors shadow-lg"
            >
              Go to Bills
            </button>
            <button
              type="button"
              onClick={() => (onGoToDashboard ? onGoToDashboard() : onBack())}
              className="w-full py-3.5 rounded-xl font-semibold border-2 border-[#E5E7EB] dark:border-gray-700 text-[#111827] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
        {/* Hidden div for PDF - inline styles only so html2canvas does not see oklch */}
        {isGeneratingPDF && (
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
                    {userData.shop_address || "Address not set"}
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
                    Invoice #: {formData.invoice_number}
                  </p>
                  <p style={{ fontSize: 14, margin: "4px 0 0 0" }}>
                    Date:{" "}
                    {new Date(formData.invoice_date).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h3
                style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px 0" }}
              >
                Bill To:
              </h3>
              <p style={{ fontSize: 14, margin: 0 }}>
                {selectedParty?.name || "Customer Name"}
              </p>
              {selectedParty?.address && (
                <p
                  style={{
                    fontSize: 14,
                    color: "#4b5563",
                    margin: "4px 0 0 0",
                  }}
                >
                  {selectedParty.address}
                </p>
              )}
              {selectedParty?.mobile && (
                <p
                  style={{
                    fontSize: 14,
                    color: "#4b5563",
                    margin: "4px 0 0 0",
                  }}
                >
                  Phone: {selectedParty.mobile}
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
                  <th style={{ textAlign: "left", padding: "8px 4px" }}>
                    Item
                  </th>
                  <th style={{ textAlign: "right", padding: "8px 4px" }}>
                    Qty
                  </th>
                  <th style={{ textAlign: "right", padding: "8px 4px" }}>
                    Price
                  </th>
                  <th style={{ textAlign: "right", padding: "8px 4px" }}>
                    Tax
                  </th>
                  <th style={{ textAlign: "right", padding: "8px 4px" }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #e5e7eb" }}
                  >
                    <td style={{ padding: "8px 4px" }}>
                      {item.product_name}
                      {item.tax_rate > 0 ? ` (Tax: ${item.tax_rate}%)` : ""}
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 4px" }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 4px" }}>
                      {formatAmount(item.unit_price)}
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 4px" }}>
                      {formatAmount(item.tax_amount)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "8px 4px",
                        fontWeight: 600,
                      }}
                    >
                      {formatAmount(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 200, fontSize: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <span style={{ color: "#4b5563" }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>
                    {formatAmount(totals.subtotal)}
                  </span>
                </div>
                {totals.totalTax > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <span style={{ color: "#4b5563" }}>Tax</span>
                    <span style={{ fontWeight: 600 }}>
                      {formatAmount(totals.totalTax)}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  <span>Total</span>
                  <span style={{ color: "#16a34a" }}>
                    {formatAmount(totals.total)}
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid #e5e7eb",
                textAlign: "center",
                fontSize: 12,
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
            onClick={() => setShowPreview(false)}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#111827] dark:text-white" />
          </button>
          <h1 className="text-lg font-bold text-[#111827] dark:text-white flex-1">
            Invoice Preview
          </h1>
          <button
            onClick={downloadPDF}
            disabled={isGeneratingPDF}
            className="w-9 h-9 rounded-xl bg-[#22C55E] dark:bg-green-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Download PDF"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Invoice Preview */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 hide-scrollbar bg-gray-50 dark:bg-gray-800">
          <div
            ref={previewRef}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto min-w-0"
          >
            {/* Invoice Header */}
            <div className="border-b-2 border-[#E5E7EB] dark:border-gray-700 pb-5 mb-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white mb-1 truncate">
                    {userData.shop_name || "My Shop"}
                  </h1>
                  <p className="text-sm text-[#6B7280] dark:text-gray-400 break-words">
                    {userData.shop_address || "Address not set"}
                  </p>
                  {userData.mobile_number && (
                    <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1">
                      Phone: {userData.mobile_number}
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white mb-1">
                    INVOICE
                  </h2>
                  <p className="text-sm text-[#6B7280] dark:text-gray-400">
                    Invoice #:{" "}
                    <span className="font-semibold text-[#111827] dark:text-white">
                      {formData.invoice_number}
                    </span>
                  </p>
                  <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-0.5">
                    Date:{" "}
                    {new Date(formData.invoice_date).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-white mb-1.5">
                Bill To:
              </h3>
              <p className="text-sm font-medium text-[#111827] dark:text-white">
                {selectedParty?.name || "Customer Name"}
              </p>
              {selectedParty?.address && (
                <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-0.5 break-words">
                  {selectedParty.address}
                </p>
              )}
              {selectedParty?.mobile && (
                <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-0.5">
                  Phone: {selectedParty.mobile}
                </p>
              )}
            </div>

            {/* Items - mobile: cards; desktop: table */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#6B7280] dark:text-gray-400 mb-2 sm:mb-3">
                Items
              </p>
              {/* Mobile: card per item */}
              <div className="sm:hidden space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50"
                  >
                    <p className="text-sm font-semibold text-[#111827] dark:text-white mb-2">
                      {item.product_name}
                      {item.tax_rate > 0 && (
                        <span className="text-xs font-normal text-[#6B7280] dark:text-gray-400 ml-1">
                          (Tax: {item.tax_rate}%)
                        </span>
                      )}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-[#6B7280] dark:text-gray-400">
                        Qty
                      </span>
                      <span className="text-right font-medium text-[#111827] dark:text-white">
                        {item.quantity}
                      </span>
                      <span className="text-[#6B7280] dark:text-gray-400">
                        Unit price
                      </span>
                      <span className="text-right font-medium text-[#111827] dark:text-white">
                        {formatAmount(item.unit_price)}
                      </span>
                      <span className="text-[#6B7280] dark:text-gray-400">
                        Tax
                      </span>
                      <span className="text-right font-medium text-[#111827] dark:text-white">
                        {formatAmount(item.tax_amount)}
                      </span>
                      <span className="text-[#6B7280] dark:text-gray-400">
                        Line total
                      </span>
                      <span className="text-right font-semibold text-[#111827] dark:text-white">
                        {formatAmount(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto -mx-1">
                <table
                  className="w-full border-collapse min-w-[480px]"
                  style={{ tableLayout: "fixed" }}
                >
                  <colgroup>
                    <col style={{ width: "40%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b-2 border-[#E5E7EB] dark:border-gray-700">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-[#111827] dark:text-white">
                        Item
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-semibold text-[#111827] dark:text-white">
                        Qty
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-semibold text-[#111827] dark:text-white">
                        Price
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-semibold text-[#111827] dark:text-white">
                        Tax
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-semibold text-[#111827] dark:text-white">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#E5E7EB] dark:border-gray-700"
                      >
                        <td className="py-3 px-2 text-sm text-[#111827] dark:text-white align-top">
                          <span className="font-medium">
                            {item.product_name}
                          </span>
                          {item.tax_rate > 0 && (
                            <span className="text-xs text-[#6B7280] dark:text-gray-400 ml-1">
                              (Tax: {item.tax_rate}%)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm text-right text-[#111827] dark:text-white align-top">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-2 text-sm text-right text-[#111827] dark:text-white align-top">
                          {formatAmount(item.unit_price)}
                        </td>
                        <td className="py-3 px-2 text-sm text-right text-[#111827] dark:text-white align-top">
                          {formatAmount(item.tax_amount)}
                        </td>
                        <td className="py-3 px-2 text-sm text-right font-semibold text-[#111827] dark:text-white align-top">
                          {formatAmount(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-5">
              <div className="w-full sm:w-64 border border-[#E5E7EB] dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-between py-1.5 border-b border-[#E5E7EB] dark:border-gray-700">
                  <span className="text-sm text-[#6B7280] dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="text-sm font-semibold text-[#111827] dark:text-white">
                    {formatAmount(totals.subtotal)}
                  </span>
                </div>
                {totals.totalTax > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-[#E5E7EB] dark:border-gray-700">
                    <span className="text-sm text-[#6B7280] dark:text-gray-400">
                      Tax
                    </span>
                    <span className="text-sm font-semibold text-[#111827] dark:text-white">
                      {formatAmount(totals.totalTax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 mt-2">
                  <span className="text-base font-bold text-[#111827] dark:text-white">
                    Total
                  </span>
                  <span className="text-lg font-bold text-[#22C55E] dark:text-green-500">
                    {formatAmount(totals.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            {(formData.notes || formData.terms) && (
              <div className="border-t-2 border-[#E5E7EB] dark:border-gray-700 pt-5">
                {formData.notes && (
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-white mb-1">
                      Notes
                    </h3>
                    <p className="text-sm text-[#6B7280] dark:text-gray-400 break-words">
                      {formData.notes}
                    </p>
                  </div>
                )}
                {formData.terms && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-white mb-1">
                      Terms & Conditions
                    </h3>
                    <p className="text-sm text-[#6B7280] dark:text-gray-400 break-words">
                      {formData.terms}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-[#E5E7EB] dark:border-gray-700 text-center">
              <p className="text-xs text-[#9CA3AF] dark:text-gray-500">
                Thank you for your business!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827] dark:text-white" />
        </button>
        <h1 className="text-lg font-bold text-[#111827] dark:text-white flex-1">
          Create Invoice
        </h1>
        <button
          onClick={() => setShowPreview(true)}
          disabled={items.length === 0 || !formData.party_id}
          className="w-9 h-9 rounded-xl bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Preview Invoice"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Add / Edit Item Modal */}
      {showAddItemModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowAddItemModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] dark:border-gray-700">
              <h3 className="text-lg font-bold text-[#111827] dark:text-white">
                {editingItemId ? "Edit item" : "Add item"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-[#111827] dark:text-white" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-medium text-[#6B7280] dark:text-gray-400 mb-1 block">
                  Product
                </label>
                <Autocomplete
                  value={modalItem.product_id.toString()}
                  onValueChange={(value) => {
                    const id = parseInt(value);
                    const product = products.find((p) => p.id === id);
                    setModalItem((prev) => ({
                      ...prev,
                      product_id: id,
                      product_name: product?.name ?? "",
                      unit_price: product?.selling_price ?? 0,
                      tax_rate: product?.tax_rate ?? 0,
                    }));
                  }}
                  options={products.map((p) => ({
                    value: p.id.toString(),
                    label: `${p.name} (₹${p.selling_price})${p.stock_quantity > 0 ? ` · Stock: ${p.stock_quantity}` : ""}`,
                  }))}
                  placeholder="Select product"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#6B7280] dark:text-gray-400 mb-1 block">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={modalItem.quantity}
                    onChange={(e) =>
                      setModalItem((prev) => ({
                        ...prev,
                        quantity: parseFloat(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280] dark:text-gray-400 mb-1 block">
                    Unit price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={modalItem.unit_price}
                    onChange={(e) =>
                      setModalItem((prev) => ({
                        ...prev,
                        unit_price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] dark:text-gray-400 mb-1 block">
                  Tax rate (%)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={modalItem.tax_rate}
                  onChange={(e) =>
                    setModalItem((prev) => ({
                      ...prev,
                      tax_rate: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white"
                />
              </div>
              <div className="py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-[#E5E7EB] dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280] dark:text-gray-400">
                    Line total
                  </span>
                  <span className="font-semibold text-[#111827] dark:text-white">
                    {formatAmount(modalItemTotal)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#E5E7EB] dark:border-gray-700 flex gap-2">
              {!editingItemId && (
                <button
                  type="button"
                  onClick={() => addItemFromModal(true)}
                  disabled={!modalItem.product_id || modalItem.quantity <= 0}
                  className="flex-1 py-2.5 rounded-xl font-medium bg-gray-100 dark:bg-gray-700 text-[#111827] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Add & add another
                </button>
              )}
              <button
                type="button"
                onClick={() => addItemFromModal(false)}
                disabled={!modalItem.product_id || modalItem.quantity <= 0}
                className="flex-1 py-2.5 rounded-xl font-medium bg-[#22C55E] dark:bg-green-600 text-white hover:bg-[#16A34A] dark:hover:bg-green-700 disabled:opacity-50"
              >
                {editingItemId ? "Save" : "Add to invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar relative">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Selection */}
          <div className="relative z-10">
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
              Customer <span className="text-red-500">*</span>
            </label>
            <Autocomplete
              value={formData.party_id}
              onValueChange={(value) => {
                setFormData({ ...formData, party_id: value });
                if (errors.party_id) setErrors({ ...errors, party_id: "" });
              }}
              options={parties
                .filter((p) => p.type === "customer" || p.type === "both")
                .map((party) => ({
                  value: party.id.toString(),
                  label: `${party.name}${party.mobile ? ` - ${party.mobile}` : ""}`,
                }))}
              placeholder="Select customer"
              className={
                errors.party_id ? "border-red-300 dark:border-red-700" : ""
              }
            />
            {errors.party_id && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.party_id}
              </p>
            )}
          </div>

          {/* Invoice Number */}
          <div>
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
              Invoice Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.invoice_number}
              onChange={(e) => {
                setFormData({ ...formData, invoice_number: e.target.value });
                if (errors.invoice_number)
                  setErrors({ ...errors, invoice_number: "" });
              }}
              placeholder="INV-20240101-001"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.invoice_number
                  ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                  : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
              } text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500`}
            />
            {errors.invoice_number && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.invoice_number}
              </p>
            )}
          </div>

          {/* Invoice Date */}
          <div>
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
              Invoice Date <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
              <Calendar className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_date: e.target.value })
                }
                className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white"
              />
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
              Payment Status
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "unpaid" as const, label: "Unpaid", icon: Wallet },
                  { value: "paid" as const, label: "Paid", icon: CheckCircle2 },
                  {
                    value: "partially_paid" as const,
                    label: "Partial",
                    icon: CircleDollarSign,
                  },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, payment_status: value }))
                  }
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                    formData.payment_status === value
                      ? value === "paid"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : value === "unpaid"
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                          : "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                      : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#6B7280] dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            {formData.payment_status === "partially_paid" && (
              <div className="mt-3">
                <label className="text-xs text-[#6B7280] dark:text-gray-400 mb-1 block">
                  Amount received (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.paid_amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paid_amount: e.target.value,
                    }))
                  }
                  placeholder={`Max ${formatAmount(calculateTotals().total)}`}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.paid_amount
                      ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                      : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
                  } text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500`}
                />
                {errors.paid_amount && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.paid_amount}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Items Section - compact list + Add Item opens modal */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
                Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22C55E] dark:bg-green-600 text-white text-sm font-medium hover:bg-[#16A34A] dark:hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            {errors.items && (
              <p className="mb-2 text-xs text-red-600 dark:text-red-400">
                {errors.items}
              </p>
            )}

            {items.length > 0 ? (
              <div className="border border-[#E5E7EB] dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <th className="text-left py-2.5 px-3 font-semibold text-[#111827] dark:text-white">
                          Product
                        </th>
                        <th className="text-right py-2.5 px-2 font-semibold text-[#111827] dark:text-white">
                          Qty
                        </th>
                        <th className="text-right py-2.5 px-2 font-semibold text-[#111827] dark:text-white">
                          Price
                        </th>
                        <th className="text-right py-2.5 px-2 font-semibold text-[#111827] dark:text-white">
                          Total
                        </th>
                        <th className="w-10 py-2.5 px-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#E5E7EB] dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <td className="py-2.5 px-3 text-[#111827] dark:text-white">
                            <button
                              type="button"
                              onClick={() => openEditItem(item)}
                              className="text-left font-medium hover:text-[#22C55E] dark:hover:text-green-400 underline-offset-2 hover:underline"
                            >
                              {item.product_name}
                              {item.tax_rate > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                  ({item.tax_rate}% tax)
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="py-2.5 px-2 text-right text-[#111827] dark:text-white">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-2 text-right text-[#111827] dark:text-white">
                            {formatAmount(item.unit_price)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-semibold text-[#111827] dark:text-white">
                            {formatAmount(item.total)}
                          </td>
                          <td className="py-2.5 px-2">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div
                onClick={addItem}
                className="border-2 border-dashed border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-[#22C55E] dark:hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors"
              >
                <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  No items yet
                </p>
                <p className="text-sm text-[#22C55E] dark:text-green-400 font-medium">
                  Tap to add your first item
                </p>
              </div>
            )}
          </div>

          {/* Totals Summary */}
          {items.length > 0 && (
            <div className="bg-[#F9FAFB] dark:bg-gray-800 rounded-xl p-4 border border-[#E5E7EB] dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#6B7280] dark:text-gray-400">
                  Subtotal:
                </span>
                <span className="text-sm font-semibold text-[#111827] dark:text-white">
                  {formatAmount(totals.subtotal)}
                </span>
              </div>
              {totals.totalTax > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#6B7280] dark:text-gray-400">
                    Tax:
                  </span>
                  <span className="text-sm font-semibold text-[#111827] dark:text-white">
                    {formatAmount(totals.totalTax)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-[#E5E7EB] dark:border-gray-700">
                <span className="text-base font-bold text-[#111827] dark:text-white">
                  Total:
                </span>
                <span className="text-lg font-bold text-[#22C55E] dark:text-green-400">
                  {formatAmount(totals.total)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes or comments"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500 resize-none"
            />
          </div>

          {/* Terms */}
          <div>
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) =>
                setFormData({ ...formData, terms: e.target.value })
              }
              placeholder="Payment terms, delivery terms, etc."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500 resize-none"
            />
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={items.length === 0 || !formData.party_id}
              className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || items.length === 0 || !formData.party_id
              }
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                isSubmitting || items.length === 0 || !formData.party_id
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-[#22C55E] dark:bg-green-600 text-white hover:bg-[#16A34A] dark:hover:bg-green-700 shadow-lg hover:shadow-xl active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
