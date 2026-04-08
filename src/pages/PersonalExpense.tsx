import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Wallet, 
  Calendar, 
  FileText, 
  History,
  TrendingDown,
  ChevronRight,
  Filter,
  Activity,
  ShieldCheck,
  Zap,
  Layers,
  PieChart
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseFormValues } from "../lib/validationSchema";
import { useExpenses, useCreateExpense, useDeleteExpense } from "../hooks/useExpenses";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { cn } from "../lib/utils";

export default function PersonalExpense() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: expenses, isLoading } = useExpenses();
  const createMutation = useCreateExpense();
  const deleteMutation = useDeleteExpense();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      title: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category: "",
      paymentMethod: "cash",
      description: "",
    }
  });

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter((e: any) => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [expenses, searchQuery]);

  const totalExpense = useMemo(() => {
    if (!expenses) return 0;
    return expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  }, [expenses]);

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      reset();
      setShowForm(false);
    } catch (e) {
      console.error("Archive commit failure:", e);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden theme-transition uppercase cursor-default">
      <PageHeader 
        title={showForm ? "Initialize Outflow Hub" : "Liquidity Archive: Personal"} 
        subtitle={showForm ? "Configure Personal Internal Outflow Node" : "Strategic Personal Liquidity & Internal Expense Ledger"}
        showBack={showForm} 
        onBackClick={() => setShowForm(false)}
        rightAction={
          !showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="rounded-md uppercase tracking-widest text-[10px] font-black h-9 shadow-lg shadow-primary/10">
              <Plus className="w-3.5 h-3.5 mr-2" /> RECORD OUTFLOW
            </Button>
          )
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {!showForm && (
           <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-rose-200 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-rose-500">
                    <TrendingDown size={100} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 opacity-60">Consolidated Outflow</span>
                 <div className="flex items-end justify-between relative z-10">
                    <span className="text-3xl font-black text-rose-700 tracking-tighter">{formatAmount(totalExpense)}</span>
                    <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-rose-50 text-rose-600 border-rose-100 italic">VAL_OUTFLOW</Badge>
                 </div>
              </Card>
              <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-blue-200 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-blue-500">
                    <History size={100} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-60">Registry Density</span>
                 <div className="flex items-end justify-between relative z-10">
                    <span className="text-2xl font-black text-blue-700 tracking-tighter uppercase">{expenses?.length || 0} NODES</span>
                    <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-blue-50 text-blue-600 border-blue-100 italic">LOG_STABLE</Badge>
                 </div>
              </Card>
              <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-emerald-200 transition-all group overflow-hidden relative hidden lg:flex">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-emerald-500">
                    <PieChart size={100} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60">Efficiency Node</span>
                 <div className="flex items-end justify-between relative z-10">
                    <span className="text-2xl font-black text-emerald-700 tracking-tighter uppercase italic opacity-60">OPTIMAL_FLOW</span>
                 </div>
              </Card>
           </section>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-20">
             <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-5 bg-rose-500 rounded-full transition-all group-hover:h-6" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Liquidity Documentation</h3>
                </div>
                
                <Card className="border shadow-sm pointer-events-auto bg-card">
                   <CardContent className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <Input label="Registry Descriptor" placeholder="e.g. Office Logistics, Utilities" {...register("title")} error={errors.title?.message} leftIcon={<FileText className="w-4 h-4" />} />
                         <Input label="Fiscal Valuation" type="number" placeholder="0.00" {...register("amount")} error={errors.amount?.message} leftIcon={<span className="text-[11px] font-black opacity-30">₹</span>} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                         <Input label="Registry Initialization Date" type="date" {...register("date")} error={errors.date?.message} leftIcon={<Calendar className="w-4 h-4" />} />
                         <Input label="Asset Classification Node" placeholder="e.g. OPERATING, PERSONAL" {...register("category")} error={errors.category?.message} leftIcon={<History className="w-4 h-4" />} />
                      </div>

                      <div className="space-y-2 border-t pt-8">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-60">Settlement Protocol Pathway</label>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {["cash", "upi", "card", "bank_transfer"].map((method) => (
                               <button
                                  key={method}
                                  type="button"
                                  onClick={() => reset({ ...register, paymentMethod: method as any } as any)}
                                  className="h-11 rounded-lg border border-input text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all flex items-center justify-center shadow-sm"
                               >
                                  {method.replace('_', ' ')}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-1.5 border-t pt-8">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-60">Supplementary Registry Metadata</label>
                         <textarea 
                            {...register("description")}
                            placeholder="Detailed archival specifications..."
                            className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm outline-none"
                         />
                      </div>
                   </CardContent>
                   <div className="p-8 bg-muted/10 border-t flex flex-col sm:flex-row gap-4">
                      <Button type="button" variant="outline" className="flex-1 h-12 uppercase font-black tracking-widest text-[11px]" onClick={() => setShowForm(false)}>DISCARD DRAFT</Button>
                      <Button type="submit" isLoading={isSubmitting} className="flex-1 h-12 uppercase font-black tracking-widest text-[11px] shadow-2xl shadow-primary/20">COMMIT OUTFLOW RECORD</Button>
                   </div>
                </Card>
             </div>
             
             <div className="flex items-center justify-center gap-2 opacity-30 pt-4">
                <ShieldCheck size={14} className="text-primary" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">LEDGER_PROTOCOL_ENCRYPTED: V2.4</span>
             </div>
          </form>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Input 
                 placeholder="Search liquidity archive (Descriptor, Node)..." 
                 value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)} 
                 leftIcon={<Search className="w-4 h-4" />}
                 className="h-11 shadow-sm border-muted-foreground/10"
               />
               <Button variant="outline" className="h-11 px-8 rounded-md uppercase font-black tracking-widest text-[10px] w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 mr-2" /> RE-CALIBRATE FEED
               </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Liquidity Feed Archive</p>
                    <Badge variant="secondary" className="text-[9px] h-5">{filteredExpenses.length} NODES_ACTIVE</Badge>
                 </div>
                 <Activity size={14} className="text-muted-foreground/40" />
              </div>

              {isLoading ? (
                <div className="grid gap-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-md border" />
                  ))}
                </div>
              ) : filteredExpenses.length === 0 ? (
                <EmptyState 
                   title="Archive Offline" 
                   description="Your personal liquidity ledger has not been initialized with any outflow nodes." 
                   icon={<Wallet className="h-12 w-12 text-muted-foreground/20" />} 
                   actionLabel="INITIATE RECORD" 
                   onAction={() => setShowForm(true)} 
                />
              ) : (
                <div className="grid gap-3 animate-in fade-in duration-700">
                  {filteredExpenses.map((expense: any) => (
                    <Card key={expense.id} className="group pointer-events-auto hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md bg-card overflow-hidden">
                      <CardContent className="p-0 flex items-stretch justify-between h-20">
                        <div className="flex items-center gap-4 px-4 flex-1 min-w-0">
                          <div className="h-11 w-11 rounded-lg bg-muted border flex items-center justify-center text-muted-foreground group-hover:bg-rose-50 group-hover:text-rose-600 transition-all shadow-sm group-hover:scale-105">
                            <Plus className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                               <h4 className="font-black text-foreground uppercase tracking-widest text-sm truncate">{expense.title}</h4>
                               <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <div className="flex items-center gap-2 mt-1 opacity-60">
                               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] leading-none truncate whitespace-nowrap">
                                 {expense.category || "UNCLASSIFIED_NODE"}
                               </span>
                               <span className="w-1 h-1 rounded-full bg-border" />
                               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] leading-none uppercase">
                                 {expense.payment_method}
                               </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center items-end px-6 bg-muted/5 group-hover:bg-muted/10 transition-colors border-l text-right shrink-0">
                           <p className="text-xl font-black text-foreground tracking-tighter leading-none mb-1.5 group-hover:text-rose-600 transition-colors">
                             {formatAmount(expense.amount)}
                           </p>
                           <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                               {new Date(expense.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                             </span>
                             <div className="flex items-center gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white shadow-sm border border-transparent hover:border-border">
                                  <Edit2 className="h-3 w-3 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-rose-50 hover:text-rose-600 shadow-sm border border-transparent hover:border-rose-100" onClick={() => setDeleteId(expense.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                             </div>
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

      <DeleteConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title="Nullify Archive Entry"
        message="This will permanently delete the liquidity outflow record from your archive cluster. Operation is irreversible."
      />
    </div>
  );
}
