import { useState, useEffect } from "react";
import { ArrowLeft, TrendingDown, Calendar, DollarSign, Search, Loader2, CheckCircle2, X, Edit2, Trash2, Plus, Tag } from "lucide-react";
import api from "../utils/api";
import { Autocomplete } from "../components/ui/autocomplete";

type PersonalExpense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  description: string | null;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
};

type PersonalExpenseProps = {
  onBack: () => void;
};

export default function PersonalExpense({ onBack }: PersonalExpenseProps) {
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    gst_rate: "",
    expense_date: new Date().toISOString().split('T')[0],
    description: "",
    payment_method: "cash" as "cash" | "upi" | "card" | "bank_transfer" | "other",
    reference_number: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const categories = [
    { value: "food", label: "Food" },
    { value: "travel", label: "Travel" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "bills", label: "Bills" },
    { value: "health", label: "Health" },
    { value: "education", label: "Education" },
    { value: "transport", label: "Transport" },
    { value: "gifts", label: "Gifts" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "groceries", label: "Groceries" },
    { value: "furniture", label: "Furniture" },
    { value: "appliances", label: "Appliances" },
    { value: "books", label: "Books" },
    { value: "sports", label: "Sports" },
    { value: "beauty", label: "Beauty" },
    { value: "other", label: "Other" },
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/personal-expenses');
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.expense_date) {
      newErrors.expense_date = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const baseAmount = parseFloat(formData.amount);
      const gstRate = formData.gst_rate ? parseFloat(formData.gst_rate) : 0;
      const totalAmount = gstRate > 0
        ? baseAmount + (baseAmount * gstRate) / 100
        : baseAmount;

      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        amount: Math.round(totalAmount * 100) / 100,
        expense_date: formData.expense_date,
        description: formData.description.trim() || null,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number.trim() || null,
        notes: formData.notes.trim() || null,
      };

      if (editingId) {
        await api.put(`/personal-expenses/${editingId}`, payload);
      } else {
        await api.post('/personal-expenses', payload);
      }

      resetForm();
      fetchExpenses();
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
    } catch (error: any) {
      const res = error.response?.data;
      let message = res?.message || 'Failed to save expense. Please try again.';
      if (res?.errors && typeof res.errors === 'object') {
        const first = Object.values(res.errors).flat();
        if (first.length) message = String(first[0]);
      }
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      amount: "",
      gst_rate: "",
      expense_date: new Date().toISOString().split('T')[0],
      description: "",
      payment_method: "cash",
      reference_number: "",
      notes: "",
    });
    setErrors({});
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (expense: any) => {
    setFormData({
      title: expense.title || "",
      category: expense.category,
      amount: expense.amount.toString(),
      gst_rate: expense.gst_rate ? expense.gst_rate.toString() : "",
      expense_date: expense.expense_date,
      description: expense.description || "",
      payment_method: expense.payment_method as any,
      reference_number: expense.reference_number || "",
      notes: expense.notes || "",
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await api.delete(`/personal-expenses/${id}`);
      fetchExpenses();
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
    } catch (error) {
      alert('Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.description && expense.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (expense.title && expense.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
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
          {showForm ? (editingId ? "Edit Expense" : "Add Expense/Purchase") : "Personal Expenses & Purchases"}
        </h1>
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
        /* Add/Edit Form */
        <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Title/Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: "" });
                }}
                placeholder="e.g., Groceries, Phone, Clothes, etc."
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.title
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                    : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
                } text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div className="relative z-10">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Category <span className="text-red-500">*</span>
              </label>
              <Autocomplete
                value={formData.category}
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value });
                  if (errors.category) setErrors({ ...errors, category: "" });
                }}
                options={categories}
                placeholder="Select category"
                className={errors.category ? "border-red-300 dark:border-red-700" : ""}
              />
              {errors.category && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.category}</p>
              )}
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

            {/* GST Rate */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                GST Rate (%)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={formData.gst_rate}
                onChange={(e) => {
                  setFormData({ ...formData, gst_rate: e.target.value.replace(/[^0-9.]/g, "") });
                }}
                placeholder="Enter GST rate (e.g., 18)"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
              {formData.amount && formData.gst_rate && parseFloat(formData.gst_rate) > 0 && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Base Amount:</span>
                    <span className="font-semibold text-[#111827] dark:text-white">
                      ₹{parseFloat(formData.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">GST ({formData.gst_rate}%):</span>
                    <span className="font-semibold text-[#111827] dark:text-white">
                      ₹{((parseFloat(formData.amount) * parseFloat(formData.gst_rate || "0")) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                    <span className="font-semibold text-[#111827] dark:text-white">Total Amount:</span>
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      ₹{(parseFloat(formData.amount) + (parseFloat(formData.amount) * parseFloat(formData.gst_rate || "0")) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
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
                  value={formData.expense_date}
                  onChange={(e) => {
                    setFormData({ ...formData, expense_date: e.target.value });
                    if (errors.expense_date) setErrors({ ...errors, expense_date: "" });
                  }}
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white"
                />
              </div>
              {errors.expense_date && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.expense_date}</p>
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

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500 resize-none"
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
                placeholder="Transaction reference (optional)"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes (optional)"
                rows={2}
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
                  {editingId ? "Update Expense" : "Add Expense"}
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Expense List */
        <div className="flex-1 flex flex-col">
          {/* Search and Filter */}
          <div className="px-4 py-4 space-y-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expenses..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <button
                onClick={() => setFilterCategory("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  filterCategory === "all"
                    ? "bg-[#22C55E] dark:bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    filterCategory === cat.value
                      ? "bg-[#22C55E] dark:bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                  }`}
                >
                  {cat.label}
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
            ) : filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <TrendingDown className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No expenses or purchases found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add your first expense or purchase</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
                          <h3 className="text-base font-bold text-[#111827] dark:text-white">
                            {expense.title || expense.category}
                          </h3>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-[#6B7280] dark:text-gray-400">
                            {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                          {formatAmount(expense.amount)}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[#6B7280] dark:text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(expense.expense_date)}</span>
                          </div>
                          <span>•</span>
                          <span className="capitalize">{expense.payment_method.replace('_', ' ')}</span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-2">{expense.description}</p>
                        )}
                        {expense.notes && (
                          <p className="text-xs text-[#9CA3AF] dark:text-gray-500 mt-1 italic">{expense.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
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

