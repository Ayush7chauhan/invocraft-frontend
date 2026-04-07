import { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import jsPDF from "jspdf";
import { toCanvas } from "html-to-image";
import api from "../utils/api";

// UI Components
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

// Invoice Sub-components
import PartySelector from "../components/invoice/PartySelector";
import ItemTable from "../components/invoice/ItemTable";
import AddItemModal from "../components/invoice/AddItemModal";
import PaymentSection from "../components/invoice/PaymentSection";
import InvoicePreview from "../components/invoice/InvoicePreview";
import { CheckCircle2, FileText, Calendar, AlertCircle } from "lucide-react";

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

const emptyModalItem = {
  product_id: 0,
  product_name: "",
  quantity: 1,
  unit_price: 0,
  tax_rate: 0,
};

export default function CreateInvoice() {
  const navigate = useNavigate();
  const context = useOutletContext<{ setSidebarOpen: (open: boolean) => void }>() || { setSidebarOpen: () => { } };
  const { setSidebarOpen } = context;

  const [parties, setParties] = useState<Party[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchParties();
    fetchProducts();
    generateInvoiceNumber();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await api.get("/parties", { params: { type: "customer" } });
      if (response.data.success) setParties(response.data.data);
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      if (response.data.success) setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const num = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${random}`;
    setFormData((prev) => ({ ...prev, invoice_number: num }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = items.reduce((sum, item) => sum + item.tax_amount, 0);
    const total = subtotal + totalTax;
    return { subtotal, totalTax, total };
  };

  const handleAddItem = (andAddAnother: boolean) => {
    const subtotal = modalItem.quantity * modalItem.unit_price;
    const tax = (subtotal * modalItem.tax_rate) / 100;
    const total = subtotal + tax;

    const newItem: InvoiceItem = {
      id: editingItemId ?? Date.now().toString(),
      product_id: modalItem.product_id,
      product_name: modalItem.product_name,
      quantity: modalItem.quantity,
      unit_price: modalItem.unit_price,
      tax_rate: modalItem.tax_rate,
      subtotal,
      tax_amount: tax,
      total,
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

  const handleEditItem = (item: InvoiceItem) => {
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

  const handleSubmit = async () => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (!formData.party_id) {
      newErrors.party_id = "Please select a customer or supplier for the bill.";
    }

    if (!formData.invoice_date) {
      newErrors.invoice_date = "Invoice date is required.";
    }

    if (items.length === 0) {
      newErrors.items = "You must add at least one item to generate an invoice.";
    }

    const totalAmount = calculateTotals().total;

    if (formData.payment_status === "partially_paid") {
      const paidAmt = parseFloat(formData.paid_amount);
      if (!formData.paid_amount || isNaN(paidAmt) || paidAmt <= 0) {
        newErrors.paid_amount = "Partial payment amount must be greater than 0.";
      } else if (paidAmt >= totalAmount && totalAmount > 0) {
        newErrors.paid_amount = "Partial payment cannot exceed or equal the total bill. Use 'Paid' status instead.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let paidAmount = 0;
      if (formData.payment_status === "paid") paidAmount = totalAmount;
      else if (formData.payment_status === "partially_paid") paidAmount = parseFloat(formData.paid_amount) || 0;

      const payload = {
        party_id: parseInt(formData.party_id),
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        notes: formData.notes || null,
        terms: formData.terms || null,
        payment_status: formData.payment_status,
        paid_amount: paidAmount,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          tax_rate: i.tax_rate,
        })),
      };

      const res = await api.post("/invoices", payload);
      if (res.data.success) {
        window.dispatchEvent(new CustomEvent("dashboard-refresh"));
        setShowSuccess(true);
      }
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || "Failed to create invoice." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      if (!pdfRef.current) return;
      toCanvas(pdfRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          pdf.addImage(imgData, "PNG", 0, 0, 210, (canvas.height * 210) / canvas.width);
          pdf.save(`Invoice_${formData.invoice_number}.pdf`);
        })
        .finally(() => setIsGeneratingPDF(false));
    }, 500);
  };

  const formatAmount = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const totals = calculateTotals();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-2xl text-center max-w-sm w-full border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Success!</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice created successfully</p>
          </div>
          <div className="space-y-3 pt-4">
            <Button className="w-full h-14 rounded-2xl shadow-xl shadow-green-500/20" onClick={() => navigate("/bills")}>VIEW BILLS</Button>
            <Button variant="ghost" className="w-full h-14 rounded-2xl text-gray-400 font-bold" onClick={() => navigate("/")}>DASHBOARD</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create Bill"
        showBack={true}
        onBackClick={() => navigate(-1)}
        showMenu={true}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-10 pb-32 custom-scrollbar">
        {/* Invoice Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Invoice Number</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              <Input value={formData.invoice_number} readOnly className="pl-12 bg-gray-50/50" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bill Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              <Input type="date" value={formData.invoice_date} onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })} className="pl-12" />
            </div>
          </div>
        </div>

        {/* Party Selection */}
        <PartySelector
          parties={parties}
          selectedPartyId={formData.party_id}
          onSelect={(id) => setFormData({ ...formData, party_id: id })}
          error={errors.party_id}
        />

        {/* Items Section */}
        <ItemTable
          items={items}
          onAddItem={() => { setModalItem(emptyModalItem); setEditingItemId(null); setShowAddItemModal(true); }}
          onEditItem={handleEditItem}
          onRemoveItem={(id) => setItems(items.filter(i => i.id !== id))}
          formatAmount={formatAmount}
          error={errors.items}
        />

        {/* Payment Summary */}
        <PaymentSection
          subtotal={totals.subtotal}
          taxAmount={totals.totalTax}
          totalAmount={totals.total}
          paymentStatus={formData.payment_status}
          setPaymentStatus={(s) => setFormData({ ...formData, payment_status: s })}
          paidAmount={formData.paid_amount}
          setPaidAmount={(a) => setFormData({ ...formData, paid_amount: a })}
          formatAmount={formatAmount}
          error={errors.paid_amount}
        />

        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Please fix the following errors before creating the bill:</span>
            </div>
            <ul className="text-xs text-rose-600 dark:text-rose-400 font-medium list-disc pl-5">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button variant="secondary" className="w-full h-14 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] border-2" onClick={() => setShowPreview(true)}>
            View Preview
          </Button>
          <Button className="w-full h-16 rounded-2xl shadow-xl shadow-green-500/20 font-black uppercase text-sm tracking-widest" onClick={handleSubmit} isLoading={isSubmitting}>
            SAVE & FINALIZE
          </Button>
        </div>
      </div>

      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        products={products}
        modalItem={modalItem}
        setModalItem={setModalItem}
        onAdd={handleAddItem}
        isEditing={!!editingItemId}
        formatAmount={formatAmount}
      />

      {showPreview && (
        <InvoicePreview
          onBack={() => setShowPreview(false)}
          onDownload={handleDownloadPDF}
          isGeneratingPDF={isGeneratingPDF}
          userData={userData}
          formData={formData}
          selectedParty={parties.find(p => p.id.toString() === formData.party_id)}
          items={items}
          totals={totals}
          formatAmount={formatAmount}
          formatDate={formatDate}
          pdfRef={pdfRef}
        />
      )}
    </PageContainer>
  );
}
