import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Wallet, ArrowUp, ArrowDown, Calendar, FileText, Loader2, Edit2, Trash2, X } from "lucide-react";
import api from "../utils/api";
import { Autocomplete } from "../components/ui/autocomplete";

type PersonalTransaction = {
  id: number;
  personal_contact_id: number;
  type: "given" | "received";
  amount: number;
  transaction_date: string;
  note: string | null;
  payment_method: string;
  reference_number: string | null;
  personal_contact?: {
    id: number;
    name: string;
  };
};

type PersonalLedgerProps = {
  contactId: number;
  contactName: string;
  onBack: () => void;
};

export default function PersonalLedger({ contactId, contactName, onBack }: PersonalLedgerProps) {
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [contactBalance, setContactBalance] = useState({ balance: 0, youOwe: 0, theyOwe: 0 });
  
  // Form state
  const [formData, setFormData] = useState({
    type: "given" as "given" | "received",
    amount: "",
    transaction_date: new Date().toISOString().split('T')[0],
    note: "",
    payment_method: "cash" as "cash" | "upi" | "bank_transfer" | "other",
    reference_number: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchTransactions();
    fetchContactDetails();
  }, [contactId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/personal-transactions', {
        params: { contact_id: contactId }
      });
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactDetails = async () => {
    try {
      const response = await api.get(`/personal-contacts/${contactId}`);
      if (response.data.success) {
        const contact = response.data.data;
        setContactBalance({
          balance: contact.balance || 0,
          youOwe: contact.you_owe || 0,
          theyOwe: contact.they_owe || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
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
        await api.post('/personal-transactions', payload);
      }

      resetForm();
      fetchTransactions();
      fetchContactDetails();
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to save transaction. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "given",
      amount: "",
      transaction_date: new Date().toISOString().split('T')[0],
      note: "",
      payment_method: "cash",
      reference_number: "",
    });
    setErrors({});
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (transaction: PersonalTransaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      transaction_date: transaction.transaction_date,
      note: transaction.note || "",
      payment_method: transaction.payment_method as any,
      reference_number: transaction.reference_number || "",
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await api.delete(`/personal-transactions/${id}`);
      fetchTransactions();
      fetchContactDetails();
    } catch (error) {
      alert('Failed to delete transaction');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

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
          <h1 className="text-lg font-bold text-[#111827] dark:text-white truncate">{contactName}</h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400">Personal Ledger</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
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
        /* Transaction Form */
        <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Transaction Type <span className="text-red-500">*</span>
              </label>
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
                  onClick={() => setFormData({ ...formData, type: "received" })}
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
                    setFormData({ ...formData, amount: e.target.value.replace(/[^0-9.]/g, "") });
                    if (errors.amount) setErrors({ ...errors, amount: "" });
                  }}
                  placeholder="Enter amount"
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <Calendar className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
                <input
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => {
                    setFormData({ ...formData, transaction_date: e.target.value });
                    if (errors.transaction_date) setErrors({ ...errors, transaction_date: "" });
                  }}
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white"
                />
              </div>
              {errors.transaction_date && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.transaction_date}</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="relative z-10">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Payment Method
              </label>
              <Autocomplete
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value as typeof formData.payment_method })}
                options={paymentMethods}
                placeholder="Select payment method"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="Transaction ID, UPI reference, etc."
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
            </div>

            {/* Note */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Note
              </label>
              <div className="flex items-start gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <FileText className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500 mt-1" />
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Add a note about this transaction"
                  rows={3}
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                />
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
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
        /* Transaction List */
        <div className="flex-1 flex flex-col">
          {/* Balance Summary */}
          <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-[#ECFDF3] to-[#D1FAE5] dark:from-green-900/30 dark:to-green-800/30 rounded-2xl border border-[#CFF6D9] dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#6B7280] dark:text-gray-400">Current Balance</span>
              <Wallet className="w-5 h-5 text-[#16A34A] dark:text-green-400" />
            </div>
            {contactBalance.balance > 0 ? (
              <div>
                <p className="text-xs text-[#6B7280] dark:text-gray-400 mb-1">They owe you</p>
                <p className="text-2xl font-bold text-[#16A34A] dark:text-green-400">{formatAmount(contactBalance.theyOwe)}</p>
              </div>
            ) : contactBalance.balance < 0 ? (
              <div>
                <p className="text-xs text-[#6B7280] dark:text-gray-400 mb-1">You owe</p>
                <p className="text-2xl font-bold text-[#DC2626] dark:text-red-400">{formatAmount(contactBalance.youOwe)}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[#6B7280] dark:text-gray-400 mb-1">No balance</p>
                <p className="text-2xl font-bold text-[#6B7280] dark:text-gray-400">₹0</p>
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
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No transactions yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add your first transaction</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {tx.type === "given" ? (
                            <ArrowUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                          ) : (
                            <ArrowDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                          )}
                          <span className={`text-sm font-semibold ${
                            tx.type === "given"
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}>
                            {tx.type === "given" ? "You Gave" : "You Received"}
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
                          <span>•</span>
                          <span className="capitalize">{tx.payment_method}</span>
                        </div>
                        {tx.note && (
                          <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-2">{tx.note}</p>
                        )}
                        {tx.reference_number && (
                          <p className="text-xs text-[#9CA3AF] dark:text-gray-500 mt-1">Ref: {tx.reference_number}</p>
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
                          onClick={() => handleDelete(tx.id)}
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
    </div>
  );
}

