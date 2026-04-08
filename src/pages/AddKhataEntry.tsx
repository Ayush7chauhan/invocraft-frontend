import { useState, useEffect, useMemo } from "react";
import { 
  Calendar, 
  Plus, 
  Search, 
  ChevronRight, 
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  LayoutDashboard,
  FileText,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Scale
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { khataEntrySchema, type KhataEntryFormValues } from "../lib/validationSchema";
import api from "../utils/api";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Autocomplete } from "../components/ui/autocomplete";
import { cn } from "../lib/utils";

type Party = {
  id: number;
  name: string;
  mobile: string;
  type: string;
};

type Entry = {
  id: number;
  party_id: number;
  entry_type: "credit" | "debit";
  amount: number;
  notes: string | null;
  entry_date: string;
  party_name: string;
};

export default function AddKhataEntry() {
  const navigate = useNavigate();
  const [parties, setParties] = useState<Party[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<KhataEntryFormValues>({
    resolver: zodResolver(khataEntrySchema) as any,
    defaultValues: {
      partyId: "" as any,
      amount: 0,
      type: "debit",
      notes: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const watchType = watch("type");

  useEffect(() => {
    fetchParties();
    fetchEntries();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await api.get("/parties");
      if (response.data.success) {
        setParties(response.data.data);
      }
    } catch (error) {
      console.error("Registry fetch failure:", error);
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/khata-entries");
      if (response.data.success) {
        setEntries(response.data.data);
      }
    } catch (error) {
      console.error("Registry feed interrupt:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: KhataEntryFormValues) => {
    try {
      const payload = {
        party_id: Number(data.partyId),
        amount: Number(data.amount),
        entry_type: data.type,
        description: data.notes || "",
        entry_date: data.date,
      };

      await api.post("/khata-entries", payload);
      reset();
      setShowForm(false);
      fetchEntries();
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    } catch (error) {
      console.error("Registry commit failure:", error);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => 
      entry.party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery]);

  const stats = useMemo(() => {
    const totalOut = entries.filter(e => e.entry_type === "debit").reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalIn = entries.filter(e => e.entry_type === "credit").reduce((acc, curr) => acc + Number(curr.amount), 0);
    return { totalOut, totalIn };
  }, [entries]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden theme-transition">
      <PageHeader
        title={showForm ? "Add New Registry Entry" : "Credit Ledger Node"}
        subtitle={showForm ? "Configure Commercial Settlement Protocol" : "Internal Multi-Node Counterparty Settlements"}
        showBack={showForm}
        onBackClick={() => setShowForm(false)}
        rightAction={
          !showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="rounded-md uppercase tracking-widest text-[10px] font-black h-9 shadow-lg shadow-primary/10">
              <Plus className="w-3.5 h-3.5 mr-2" /> RECORD ENTRY
            </Button>
          )
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {!showForm && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
             <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-rose-200 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                   <ArrowUpRight size={100} className="text-rose-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 opacity-60">Consolidated Outflow</span>
                <div className="flex items-end justify-between relative z-10">
                   <span className="text-3xl font-black text-rose-700 tracking-tighter">{formatAmount(stats.totalOut)}</span>
                   <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-rose-50 text-rose-600 border-rose-100 italic">TOTAL_DEBIT</Badge>
                </div>
             </Card>
             <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-emerald-200 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                   <ArrowDownLeft size={100} className="text-emerald-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60">Consolidated Inflow</span>
                <div className="flex items-end justify-between relative z-10">
                   <span className="text-3xl font-black text-emerald-700 tracking-tighter">{formatAmount(stats.totalIn)}</span>
                   <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100 italic">TOTAL_CREDIT</Badge>
                </div>
             </Card>
          </section>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-20">
             
             {/* Section 1: Entity & Value */}
             <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-5 bg-primary rounded-full" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Principal Identification</h3>
                </div>
                
                <Card className="border shadow-sm pointer-events-auto bg-card">
                   <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Counterparty Registry Node</label>
                          <Controller
                            name="partyId"
                            control={control}
                            render={({ field }) => (
                              <Autocomplete
                                options={parties.map(p => ({ value: String(p.id), label: p.name }))}
                                value={String(field.value)}
                                onValueChange={(val) => field.onChange(Number(val))}
                                placeholder="Search commercial registry..."
                                className="rounded-md border-input h-10 shadow-sm"
                              />
                            )}
                          />
                          {errors.partyId?.message && <p className="text-[10px] font-black text-destructive uppercase tracking-widest mt-1.5 ml-1">{(errors.partyId.message as any)}</p>}
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Flow Direction</label>
                           <div className="grid grid-cols-2 gap-4">
                             <button
                               type="button"
                               onClick={() => setValue("type", "debit")}
                               className={cn(
                                 "h-10 rounded-md border flex items-center justify-center gap-2 transition-all duration-300 uppercase tracking-widest text-[9px] font-black",
                                 watchType === "debit" 
                                   ? "bg-rose-50 text-rose-700 border-rose-200 shadow-sm ring-1 ring-rose-500/20" 
                                   : "bg-muted/30 border-input text-muted-foreground hover:bg-muted/50"
                               )}
                             >
                               <ArrowUpRight className="h-3.5 w-3.5" /> YOU GAVE
                             </button>
                             <button
                               type="button"
                               onClick={() => setValue("type", "credit")}
                               className={cn(
                                 "h-10 rounded-md border flex items-center justify-center gap-2 transition-all duration-300 uppercase tracking-widest text-[9px] font-black",
                                 watchType === "credit" 
                                   ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm ring-1 ring-emerald-500/20" 
                                   : "bg-muted/30 border-input text-muted-foreground hover:bg-muted/50"
                               )}
                             >
                               <ArrowDownLeft className="h-3.5 w-3.5" /> YOU GOT
                             </button>
                           </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                       <Input 
                        label="Registry Valuation" 
                        type="number" 
                        placeholder="0.00" 
                        {...register("amount")} 
                        error={errors.amount?.message} 
                        leftIcon={<Wallet className="w-4 h-4 text-muted-foreground" />} 
                       />
                       <Input 
                        label="Registry Timestamp" 
                        type="date" 
                        {...register("date")} 
                        error={errors.date?.message} 
                        leftIcon={<Calendar className="w-4 h-4 text-muted-foreground" />} 
                       />
                    </div>
                   </CardContent>
                </Card>
             </div>

             {/* Section 2: Metadata */}
             <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-5 bg-zinc-900 rounded-full" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Administrative Metadata</h3>
                </div>

                <Card className="border shadow-sm pointer-events-auto bg-card">
                   <CardContent className="p-8">
                      <div className="space-y-1.5">
                         <label className="text-sm font-medium leading-none text-muted-foreground ml-0.5 opacity-60">Entry Classification / Notes</label>
                         <textarea 
                           {...register("notes")} 
                           className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm outline-none"
                           placeholder="Internal functional description of this settlement node..." 
                         />
                         {errors.notes?.message && <p className="text-[10px] font-black text-destructive uppercase tracking-widest mt-1.5 ml-1">{errors.notes.message}</p>}
                      </div>
                   </CardContent>
                   <div className="p-8 bg-muted/10 border-t flex flex-col sm:flex-row gap-4">
                      <Button type="button" variant="outline" className="flex-1 h-12 uppercase font-black tracking-widest text-[11px]" onClick={() => setShowForm(false)}>DISCARD DRAFT</Button>
                      <Button type="submit" isLoading={isSubmitting} className="flex-1 h-12 uppercase font-black tracking-widest text-[11px]">COMMIT SETTLEMENT</Button>
                   </div>
                </Card>
             </div>

             <div className="flex items-center justify-center gap-2 opacity-30 pt-4">
                <ShieldCheck size={14} className="text-primary" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em]">REGISTRY_NODE: SHADCN-V2.4</span>
             </div>
          </form>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Input 
                 placeholder="Search registry indices (Entity, Notes, Value)..." 
                 value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)} 
                 leftIcon={<Search className="w-4 h-4" />}
                 className="h-11 shadow-sm border-muted-foreground/10"
               />
               <Button variant="outline" className="h-11 px-8 rounded-md uppercase font-black tracking-widest text-[10px] w-full sm:w-auto" onClick={() => navigate("/parties/new")}>
                 <UserPlus className="w-4 h-4 mr-2" /> REGISTER ENTITY
               </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Transactional Feed</p>
                    <Badge variant="secondary" className="text-[9px] h-5">{filteredEntries.length} Records Indexed</Badge>
                 </div>
                 <History className="w-4 h-4 text-muted-foreground/40" />
              </div>

              {loading ? (
                <div className="grid gap-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-md border" />
                  ))}
                </div>
              ) : filteredEntries.length === 0 ? (
                <EmptyState 
                  title="Registry Static" 
                  description="No settlement nodes have been documented in the ledger archive yet." 
                  icon={<Scale className="h-12 w-12 text-muted-foreground/20" />} 
                />
              ) : (
                <div className="grid gap-3 animate-in fade-in duration-700 pb-20">
                  {filteredEntries.map(entry => (
                    <Card key={entry.id} className="group pointer-events-auto hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md bg-card overflow-hidden">
                      <CardContent className="p-0 pointer-events-auto">
                        <div className="flex items-stretch justify-between h-20">
                          <div className="flex items-center gap-4 px-4 min-w-0 flex-1">
                            <div className={cn(
                              "h-11 w-11 rounded-lg border flex items-center justify-center transition-all shadow-sm group-hover:scale-105",
                              entry.entry_type === "debit" 
                                ? "bg-rose-50 text-rose-500 border-rose-100" 
                                : "bg-emerald-50 text-emerald-500 border-emerald-100"
                            )}>
                              {entry.entry_type === "debit" ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                            </div>
                            <div className="flex flex-col min-w-0">
                               <div className="flex items-center gap-2">
                                  <h4 className="font-black text-foreground uppercase tracking-widest text-sm truncate">{entry.party_name}</h4>
                                  <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:translate-x-1 transition-transform" />
                               </div>
                               <div className="flex items-center gap-2 mt-1 opacity-60">
                                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none truncate max-w-[240px]">
                                    {entry.notes || "STANDARD_SETTLEMENT_LOG"}
                                  </span>
                               </div>
                            </div>
                          </div>
                          <div className="flex flex-col justify-center items-end px-6 bg-muted/5 group-hover:bg-muted/10 transition-colors border-l text-right shrink-0">
                            <p className={cn(
                              "text-xl font-black tracking-tighter leading-none mb-1.5",
                              entry.entry_type === "debit" ? "text-rose-600" : "text-emerald-600"
                            )}>
                              {entry.entry_type === "debit" ? "-" : "+"}{formatAmount(entry.amount)}
                            </p>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{formatDate(entry.entry_date)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
