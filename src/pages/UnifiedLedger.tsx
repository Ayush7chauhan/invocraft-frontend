import { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Wallet, 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  Trash2, 
  Edit2, 
  ReceiptText,
  Smartphone,
  CreditCard,
  Banknote,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  History,
  Info,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Download
} from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ledgerTransactionSchema, type LedgerTransactionFormValues } from "../lib/validationSchema";
import api from "../utils/api";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import DownloadButton from "../components/ui/DownloadButton";
import { cn } from "../lib/utils";

type TransactionType = "debit" | "credit" | "given" | "received";
type PaymentMethod = "cash" | "upi" | "card" | "bank_transfer" | "other";
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
};

const PAYMENT_METHODS = [
  { value: "cash", label: "CASH", icon: Banknote },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "card", label: "CARD", icon: CreditCard },
  { value: "bank_transfer", label: "BANK", icon: ReceiptText },
  { value: "other", label: "PROTOCOL_X", icon: LayoutGrid },
];

export default function UnifiedLedger() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as { contactName?: string; contactType?: ContactType } | null;
  const contactId = Number(id);
  const contactName = state?.contactName || "Global Registry";
  const contactType = state?.contactType || "business";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    youOwe: 0,
    theyOwe: 0,
    opening_balance: 0,
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LedgerTransactionFormValues>({
    resolver: zodResolver(ledgerTransactionSchema) as any,
    defaultValues: {
      type: contactType === "personal" ? "given" : "credit",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      referenceNumber: "",
      note: "",
    },
  });

  const watchType = watch("type");
  const watchPaymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (contactId) {
      loadData();
    }
  }, [contactId, contactType]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchTransactions(), fetchContactDetails()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    const endpoint = contactType === "personal" ? "/personal-transactions" : "/transactions";
    const paramName = contactType === "personal" ? "contact_id" : "party_id";
    try {
      const response = await api.get(endpoint, { params: { [paramName]: contactId } });
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error("Registry fetch failure:", error);
    }
  };

  const fetchContactDetails = async () => {
    const endpoint = contactType === "personal" ? `/personal-contacts/${contactId}` : `/parties/${contactId}`;
    try {
      const response = await api.get(endpoint);
      if (response.data.success) {
        const data = response.data.data;
        setBalanceData({
          balance: Number(data.balance) || 0,
          youOwe: Number(data.you_owe) || 0,
          theyOwe: Number(data.they_owe) || 0,
          opening_balance: Number(data.opening_balance) || 0,
        });
      }
    } catch (error) {
      console.error("Entity fetch failure:", error);
    }
  };

  const onSubmit = async (data: LedgerTransactionFormValues) => {
    const endpoint = contactType === "personal" ? "/personal-transactions" : "/transactions";
    const idKey = contactType === "personal" ? "personal_contact_id" : "party_id";
    try {
      const payload = {
        [idKey]: contactId,
        type: data.type,
        amount: Number(data.amount),
        transaction_date: data.date,
        note: data.note?.trim() || null,
        payment_method: data.paymentMethod,
        reference_number: data.referenceNumber?.trim() || null,
      };

      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error("Registry commit failure:", error);
    }
  };

  const resetForm = () => {
    reset({
      type: contactType === "personal" ? "given" : "credit",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      referenceNumber: "",
      note: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (tx: Transaction) => {
    reset({
      type: tx.type,
      amount: tx.amount,
      date: tx.transaction_date,
      paymentMethod: tx.payment_method || "cash",
      referenceNumber: tx.reference_number || "",
      note: tx.note || "",
    });
    setEditingId(tx.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const endpoint = contactType === "personal" ? "/personal-transactions" : "/transactions";
    try {
      await api.delete(`${endpoint}/${deleteId}`);
      setDeleteId(null);
      loadData();
    } catch (error) {
      console.error("Registry purge failure:", error);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => 
      (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(tx.amount).includes(searchQuery)
    );
  }, [transactions, searchQuery]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const exportData = useMemo(() => {
    return filteredTransactions.map(tx => ({
      Date: tx.transaction_date,
      Type: tx.type,
      Amount: tx.amount,
      Note: tx.note || ""
    }));
  }, [filteredTransactions]);

  const currentBalance = balanceData.balance;
  const isSettled = currentBalance === 0;
  const isPositive = currentBalance > 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden theme-transition uppercase cursor-default">
      <PageHeader
        title={contactName}
        subtitle={contactType === "personal" ? "Personal Liquidity Registry" : "Strategic Commercial Ledger"}
        showBack={true}
        onBackClick={showForm ? resetForm : () => navigate(-1)}
        rightAction={
          !showForm && (
            <div className="flex gap-2">
              <DownloadButton 
                data={exportData} 
                filename={`${contactName}_registry`} 
                label="" 
                className="rounded-md h-9 w-9 p-0 bg-background border hover:bg-muted"
                icon={<Download className="h-4 w-4" />}
              />
              <Button size="sm" onClick={() => setShowForm(true)} className="rounded-md h-9 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
                <Plus className="w-3.5 h-3.5 mr-2" /> RECORD ENTRY
              </Button>
            </div>
          )
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-12">
        {!showForm && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
             <div className="flex items-center gap-2 px-1">
                <div className="w-1.5 h-5 bg-zinc-400 rounded-full" />
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Fiscal Recapitulation</h3>
             </div>
             <Card className={cn(
                "border shadow-2xl relative overflow-hidden group pointer-events-auto h-48 flex items-center justify-center p-8",
                 isSettled ? "bg-card" : isPositive ? "bg-emerald-950 border-emerald-900" : "bg-rose-950 border-rose-900"
             )}>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                   <TrendingUp size={160} className={cn(isPositive ? "text-emerald-500" : "text-rose-500")} />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                   <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em] font-black",
                      isSettled ? "text-muted-foreground" : isPositive ? "text-emerald-400" : "text-rose-400"
                   )}>
                      {isSettled ? "REGISTRY_SETTLED" : isPositive ? "ENTITY_DEBT_RECEIVABLE" : "PRINCIPAL_DEBT_PAYABLE"}
                   </span>
                   <h2 className={cn(
                      "text-5xl font-black tracking-tighter",
                      isSettled ? "text-muted-foreground" : isPositive ? "text-emerald-500" : "text-rose-500"
                   )}>
                      {formatAmount(currentBalance)}
                   </h2>
                   {balanceData.opening_balance !== 0 && (
                      <Badge variant="outline" className="bg-white/5 text-white/40 border-white/10 uppercase tracking-widest text-[9px] h-5 px-3">
                         OPENING_NODE: {formatAmount(balanceData.opening_balance)}
                      </Badge>
                   )}
                </div>
             </Card>
          </section>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
             <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-5 bg-primary rounded-full" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Registry Entry Details</h3>
                </div>
                
                <Card className="border shadow-sm pointer-events-auto bg-card">
                   <CardContent className="p-8 space-y-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Settlement Direction</label>
                         <div className="grid grid-cols-2 gap-4">
                           {(contactType === "personal" ? ["given", "received"] : ["debit", "credit"]).map((t) => {
                              const isSelected = watchType === t;
                              const isIn = t === "received" || t === "credit";
                              const Icon = isIn ? ArrowDownLeft : ArrowUpRight;
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setValue("type", t as any)}
                                  className={cn(
                                    "h-14 rounded-md border flex items-center justify-center gap-2 transition-all duration-300 uppercase tracking-widest text-[10px] font-black",
                                    isSelected 
                                      ? isIn 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" 
                                        : "bg-rose-50 text-rose-700 border-rose-200 shadow-sm"
                                      : "bg-muted/30 border-input text-muted-foreground hover:bg-muted/50"
                                  )}
                                >
                                  <Icon className="h-4 w-4" /> {t === "given" ? "YOU GAVE" : t === "received" ? "YOU GOT" : t.toUpperCase()}
                                </button>
                              );
                           })}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <Input label="Registry Valuation" type="number" placeholder="Enter Amount" {...register("amount")} error={errors.amount?.message} leftIcon={<Wallet className="w-4 h-4 text-muted-foreground" />} />
                         <Input label="Registry Date" type="date" {...register("date")} error={errors.date?.message} leftIcon={<Calendar className="w-4 h-4 text-muted-foreground" />} />
                      </div>

                      {contactType === "personal" && (
                        <div className="space-y-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Settlement Pathway</label>
                              <div className="grid grid-cols-5 gap-3">
                                {PAYMENT_METHODS.map((method) => (
                                  <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setValue("paymentMethod", method.value as any)}
                                    className={cn(
                                      "h-12 rounded-md flex flex-col items-center justify-center border transition-all duration-300 gap-1",
                                      watchPaymentMethod === method.value 
                                        ? "bg-primary text-primary-foreground border-primary shadow-md" 
                                        : "bg-background text-muted-foreground border-input hover:bg-muted/50"
                                    )}
                                  >
                                    <method.icon className="h-4 w-4" />
                                    <span className="text-[7px] font-black tracking-widest">{method.label}</span>
                                  </button>
                                ))}
                              </div>
                           </div>
                           <Input label="Registry Reference (Optional)" placeholder="Txn ID, Reference Hub" {...register("referenceNumber")} leftIcon={<History size={16} className="text-muted-foreground" />} />
                        </div>
                      )}

                      <div className="space-y-1.5">
                         <label className="text-sm font-medium leading-none text-muted-foreground ml-0.5 opacity-60">Registry Notes</label>
                         <textarea 
                           {...register("note")} 
                           className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm outline-none"
                           placeholder="Enter registry metadata..." 
                         />
                      </div>
                   </CardContent>
                   <CardFooter className="bg-muted/10 px-8 py-5 border-t flex flex-col sm:flex-row gap-4">
                      <Button type="button" variant="outline" onClick={resetForm} className="flex-1 h-11 uppercase font-black tracking-widest text-[11px]">DISCARD DRAFT</Button>
                      <Button type="submit" isLoading={isSubmitting} className="flex-1 h-11 uppercase font-black tracking-widest text-[11px]">COMMIT REGISTRY</Button>
                   </CardFooter>
                </Card>
             </div>
          </form>
        ) : (
          <div className="space-y-12">
             <div className="flex flex-col sm:flex-row items-center gap-4">
                <Input 
                   placeholder="Search ledger entries..." 
                   value={searchQuery} 
                   onChange={(e) => setSearchQuery(e.target.value)} 
                   leftIcon={<Search className="w-4 h-4" />}
                   className="h-11 shadow-sm border-muted-foreground/10"
                />
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Transactional Feed</p>
                      <Badge variant="secondary" className="text-[9px] h-5">{filteredTransactions.length} Entries Logged</Badge>
                   </div>
                   <History className="w-4 h-4 text-muted-foreground" />
                </div>

                {loading ? (
                   <div className="grid gap-3">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-md border" />)}
                   </div>
                ) : filteredTransactions.length === 0 ? (
                  <EmptyState title="Registry Empty" description="No settlements have been recorded in this ledger node." icon={<ReceiptText className="w-12 h-12 text-muted-foreground/20" />} />
                ) : (
                  <div className="grid gap-3">
                     {filteredTransactions.map(tx => {
                        const isIn = tx.type === "received" || tx.type === "credit";
                        return (
                          <Card key={tx.id} className="group pointer-events-auto hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md bg-card overflow-hidden">
                             <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                   <div className={cn(
                                      "h-10 w-10 rounded-md border flex items-center justify-center transition-colors shadow-sm",
                                      isIn ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"
                                   )}>
                                      {isIn ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                   </div>
                                   <div className="flex flex-col min-w-0">
                                      <div className="flex items-center gap-2">
                                         <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            isIn ? "text-emerald-700" : "text-rose-700"
                                         )}>
                                            {isIn ? (contactType === "personal" ? "YOU GOT" : "FISCAL_CREDIT") : (contactType === "personal" ? "YOU GAVE" : "FISCAL_DEBIT")}
                                         </span>
                                         <span className="w-1 h-1 rounded-full bg-border" />
                                         <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{formatDate(tx.transaction_date)}</span>
                                      </div>
                                      <p className="text-[11px] font-bold text-foreground truncate mt-1">{tx.note || "Standard Registry Settlement"}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-8 shrink-0">
                                   <div className="text-right hidden sm:block">
                                      <p className={cn("text-lg font-black tracking-tighter leading-none mb-1", isIn ? "text-emerald-600" : "text-rose-600")}>
                                         {isIn ? "+" : "-"}{formatAmount(tx.amount)}
                                      </p>
                                      {tx.payment_method && <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{tx.payment_method}</span>}
                                   </div>
                                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" onClick={() => handleEdit(tx)} className="h-9 w-9 rounded-md hover:bg-muted">
                                         <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(tx.id)} className="h-9 w-9 rounded-md hover:bg-destructive/10 hover:text-destructive">
                                         <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                   </div>
                                </div>
                             </CardContent>
                          </Card>
                        );
                     })}
                  </div>
                )}
             </div>

             <Card className="border bg-muted/10 border-dashed pointer-events-auto">
                <CardContent className="p-8 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted/40 rounded-md flex items-center justify-center border text-muted-foreground"><Info className="h-5 w-5" /></div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Registry Integrity Node</span>
                         <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">LOG_CHANNEL: {contactType.toUpperCase()}</span>
                      </div>
                   </div>
                   <div className="hidden sm:flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">LIVE_SYNC: ACTIVE</span>
                   </div>
                </CardContent>
             </Card>
          </div>
        )}
      </div>

      <DeleteConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title="Nullify Registry Entry"
        message="This operation will permanently purge the fiscal record. Running balance will be re-calibrated upon settlement."
      />
    </div>
  );
}
