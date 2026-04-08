import { useState, useMemo } from "react";
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  History, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { partySchema, type PartyFormValues } from "../lib/validationSchema";
import { useParties, useCreateParty, useUpdateParty, useDeleteParty } from "../hooks/useParties";
import type { Party } from "../types/api";

import DeleteConfirmModal from "../components/DeleteConfirmModal";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { cn } from "../lib/utils";

export default function AddCustomer() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "customer" | "supplier" | "both">("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: parties = [], isLoading } = useParties();
  const createMutation = useCreateParty();
  const updateMutation = useUpdateParty();
  const deleteMutation = useDeleteParty();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema) as any,
    defaultValues: {
      type: "customer",
      status: "active",
      openingBalance: 0,
      balanceType: "To Receive",
      mobile: "",
      address: "",
      gstNumber: "",
    }
  });

  const selectedType = watch("type");
  const selectedBalanceType = watch("balanceType");

  const onSubmit = async (data: PartyFormValues) => {
    try {
      const openBal = data.balanceType === "To Pay" ? -Math.abs(data.openingBalance) : Math.abs(data.openingBalance);

      const payload = {
        name: data.name,
        mobile: data.mobile,
        address: data.address,
        gst_number: data.gstNumber,
        type: data.type.toLowerCase(),
        opening_balance: openBal,
        status: data.status.toLowerCase(),
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload } as any);
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      handleCloseForm();
    } catch (e) {
      console.error("Registry synchronization failure:", e);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  const handleEdit = (party: Party, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(party.id);
    
    setValue("name", party.name);
    setValue("mobile", party.mobile || "");
    setValue("address", party.address || "");
    setValue("gstNumber", party.gst_number || "");
    setValue("type", party.type as any);
    setValue("status", (party.status || "active") as any);
    setValue("openingBalance", Math.abs(party.opening_balance));
    setValue("balanceType", party.opening_balance < 0 ? "To Pay" : "To Receive");
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const filteredParties = useMemo(() => {
    return parties.filter((p: Party) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || (p.mobile?.includes(searchQuery));
      const matchesType = filterType === "all" || p.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [parties, searchQuery, filterType]);

  const formatAmount = (v: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.abs(v));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden theme-transition">
      <PageHeader
        title={showForm ? (editingId ? "Modify Protocol" : "Initialize Entity") : "Entity Registry"}
        subtitle={showForm ? "Configure Commercial Counterparty Metadata" : "Global Commercial Network & Settlement Feed"}
        showBack={showForm}
        onBackClick={handleCloseForm}
        rightAction={
          !showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="rounded-md uppercase tracking-widest text-[10px] font-black h-9 shadow-lg shadow-primary/10">
              <Plus className="w-3.5 h-3.5 mr-2" /> REGISTER ENTITY
            </Button>
          )
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="animate-in slide-in-from-bottom-4 duration-500 space-y-12 pb-20">
            
            {/* Section 1: Identification */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-5 bg-primary rounded-full" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Principal Metadata</h3>
              </div>
              
              <Card className="border shadow-sm pointer-events-auto bg-card">
                 <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Input 
                         label="Entity Trade Name" 
                         placeholder="e.g. Acme Corp / Retail Node" 
                         error={errors.name?.message}
                         {...register("name")} 
                         leftIcon={<Users className="w-4 h-4" />}
                       />
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Classification Protocol</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["customer", "supplier", "both"] as const).map(t => (
                              <button 
                                key={t} 
                                type="button" 
                                onClick={() => setValue("type", t)} 
                                className={cn(
                                  "h-10 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all",
                                  selectedType === t 
                                    ? "bg-primary text-primary-foreground border-primary shadow-md" 
                                    : "bg-background text-muted-foreground border-input hover:bg-muted/50"
                                )}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Input 
                         label="Communication Path (Mobile)" 
                         placeholder="10-digit node identifier" 
                         error={errors.mobile?.message}
                         {...register("mobile")} 
                         leftIcon={<Phone className="h-4 w-4" />}
                       />
                       <Input 
                         label="Fiscal Identifier (GSTIN)" 
                         placeholder="22AAAAA0000A1Z5" 
                         error={errors.gstNumber?.message}
                         {...register("gstNumber")} 
                         leftIcon={<ShieldCheck className="h-4 w-4" />}
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-sm font-medium leading-none text-muted-foreground ml-0.5 opacity-60">Physical Headquarters (Address)</label>
                       <textarea 
                         {...register("address")} 
                         placeholder="Complete physical registry location..." 
                         className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm outline-none"
                       />
                    </div>
                 </CardContent>
              </Card>
            </div>

            {/* Section 2: Fiscal Calibration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Settlement Calibration</h3>
              </div>
              
              <Card className="border shadow-sm pointer-events-auto bg-card">
                 <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Input 
                         label="Opening Fiscal Volume" 
                         type="number"
                         placeholder="0.00" 
                         step="0.01"
                         error={errors.openingBalance?.message}
                         {...register("openingBalance")} 
                         leftIcon={<span className="text-[11px] font-black opacity-40">₹</span>}
                       />
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Settlement Direction</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(["To Receive", "To Pay"] as const).map(t => (
                              <button 
                                key={t} 
                                type="button" 
                                onClick={() => setValue("balanceType", t)} 
                                className={cn(
                                  "h-10 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all",
                                  selectedBalanceType === t 
                                    ? (t === "To Pay" ? "bg-rose-50 text-rose-700 border-rose-200 shadow-sm" : "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm")
                                    : "bg-background text-muted-foreground border-input hover:bg-muted/50"
                                )}
                              >
                                {t === "To Pay" ? <ArrowUpRight className="inline w-3 h-3 mr-1" /> : <ArrowDownLeft className="inline w-3 h-3 mr-1" />}
                                {t}
                              </button>
                            ))}
                          </div>
                       </div>
                    </div>
                 </CardContent>
              </Card>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
               <Button 
                type="button" 
                variant="outline"
                onClick={handleCloseForm}
                className="flex-1 h-12 uppercase font-black tracking-widest text-[11px]"
               >
                 DISCARD DRAFT
               </Button>
               <Button 
                type="submit" 
                isLoading={isSubmitting} 
                className="flex-1 h-12 uppercase font-black tracking-widest text-[11px]"
               >
                 {editingId ? "UPDATE REGISTRY NODE" : "COMMIT ENTITY REGISTER"}
               </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-12">
            {/* Global Visual Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-700">
               <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-primary/20 transition-all group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">Consolidated Network</span>
                  <div className="flex items-end justify-between">
                     <span className="text-3xl font-black text-foreground tracking-tighter">{parties.length}</span>
                     <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100">NODES_ONLINE</Badge>
                  </div>
               </Card>
               <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-emerald-200 transition-all group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity text-emerald-600">Receivable Protocol</span>
                  <TrendingUp className="text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity absolute right-4 top-4" size={24} />
                  <div className="flex items-end">
                     <span className="text-2xl font-black text-emerald-700 tracking-tighter">0.00</span>
                  </div>
               </Card>
               <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-rose-200 transition-all group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity text-rose-600">Payable Liabilities</span>
                  <div className="flex items-end">
                     <span className="text-2xl font-black text-rose-700 tracking-tighter">0.00</span>
                  </div>
               </Card>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <Input 
                   placeholder="Search commercial counterparties..." 
                   value={searchQuery} 
                   onChange={(e) => setSearchQuery(e.target.value)} 
                   leftIcon={<Search className="w-4 h-4" />}
                   className="h-11 shadow-sm border-muted-foreground/10"
                 />
                 <div className="flex bg-muted/30 p-1 rounded-md border shadow-sm w-full sm:w-auto overflow-x-auto hide-scrollbar">
                    {(["all", "customer", "supplier", "both"] as const).map(t => (
                      <button 
                        key={t} 
                        onClick={() => setFilterType(t)} 
                        className={cn(
                          "px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap whitespace-nowrap shrink-0",
                          filterType === t ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Registry Feed</p>
                      <Badge variant="secondary" className="text-[9px] h-5">{filteredParties.length} Entities Indexed</Badge>
                   </div>
                   <History className="w-4 h-4 text-muted-foreground/40" />
                </div>

                {isLoading ? (
                  <div className="grid gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-md border" />
                    ))}
                  </div>
                ) : filteredParties.length === 0 ? (
                  <EmptyState 
                    title="Registry Static"
                    description={searchQuery ? "No commercial counterparties match the current query node." : "Initialize your first commercial connection to begin settlement logs."}
                    icon={<Users className="w-12 h-12 text-muted-foreground/20" />}
                    actionLabel={!searchQuery ? "REGISTER ENTITY" : undefined}
                    onAction={!searchQuery ? () => setShowForm(true) : undefined}
                  />
                ) : (
                  <div className="grid gap-3 animate-in fade-in duration-700">
                    {filteredParties.map(party => (
                      <Card 
                        key={party.id} 
                        className="group pointer-events-auto hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md bg-card overflow-hidden" 
                        onClick={() => navigate(`/ledger/${party.id}`, { state: { contactName: party.name, contactType: "business" } })}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                           <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="h-12 w-12 rounded-lg bg-zinc-50 border flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${party.name}&background=f9fafb&color=18181b&bold=true')` }}>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2">
                                    <h4 className="font-black text-foreground uppercase tracking-widest text-sm truncate">{party.name}</h4>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:translate-x-1 transition-transform" />
                                 </div>
                                 <div className="flex items-center gap-2 mt-1 opacity-60">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{party.mobile || "EXT_ID_NULL"}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none text-primary">{party.type}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-8 shrink-0">
                             <div className="text-right hidden sm:block">
                                <p className={cn(
                                   "text-sm font-black tracking-tight leading-none mb-1",
                                   party.opening_balance > 0 ? "text-emerald-600" : party.opening_balance < 0 ? "text-rose-600" : "text-muted-foreground"
                                )}>
                                   {formatAmount(party.opening_balance)}
                                </p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">FISCAL_BALANCE</p>
                             </div>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={(e) => handleEdit(party, e)} 
                                  className="h-9 w-9 rounded-md hover:bg-muted"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={(e) => { e.stopPropagation(); setDeleteId(party.id); }} 
                                  className="h-9 w-9 rounded-md hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                             </div>
                           </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteId}
        isLoading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Nullify Entity Protocol"
        message="This operation will permanently delete the commercial counterparty node. All associated registry logs will be purged."
      />
    </div>
  );
}
