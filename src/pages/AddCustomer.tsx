import { useState, useEffect } from "react";
import {
  ArrowLeft,
  UserPlus,
  Search,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  X,
  Loader2,
  Edit2,
  Trash2,
} from "lucide-react";
import api from "../utils/api";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import axios from "axios";

type Party = {
  id: number;
  name: string;
  mobile: string | null;
  address: string | null;
  gst_number?: string;
  type: "customer" | "supplier" | "both";
  opening_balance: number;
  status: "active" | "inactive";
};

type AddCustomerProps = {
  onBack: () => void;
  onViewLedger?: (partyId: number, partyName: string) => void;
  initialShowForm?: boolean;
};

export default function AddCustomer({
  onBack,
  onViewLedger,
  initialShowForm = false,
}: AddCustomerProps) {
  const [showForm, setShowForm] = useState(!!initialShowForm);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "customer" | "supplier" | "both"
  >("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    gst_number: "",
    type: "customer" as "customer" | "supplier" | "both",
    opening_balance: "",
    status: "active" as "active" | "inactive",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingName, setDeletingName] = useState<string>("");
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [invoiceCount, setInvoiceCount] = useState<number>(0);
  const [paymentCount, setPaymentCount] = useState<number>(0);
  const [checkingRelations, setCheckingRelations] = useState(false);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await api.get("/parties");
      if (response.data.success) {
        setParties(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (
      formData.mobile &&
      formData.mobile.length > 0 &&
      formData.mobile.length !== 10
    ) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }
    if (
      formData.opening_balance &&
      isNaN(parseFloat(formData.opening_balance))
    ) {
      newErrors.opening_balance = "Invalid amount";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        name: formData.name.trim(),
        mobile: formData.mobile || null,
        address: formData.address || null,
        gst_number: formData.gst_number || null,
        type: formData.type,
        opening_balance: formData.opening_balance
          ? parseFloat(formData.opening_balance)
          : 0,
        status: formData.status,
      };

      if (editingId) {
        // Update existing party
        await api.put(`/parties/${editingId}`, payload);
      } else {
        // Create new party
        await api.post("/parties", payload);
      }

      // Reset form and refresh list
      resetForm();
      fetchParties();

      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        setErrors({
          submit: e.message,
        });
      } else {
        setErrors({
          submit: "Failed to save customer. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      address: "",
      gst_number: "",
      type: "customer",
      opening_balance: "",
      status: "active",
    });
    setErrors({});
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (party: Party, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering the ledger view
    setFormData({
      name: party.name,
      mobile: party.mobile || "",
      address: party.address || "",
      gst_number: party.gst_number || "",
      type: party.type,
      opening_balance: party.opening_balance.toString(),
      status: party.status,
    });
    setEditingId(party.id);
    setShowForm(true);
  };

  const handleDeleteClick = async (party: Party, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the ledger view
    setDeletingId(party.id);
    setDeletingName(party.name);
    setCheckingRelations(true);

    try {
      // Fetch party details with counts
      const response = await api.get(`/parties/${party.id}`);
      if (response.data.success) {
        const partyData = response.data.data;
        // Use counts from backend if available, otherwise count arrays
        const txCount =
          partyData.transactions_count ?? (partyData.transactions?.length || 0);
        const invCount =
          partyData.invoices_count ?? (partyData.invoices?.length || 0);
        const payCount =
          partyData.payments_count ?? (partyData.payments?.length || 0);

        setTransactionCount(txCount);
        setInvoiceCount(invCount);
        setPaymentCount(payCount);
      }
    } catch (error) {
      console.error("Error checking relations:", error);
      // If error, still allow deletion but show warning
      setTransactionCount(0);
      setInvoiceCount(0);
      setPaymentCount(0);
    } finally {
      setCheckingRelations(false);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      const response = await api.delete(`/parties/${deletingId}`);
      fetchParties();
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));

      // Show success message with deleted counts
      if (response.data?.data) {
        const deleted = response.data.data;
        const deletedItems = [];
        if (deleted.deleted_transactions > 0) {
          deletedItems.push(`${deleted.deleted_transactions} transaction(s)`);
        }
        if (deleted.deleted_invoices > 0) {
          deletedItems.push(`${deleted.deleted_invoices} invoice(s)`);
        }
        if (deleted.deleted_payments > 0) {
          deletedItems.push(`${deleted.deleted_payments} payment(s)`);
        }

        if (deletedItems.length > 0) {
          console.log(`Deleted: ${deletedItems.join(", ")}`);
        }
      }

      setDeleteModalOpen(false);
      setDeletingId(null);
      setDeletingName("");
      setTransactionCount(0);
      setInvoiceCount(0);
      setPaymentCount(0);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        alert(e.response?.data?.message || "Failed to delete customer");
      } else {
        alert("Failed to delete customer");
      }
    }
  };

  const filteredParties = parties.filter((party) => {
    const matchesSearch =
      party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (party.mobile && party.mobile.includes(searchQuery));
    const matchesType =
      filterType === "all" ||
      party.type === filterType ||
      (filterType === "both" && party.type === "both");
    return matchesSearch && matchesType;
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827] dark:text-white" />
        </button>
        <h1 className="text-lg font-bold text-[#111827] dark:text-white flex-1">
          {showForm
            ? editingId
              ? "Edit Customer"
              : "Add Customer"
            : "Customers"}
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-9 h-9 rounded-xl bg-[#22C55E] dark:bg-green-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        )}
        {showForm && (
          <button
            onClick={resetForm}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showForm ? (
        /* Add/Edit Form */
        <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="Enter customer name"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                    : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
                } text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Mobile Number
              </label>
              <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <Phone className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      mobile: e.target.value.replace(/\D/g, ""),
                    });
                    if (errors.mobile) setErrors({ ...errors, mobile: "" });
                  }}
                  placeholder="Enter mobile number"
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              {errors.mobile && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Address
              </label>
              <div className="flex items-start gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <MapPin className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500 mt-1" />
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter address"
                  rows={3}
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                />
              </div>
            </div>

            {/* GST Number */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                GST Number
              </label>
              <input
                type="text"
                value={formData.gst_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gst_number: e.target.value.toUpperCase(),
                  })
                }
                placeholder="15-digit GST number (optional)"
                maxLength={15}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["customer", "supplier", "both"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                      formData.type === type
                        ? "border-[#22C55E] dark:border-green-500 bg-[#ECFDF3] dark:bg-green-900/30 text-[#16A34A] dark:text-green-400"
                        : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#374151] dark:text-gray-300 hover:border-[#22C55E] dark:hover:border-green-500"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Opening Balance */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Opening Balance
              </label>
              <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <Building2 className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.opening_balance}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      opening_balance: e.target.value.replace(/[^0-9.-]/g, ""),
                    });
                    if (errors.opening_balance)
                      setErrors({ ...errors, opening_balance: "" });
                  }}
                  placeholder="0.00 (Positive = they owe you, Negative = you owe them)"
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              {errors.opening_balance && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.opening_balance}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["active", "inactive"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status })}
                    className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                      formData.status === status
                        ? "border-[#22C55E] dark:border-green-500 bg-[#ECFDF3] dark:bg-green-900/30 text-[#16A34A] dark:text-green-400"
                        : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.submit}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                isSubmitting
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-[#22C55E] dark:bg-green-600 text-white hover:bg-[#16A34A] dark:hover:bg-green-700 shadow-lg hover:shadow-xl active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {editingId ? "Update Customer" : "Add Customer"}
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Customer List */
        <div className="flex-1 flex flex-col">
          {/* Search and Filter */}
          <div className="px-4 py-4 space-y-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {(["all", "customer", "supplier", "both"] as const).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      filterType === type
                        ? "bg-[#22C55E] dark:bg-green-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] dark:text-green-400" />
              </div>
            ) : filteredParties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <UserPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                  No customers found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Add your first customer to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredParties.map((party) => (
                  <div
                    key={party.id}
                    className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => onViewLedger?.(party.id, party.name)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-[#111827] dark:text-white truncate">
                            {party.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                              party.type === "customer"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                : party.type === "supplier"
                                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                            }`}
                          >
                            {party.type}
                          </span>
                          {party.status === "inactive" && (
                            <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              Inactive
                            </span>
                          )}
                        </div>
                        {party.mobile && (
                          <div className="flex items-center gap-2 text-sm text-[#6B7280] dark:text-gray-400 mb-1">
                            <Phone className="w-4 h-4" />
                            <span>{party.mobile}</span>
                          </div>
                        )}
                        {party.address && (
                          <div className="flex items-start gap-2 text-sm text-[#6B7280] dark:text-gray-400 mb-2">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">
                              {party.address}
                            </span>
                          </div>
                        )}
                        {party.opening_balance !== 0 && (
                          <div className="text-sm">
                            <span className="text-[#6B7280] dark:text-gray-400">
                              Opening Balance:{" "}
                            </span>
                            <span
                              className={`font-semibold ${
                                party.opening_balance > 0
                                  ? "text-[#16A34A] dark:text-green-400"
                                  : "text-[#DC2626] dark:text-red-400"
                              }`}
                            >
                              {formatAmount(Math.abs(party.opening_balance))}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={(e) => handleEdit(party, e)}
                          className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(party, e)}
                          className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingId(null);
          setDeletingName("");
          setTransactionCount(0);
          setInvoiceCount(0);
          setPaymentCount(0);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer?"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        itemName={deletingName}
        transactionCount={transactionCount}
        invoiceCount={invoiceCount}
        paymentCount={paymentCount}
        checkingRelations={checkingRelations}
      />
    </div>
  );
}
