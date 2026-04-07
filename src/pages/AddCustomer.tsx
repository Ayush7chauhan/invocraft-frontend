import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useParties, useCreateParty, useUpdateParty, useDeleteParty } from "../hooks/useParties";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import type { Party } from "../types/api";

export default function AddCustomer() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "customer" | "supplier" | "both">("all");

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    gst_number: "",
    type: "customer" as "customer" | "supplier" | "both",
    opening_balance: "",
    status: "active" as "active" | "inactive",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingParty, setDeletingParty] = useState<Party | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: parties = [], isLoading } = useParties();
  const createMutation = useCreateParty();
  const updateMutation = useUpdateParty();
  const deleteMutation = useDeleteParty();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: Record<string, string> = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) newErrors.name = "Party name is required.";

    if (formData.mobile) {
      if (!/^\d{10}$/.test(formData.mobile)) {
        newErrors.mobile = "Mobile number must be exactly 10 digits.";
      }
    }

    const openBal = parseFloat(formData.opening_balance);
    if (formData.opening_balance && isNaN(openBal)) {
      newErrors.opening_balance = "Opening balance must be a valid number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      name: trimmedName,
      opening_balance: openBal || 0,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      resetForm();
    } catch (error: any) {
      console.error("Failed to save party:", error);
      setErrors({ submit: error.response?.data?.message || "Failed to save data to server." });
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
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (party: Party, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({
      name: party.name,
      mobile: party.mobile || "",
      address: party.address || "",
      gst_number: party.gst_number || "",
      type: party.type,
      opening_balance: party.opening_balance.toString(),
      status: party.status || "active",
    });
    setEditingId(party.id);
    setShowForm(true);
  };

  const filteredParties = useMemo(() => {
    return parties.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || (p.mobile?.includes(searchQuery));
      const matchesType = filterType === "all" || p.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [parties, searchQuery, filterType]);

  const formatAmount = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

  return (
    <PageContainer>
      <PageHeader
        title={showForm ? (editingId ? "Edit Party" : "New Party") : "Parties & Ledger"}
        showBack={true}
        onBackClick={showForm ? resetForm : () => navigate(-1)}
        rightAction={
          !showForm && (
            <Button size="icon" onClick={() => setShowForm(true)} className="rounded-xl shadow-lg shadow-green-500/20">
              <Plus className="w-5 h-5" />
            </Button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32 custom-scrollbar">
        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Party Name *</label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe / Gupta Corp" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile</label>
                  <Input value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} placeholder="10 Digit Number" maxLength={10} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Opening Bal.</label>
                  <Input value={formData.opening_balance} onChange={(e) => setFormData({...formData, opening_balance: e.target.value})} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Party Type</label>
                 <div className="grid grid-cols-3 gap-2">
                   {(["customer", "supplier", "both"] as const).map(t => (
                     <button key={t} type="button" onClick={() => setFormData({...formData, type: t})} className={`h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.type === t ? "bg-green-500 text-white border-green-500 shadow-lg" : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-800"}`}>
                       {t}
                     </button>
                   ))}
                 </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full h-24 p-4 rounded-3xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 text-sm outline-none focus:border-green-500 transition-colors resize-none" placeholder="Enter full address..." />
              </div>
            </div>
            
            {Object.keys(errors).length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please fix the following errors:</span>
                </div>
                <ul className="text-xs text-rose-600 dark:text-rose-400 font-medium list-disc pl-5">
                  {Object.values(errors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending} className="w-full h-16 rounded-2xl shadow-xl shadow-green-500/20 font-black tracking-widest">
              {editingId ? "UPDATE PARTY" : "CREATE PARTY"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="SEARCH PARTIES..." className="pl-12 rounded-2xl bg-gray-50 border-none shadow-inner" />
            </div>

            <div className="flex gap-2 pb-2 overflow-x-auto hide-scrollbar">
              {(["all", "customer", "supplier", "both"] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterType === t ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}>
                  {t}
                </button>
              ))}
            </div>

            {isLoading ? (
               <div className="grid gap-4">
                 {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-50 dark:bg-gray-800/50 animate-pulse rounded-[32px]" />)}
               </div>
            ) : filteredParties.length === 0 ? (
               <div className="py-20 text-center space-y-4">
                  <Users className="w-16 h-16 text-gray-200 mx-auto" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No parties found</p>
               </div>
            ) : (
              <div className="grid gap-4">
                {filteredParties.map(party => (
                  <Card key={party.id} className="group rounded-[32px] border-2 border-gray-50 dark:border-gray-800/50 hover:border-green-500/20 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => navigate(`/ledger/${party.id}`, { state: { contactName: party.name, contactType: "business" } })}>
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-400 font-black text-xl group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                          {party.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">{party.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <p className="text-[10px] font-bold text-gray-400 truncate">{party.mobile || "No Number"}</p>
                             <Badge variant="primary" className="text-[8px] px-1.5 py-0">
                                {party.type}
                             </Badge>
                          </div>
                          {party.opening_balance !== 0 && (
                             <p className={`text-[10px] font-black mt-1 ${party.opening_balance > 0 ? "text-green-500" : "text-rose-500"}`}>
                               BAL: {formatAmount(Math.abs(party.opening_balance))}
                             </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={(e) => handleEdit(party, e)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeletingParty(party); setDeleteModalOpen(true); }} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingParty(null); }}
        onConfirm={() => deletingParty && deleteMutation.mutate(deletingParty.id, { onSettled: () => setDeleteModalOpen(false) })}
        title="Delete Party?"
        message={`Are you sure you want to delete ${deletingParty?.name}? All associated invoices and ledger entries will be permanently removed.`}
        itemName={deletingParty?.name || ""}
      />
    </PageContainer>
  );
}
