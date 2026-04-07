import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Wallet,
  ArrowUp,
  ArrowDown,
  Calendar,
  FileText,
  Loader2,
  Edit2,
  Trash2,
  X,
  User,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import api from "../utils/api";
import { Autocomplete } from "../components/ui/autocomplete";
import { DatePicker } from "../components/ui/datepicker";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

type TransactionType = "debit" | "credit" | "given" | "received";
type PaymentMethod = "cash" | "upi" | "bank_transfer" | "other";
type ContactType = "personal" | "business";

type Transaction = {
  id: number;
  party_id?: number;
  personal_contact_id?: number;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  note: string | null;
  payment_method?: PaymentMethod;
  reference_number?: string | null;
  party?: {
    id: number;
    name: string;
    type: string;
  };
  personal_contact?: {
    id: number;
    name: string;
  };
};

import { useParams, useLocation, useNavigate } from "react-router-dom";

type BalanceState = {
  balance: number;
  youOwe: number;
  theyOwe: number;
  opening_balance: number;
};

type FormState = {
  type: TransactionType;
  amount: string;
  transaction_date: string;
  note: string;
  payment_method: PaymentMethod;
  reference_number: string;
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

export default function UnifiedLedger() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as { contactName?: string; contactType?: ContactType } | null;
  
  const contactId = Number(id);
  const contactName = state?.contactName || "Ledger";
  const contactType = state?.contactType || "business";
  
  const onBack = () => navigate(-1);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [balance, setBalance] = useState<BalanceState>({
    balance: 0,
    youOwe: 0,
    theyOwe: 0,
    opening_balance: 0,
  });

  const [formData, setFormData] = useState<FormState>({
    type: contactType === "personal" ? "given" : "credit",
    amount: "",
    transaction_date: getTodayDate(),
    note: "",
    payment_method: "cash",
    reference_number: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    if (contactId) {
      void loadData();
    }
  }, [contactId, contactType]);

  const loadData = async () => {
    await Promise.all([fetchTransactions(), fetchContactDetails()]);
  };

  const fetchTransactions = async () => {
    if (!contactId) return;

    try {
      setLoading(true);

      if (contactType === "personal") {
        const response = await api.get("/personal-transactions", {
          params: { contact_id: contactId },
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          setTransactions(response.data.data);
        } else {
          setTransactions([]);
        }
      } else {
        const response = await api.get("/transactions", {
          params: { party_id: contactId },
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          setTransactions(response.data.data);
        } else {
          setTransactions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactDetails = async () => {
    if (!contactId) return;

    try {
      if (contactType === "personal") {
        const response = await api.get(`/personal-contacts/${contactId}`);

        if (response.data.success) {
          const contact = response.data.data;
          setBalance({
            balance: Number(contact.balance) || 0,
            youOwe: Number(contact.you_owe) || 0,
            theyOwe: Number(contact.they_owe) || 0,
            opening_balance: Number(contact.opening_balance) || 0,
          });
        }
      } else {
        const response = await api.get(`/parties/${contactId}`);

        if (response.data.success) {
          const party = response.data.data;
          const calculatedBalance =
            party.balance !== undefined
              ? Number(party.balance) || 0
              : Number(party.opening_balance) || 0;

          setBalance({
            balance: calculatedBalance,
            youOwe: 0,
            theyOwe: 0,
            opening_balance: Number(party.opening_balance) || 0,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching contact details:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (contactType === "personal") {
        const payload = {
          personal_contact_id: contactId,
          type: formData.type,
          amount: parseFloat(formData.amount),
          transaction_date: formData.transaction_date,
          note: formData.note || null,
          payment_method: formData.payment_method,
          reference_number: formData.reference_number || null,
        };

        if (editingId) {
          await api.put(`/personal-transactions/${editingId}`, payload);
        } else {
          await api.post("/personal-transactions", payload);
        }
      } else {
        const payload = {
          party_id: contactId,
          type: formData.type,
          amount: parseFloat(formData.amount),
          transaction_date: formData.transaction_date,
          note: formData.note || null,
        };

        if (editingId) {
          await api.put(`/transactions/${editingId}`, payload);
        } else {
          await api.post("/transactions", payload);
        }
      }

      resetForm();
      await loadData();
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    } catch (error: unknown) {
      let message = "Failed to save transaction. Please try again.";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: contactType === "personal" ? "given" : "credit",
      amount: "",
      transaction_date: getTodayDate(),
      note: "",
      payment_method: "cash",
      reference_number: "",
    });
    setErrors({});
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      transaction_date: transaction.transaction_date,
      note: transaction.note || "",
      payment_method: transaction.payment_method || "cash",
      reference_number: transaction.reference_number || "",
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const handleDeleteClick = (
    transaction: Transaction,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    setDeletingId(transaction.id);
    setDeletingTransaction(transaction);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      if (contactType === "personal") {
        await api.delete(`/personal-transactions/${deletingId}`);
      } else {
        await api.delete(`/transactions/${deletingId}`);
      }

      await loadData();
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
      setDeleteModalOpen(false);
      setDeletingId(null);
      setDeletingTransaction(null);
    } catch (error: unknown) {
      let message = "Failed to delete transaction";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      alert(message);
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
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const getTransactionLabel = (type: TransactionType) => {
    if (contactType === "personal") {
      return type === "given" ? "You Gave" : "You Received";
    } else {
      return type === "credit" ? "Credit (Money In)" : "Debit (Money Out)";
    }
  };

  const creditTotal = transactions
    .filter((tx) => tx.type === "credit")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const debitTotal = transactions
    .filter((tx) => tx.type === "debit")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const openingBal = Number(balance.opening_balance) || 0;
  const totalBalance = openingBal + creditTotal - debitTotal;
  const finalBalance =
    isNaN(totalBalance) || !isFinite(totalBalance) ? 0 : totalBalance;

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

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-[#111827] dark:text-white truncate">
            {contactName || "Ledger"}
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400">
            {contactType === "personal" ? "Personal Ledger" : "Business Ledger"}
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="w-9 h-9 rounded-xl bg-[#22C55E] dark:bg-green-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
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
        <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Transaction Type <span className="text-red-500">*</span>
              </label>

              {contactType === "personal" ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "given" })}
                    className={`py-4 px-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                      formData.type === "given"
                        ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                    }`}
                  >
                    <ArrowUp className="w-5 h-5 mx-auto mb-1" />
                    You Gave
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, type: "received" })
                    }
                    className={`py-4 px-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                      formData.type === "received"
                        ? "border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                    }`}
                  >
                    <ArrowDown className="w-5 h-5 mx-auto mb-1" />
                    You Received
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "credit" })}
                    className={`py-4 px-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                      formData.type === "credit"
                        ? "border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                    }`}
                  >
                    <ArrowDown className="w-5 h-5 mx-auto mb-1" />
                    Credit (Money In)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "debit" })}
                    className={`py-4 px-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                      formData.type === "debit"
                        ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                    }`}
                  >
                    <ArrowUp className="w-5 h-5 mx-auto mb-1" />
                    Debit (Money Out)
                  </button>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Amount <span className="text-red-500">*</span>
              </label>

              <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <Wallet className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      amount: e.target.value.replace(/[^0-9.]/g, ""),
                    });
                    if (errors.amount) setErrors({ ...errors, amount: "" });
                  }}
                  placeholder="Enter amount"
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {errors.amount && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Date <span className="text-red-500">*</span>
              </label>

              <DatePicker
                value={formData.transaction_date}
                onChange={(value) => {
                  setFormData({ ...formData, transaction_date: value });
                  if (errors.transaction_date) {
                    setErrors({ ...errors, transaction_date: "" });
                  }
                }}
                placeholder="Select transaction date"
                error={errors.transaction_date}
              />
            </div>

            {/* Payment Method */}
            {contactType === "personal" && (
              <div className="relative z-10">
                <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                  Payment Method
                </label>

                <Autocomplete
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      payment_method: value as PaymentMethod,
                    })
                  }
                  options={paymentMethods}
                  placeholder="Select payment method"
                />
              </div>
            )}

            {/* Reference Number */}
            {contactType === "personal" && (
              <div>
                <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                  Reference Number
                </label>

                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reference_number: e.target.value,
                    })
                  }
                  placeholder="Transaction ID, UPI reference, etc."
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
                />
              </div>
            )}

            {/* Note */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Note
              </label>

              <div className="flex items-start gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <FileText className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500 mt-1" />
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Add a note about this transaction"
                  rows={3}
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                />
              </div>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Please fix the following errors:</span>
                </div>
                <ul className="text-xs text-rose-600 dark:text-rose-400 font-medium list-disc pl-5">
                  {Object.values(errors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
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
                  <Plus className="w-4 h-4" />
                  {editingId ? "Update Transaction" : "Add Transaction"}
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Balance Summary */}
          <div className="mx-4 mt-4 p-4 bg-[linear-gradient(to_right,#ECFDF3,#D1FAE5)] dark:bg-[linear-gradient(to_right,rgba(20,83,45,0.3),rgba(22,101,52,0.3))] rounded-2xl border border-[#CFF6D9] dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#6B7280] dark:text-gray-400">
                Current Balance
              </span>
              <Wallet className="w-5 h-5 text-[#16A34A] dark:text-green-400" />
            </div>

            {contactType === "personal" ? (
              balance.balance > 0 ? (
                <div>
                  <p className="text-xs text-[#6B7280] dark:text-gray-400 mb-1">
                    They owe you
                  </p>
                  <p className="text-2xl font-bold text-[#16A34A] dark:text-green-400">
                    {formatAmount(balance.theyOwe)}
                  </p>
                </div>
              ) : balance.balance < 0 ? (
                <div>
                  <p className="text-xs text-[#6B7280] dark:text-gray-400 mb-1">
                    You owe
                  </p>
                  <p className="text-2xl font-bold text-[#DC2626] dark:text-red-400">
                    {formatAmount(balance.youOwe)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-[#6B7280] dark:text-gray-400 mb-1">
                    No balance
                  </p>
                  <p className="text-2xl font-bold text-[#6B7280] dark:text-gray-400">
                    ₹0
                  </p>
                </div>
              )
            ) : (
              <div>
                {openingBal !== 0 && (
                  <div className="mb-2 pb-2 border-b border-green-200 dark:border-green-800">
                    <p className="text-xs text-[#6B7280] dark:text-gray-400 mb-1">
                      Opening Balance
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        openingBal > 0
                          ? "text-[#16A34A] dark:text-green-400"
                          : "text-[#DC2626] dark:text-red-400"
                      }`}
                    >
                      {openingBal > 0 ? "+" : ""}
                      {formatAmount(Math.abs(openingBal))}
                    </p>
                  </div>
                )}

                <div>
                  <p
                    className={`text-2xl font-bold ${
                      finalBalance > 0
                        ? "text-[#16A34A] dark:text-green-400"
                        : finalBalance < 0
                          ? "text-[#DC2626] dark:text-red-400"
                          : "text-[#6B7280] dark:text-gray-400"
                    }`}
                  >
                    {formatAmount(Math.abs(finalBalance))}
                  </p>

                  <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1">
                    {finalBalance > 0
                      ? "You will receive"
                      : finalBalance < 0
                        ? "You will pay"
                        : "Settled"}
                  </p>

                  {(creditTotal > 0 || debitTotal > 0) && (
                    <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800 text-xs text-[#6B7280] dark:text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Credits:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          +{formatAmount(creditTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debits:</span>
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          -{formatAmount(debitTotal)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] dark:text-green-400" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Wallet className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                  No transactions yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Add your first transaction
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const isCredit =
                    contactType === "personal"
                      ? tx.type === "received"
                      : tx.type === "credit";

                  return (
                    <div
                      key={tx.id}
                      className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {isCredit ? (
                              <ArrowDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}

                            <span
                              className={`text-sm font-semibold ${
                                isCredit
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {getTransactionLabel(tx.type)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
                            <span className="text-sm font-medium text-[#111827] dark:text-white">
                              {contactName}
                            </span>
                          </div>

                          <p className="text-lg font-bold text-[#111827] dark:text-white mb-1">
                            {formatAmount(tx.amount)}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-[#6B7280] dark:text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(tx.transaction_date)}</span>
                            </div>

                            {tx.payment_method && (
                              <>
                                <span>•</span>
                                <span className="capitalize">
                                  {tx.payment_method}
                                </span>
                              </>
                            )}
                          </div>

                          {tx.note && (
                            <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-2">
                              {tx.note}
                            </p>
                          )}

                          {tx.reference_number && (
                            <p className="text-xs text-[#9CA3AF] dark:text-gray-500 mt-1">
                              Ref: {tx.reference_number}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-3">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => handleDeleteClick(tx, e)}
                            className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingId(null);
          setDeletingTransaction(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction?"
        message={`Are you sure you want to delete this ${
          contactType === "personal" ? "transaction" : "ledger entry"
        }?`}
        itemName={
          deletingTransaction
            ? `${getTransactionLabel(deletingTransaction.type)} - ${formatAmount(
                deletingTransaction.amount,
              )}`
            : undefined
        }
      />
    </div>
  );
}
