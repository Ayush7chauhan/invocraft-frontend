import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Calendar, DollarSign, ArrowUp, ArrowDown, Loader2, CheckCircle2, X, User, Search } from "lucide-react";
import api from "../utils/api";
import { Autocomplete } from "../components/ui/autocomplete";

type Party = {
  id: number;
  name: string;
  type: "customer" | "supplier" | "both";
};

type Transaction = {
  id: number;
  party_id: number;
  type: "debit" | "credit";
  amount: number;
  transaction_date: string;
  note: string | null;
  party?: Party;
};

type AddKhataEntryProps = {
  onBack: () => void;
};

export default function AddKhataEntry({ onBack }: AddKhataEntryProps) {
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "debit" | "credit">("all");
  
  // Form state
  const [formData, setFormData] = useState({
    party_id: "",
    type: "credit" as "debit" | "credit",
    amount: "",
    transaction_date: new Date().toISOString().split('T')[0],
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTransactions();
    fetchParties();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions');
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParties = async () => {
    try {
      const response = await api.get('/parties');
      if (response.data.success) {
        setParties(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.party_id) {
      newErrors.party_id = "Please select a party";
    }
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
        party_id: parseInt(formData.party_id),
        type: formData.type,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date,
        note: formData.note || null,
      };

      if (editingId) {
        // Update not implemented in backend yet, so we'll skip for now
        alert('Update functionality coming soon');
      } else {
        await api.post('/transactions', payload);
      }

      resetForm();
      fetchTransactions();
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
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
      party_id: "",
      type: "credit",
      amount: "",
      transaction_date: new Date().toISOString().split('T')[0],
      note: "",
    });
    setErrors({});
    setShowForm(false);
    setEditingId(null);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.party?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || tx.type === filterType;
    return matchesSearch && matchesType;
  });

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
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827] dark:text-white" />
        </button>
        <h1 className="text-lg font-bold text-[#111827] dark:text-white flex-1">
          {showForm ? "Add Khata Entry" : "Khata Book"}
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-9 h-9 rounded-xl bg-[#22C55E] dark:bg-green-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <FileText className="w-5 h-5" />
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
        /* Add Entry Form */
        <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Party Selection */}
            <div className="relative z-10">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Select Party <span className="text-red-500">*</span>
              </label>
              <Autocomplete
                value={formData.party_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, party_id: value });
                  if (errors.party_id) setErrors({ ...errors, party_id: "" });
                }}
                options={parties.map(party => ({
                  value: party.id.toString(),
                  label: `${party.name} (${party.type})`
                }))}
                placeholder="Select a party"
                className={errors.party_id ? "border-red-300 dark:border-red-700" : ""}
                disabled={parties.length === 0}
              />
              {errors.party_id && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.party_id}</p>
              )}
              {parties.length === 0 && (
                <p className="mt-1 text-xs text-[#6B7280] dark:text-gray-400">
                  No parties found. <button type="button" onClick={() => onBack()} className="text-[#22C55E] dark:text-green-400 underline">Add a customer</button> first.
                </p>
              )}
            </div>

            {/* Transaction Type */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Transaction Type <span className="text-red-500">*</span>
              </label>
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
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <DollarSign className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value.replace(/[^0-9.]/g, "") });
                    if (errors.amount) setErrors({ ...errors, amount: "" });
                  }}
                  placeholder="Enter amount"
                  className={`flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    errors.amount ? "text-red-600 dark:text-red-400" : ""
                  }`}
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

            {/* Note */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Note
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Add a note about this transaction"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500 resize-none"
              />
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || parties.length === 0}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                isSubmitting || parties.length === 0
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
                  Add Entry
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Transaction List */
        <div className="flex-1 flex flex-col">
          {/* Search and Filter */}
          <div className="px-4 py-4 space-y-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {(["all", "credit", "debit"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    filterType === type
                      ? "bg-[#22C55E] dark:bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                  }`}
                >
                  {type === "credit" ? "Credit (In)" : type === "debit" ? "Debit (Out)" : "All"}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] dark:text-green-400" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No transactions found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add your first khata entry</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {tx.type === "credit" ? (
                            <ArrowDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                          <h3 className="text-base font-bold text-[#111827] dark:text-white truncate">
                            {tx.party?.name || 'Unknown'}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                            tx.type === "credit"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          }`}>
                            {tx.type === "credit" ? "Credit" : "Debit"}
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
                          {tx.party?.type && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{tx.party.type}</span>
                            </>
                          )}
                        </div>
                        {tx.note && (
                          <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-2">{tx.note}</p>
                        )}
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

