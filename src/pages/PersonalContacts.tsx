import { useState, useEffect } from "react";
import {
  ArrowLeft,
  UserPlus,
  Search,
  Phone,
  MapPin,
  Users,
  CheckCircle2,
  X,
  Loader2,
  Edit2,
  Trash2,
  Wallet,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import api from "../utils/api";
import axios from "axios";

type PersonalContact = {
  id: number;
  name: string;
  mobile: string | null;
  email: string | null;
  address: string | null;
  relationship: "friend" | "family" | "colleague" | "neighbor" | "other";
  opening_balance: number;
  status: "active" | "inactive";
  balance?: number;
  you_owe?: number;
  they_owe?: number;
};

type PersonalContactsProps = {
  onBack: () => void;
  onViewLedger?: (contactId: number, contactName: string) => void;
};

export default function PersonalContacts({
  onBack,
  onViewLedger,
}: PersonalContactsProps) {
  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState<PersonalContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRelationship, setFilterRelationship] = useState<
    "all" | "friend" | "family" | "colleague" | "neighbor" | "other"
  >("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    relationship: "friend" as
      | "friend"
      | "family"
      | "colleague"
      | "neighbor"
      | "other",
    opening_balance: "",
    status: "active" as "active" | "inactive",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/personal-contacts");
      if (response.data.success) {
        setContacts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
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
      formData.email &&
      formData.email.length > 0 &&
      !formData.email.includes("@")
    ) {
      newErrors.email = "Invalid email address";
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
        email: formData.email || null,
        address: formData.address || null,
        relationship: formData.relationship,
        opening_balance: formData.opening_balance
          ? parseFloat(formData.opening_balance)
          : 0,
        status: formData.status,
      };

      if (editingId) {
        await api.put(`/personal-contacts/${editingId}`, payload);
      } else {
        await api.post("/personal-contacts", payload);
      }

      resetForm();
      fetchContacts();

      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    } catch (error: unknown) {
      setErrors({
        submit: axios.isAxiosError(error)
          ? (error.response?.data?.message ??
            "Failed to save contact. Please try again.")
          : "Failed to save contact. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      email: "",
      address: "",
      relationship: "friend",
      opening_balance: "",
      status: "active",
    });
    setErrors({});
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (contact: PersonalContact) => {
    setFormData({
      name: contact.name,
      mobile: contact.mobile || "",
      email: contact.email || "",
      address: contact.address || "",
      relationship: contact.relationship,
      opening_balance: contact.opening_balance.toString(),
      status: contact.status,
    });
    setEditingId(contact.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      await api.delete(`/personal-contacts/${id}`);
      fetchContacts();
    } catch (e) {
      console.error(e);
      alert("Failed to delete contact");
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.mobile && contact.mobile.includes(searchQuery));
    const matchesRelationship =
      filterRelationship === "all" ||
      contact.relationship === filterRelationship;
    return matchesSearch && matchesRelationship;
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRelationshipColor = (relationship: string) => {
    const colors: Record<string, string> = {
      friend:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      family:
        "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
      colleague:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      neighbor:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      other: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400",
    };
    return colors[relationship] || colors.other;
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
              ? "Edit Contact"
              : "Add Contact"
            : "Personal Contacts"}
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
                placeholder="Enter name"
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

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                    : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
                } text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.email}
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

            {/* Relationship */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Relationship <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    "friend",
                    "family",
                    "colleague",
                    "neighbor",
                    "other",
                  ] as const
                ).map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, relationship: rel })
                    }
                    className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                      formData.relationship === rel
                        ? "border-[#22C55E] dark:border-green-500 bg-[#ECFDF3] dark:bg-green-900/30 text-[#16A34A] dark:text-green-400"
                        : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#374151] dark:text-gray-300 hover:border-[#22C55E] dark:hover:border-green-500"
                    }`}
                  >
                    {rel.charAt(0).toUpperCase() + rel.slice(1)}
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
                <Wallet className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
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
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
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
                  {editingId ? "Update Contact" : "Add Contact"}
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Contact List */
        <div className="flex-1 flex flex-col">
          {/* Search and Filter */}
          <div className="px-4 py-4 space-y-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {(
                [
                  "all",
                  "friend",
                  "family",
                  "colleague",
                  "neighbor",
                  "other",
                ] as const
              ).map((rel) => (
                <button
                  key={rel}
                  onClick={() => setFilterRelationship(rel)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    filterRelationship === rel
                      ? "bg-[#22C55E] dark:bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                  }`}
                >
                  {rel.charAt(0).toUpperCase() + rel.slice(1)}
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
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                  No contacts found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Add your first contact to track money
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContacts.map((contact) => {
                  const balance = contact.balance || 0;
                  const youOwe = contact.you_owe || 0;
                  const theyOwe = contact.they_owe || 0;

                  return (
                    <div
                      key={contact.id}
                      className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => onViewLedger?.(contact.id, contact.name)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-[#111827] dark:text-white truncate">
                              {contact.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-lg text-xs font-medium ${getRelationshipColor(contact.relationship)}`}
                            >
                              {contact.relationship}
                            </span>
                            {contact.status === "inactive" && (
                              <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                Inactive
                              </span>
                            )}
                          </div>
                          {contact.mobile && (
                            <div className="flex items-center gap-2 text-sm text-[#6B7280] dark:text-gray-400 mb-1">
                              <Phone className="w-4 h-4" />
                              <span>{contact.mobile}</span>
                            </div>
                          )}
                          {contact.address && (
                            <div className="flex items-start gap-2 text-sm text-[#6B7280] dark:text-gray-400 mb-2">
                              <MapPin className="w-4 h-4 mt-0.5 flex shrink-0" />

                              <span className="line-clamp-2">
                                {contact.address}
                              </span>
                            </div>
                          )}
                          {/* Balance Display */}
                          <div className="mt-2 pt-2 border-t border-[#E5E7EB] dark:border-gray-700">
                            {balance > 0 ? (
                              <div className="flex items-center gap-2 text-sm">
                                <ArrowDown className="w-4 h-4 text-[#16A34A] dark:text-green-400" />
                                <span className="text-[#6B7280] dark:text-gray-400">
                                  They owe you:{" "}
                                </span>
                                <span className="font-bold text-[#16A34A] dark:text-green-400">
                                  {formatAmount(theyOwe)}
                                </span>
                              </div>
                            ) : balance < 0 ? (
                              <div className="flex items-center gap-2 text-sm">
                                <ArrowUp className="w-4 h-4 text-[#DC2626] dark:text-red-400" />
                                <span className="text-[#6B7280] dark:text-gray-400">
                                  You owe:{" "}
                                </span>
                                <span className="font-bold text-[#DC2626] dark:text-red-400">
                                  {formatAmount(youOwe)}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-[#6B7280] dark:text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-green-400" />
                                <span>No balance</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className="flex items-center gap-2 ml-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEdit(contact)}
                            className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
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
    </div>
  );
}
