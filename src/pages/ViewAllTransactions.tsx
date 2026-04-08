import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  LayoutGrid,
  Search,
  Download,
  History,
  TrendingUp,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import DownloadButton from "../components/ui/DownloadButton";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import { cn } from "../lib/utils";

type Transaction = {
  id: number;
  type: "debit" | "credit" | "given" | "received";
  amount: number;
  transaction_date: string;
  note: string | null;
  payment_method?: string;
  reference_number?: string | null;
  transaction_type?: "business" | "personal";
  party?: { name: string };
  personal_contact?: { name: string };
};

export default function ViewAllTransactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchTransactions = useCallback(async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: Record<string, any> = {
        page,
        per_page: 20,
      };

      const res = await api.get("/transactions", { params });
      const data: Transaction[] = res.data?.data || [];

      if (reset) {
        setTransactions(data);
      } else {
        setTransactions((prev) => [...prev, ...data]);
      }

      setHasMore(res.data?.pagination?.has_more ?? false);
      setCurrentPage(page);
    } catch (err) {
      console.error("Registry synchronization failure:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(1, true);
  }, [fetchTransactions]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchTransactions(currentPage + 1);
    }
  }, [loadingMore, hasMore, loading, currentPage, fetchTransactions]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0] && entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMore();
      }
    }, { threshold: 0.1 });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore, hasMore, loadingMore]);

  const filtered = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((tx) =>
      tx.party?.name?.toLowerCase().includes(q) ||
      tx.personal_contact?.name?.toLowerCase().includes(q) ||
      tx.note?.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  const formatAmount = (amt: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const exportData = useMemo(() => {
    return filtered.map((tx) => ({
      Date: tx.transaction_date,
      Name: tx.party?.name || tx.personal_contact?.name || "Anonymous Node",
      Type: tx.type.toUpperCase(),
      Amount: tx.amount,
      Method: tx.payment_method || "PROTOCOL_UNDEFINED",
      Note: tx.note || "",
      Context: tx.transaction_type || "business"
    }));
  }, [filtered]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden theme-transition">
      <PageHeader
        title="Fiscal Archives"
        subtitle="Global Transactional Registry & Audit Trail"
        showBack={true}
        onBackClick={() => navigate(-1)}
        rightAction={
          <DownloadButton 
            data={exportData} 
            filename={`registry_audit_${new Date().toISOString().split('T')[0]}`} 
            label=""
            className="rounded-md h-9 w-9 p-0 bg-background border hover:bg-muted"
            icon={<Download className="h-4 w-4" />}
          />
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {/* Analytical Meta Header */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
           <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-primary/20 transition-all group overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                 <History size={100} className="text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">Archived Records</span>
              <div className="flex items-end justify-between relative z-10">
                 <span className="text-3xl font-black text-foreground tracking-tighter">{transactions.length}</span>
                 <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100 italic">LOGS_SYNCHRONIZED</Badge>
              </div>
           </Card>
           <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-emerald-200 transition-all group overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                 <TrendingUp size={100} className="text-emerald-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60">Revenue Performance</span>
              <div className="flex items-end relative z-10">
                 <span className="text-2xl font-black text-emerald-700 tracking-tighter">DATA_SYNC...</span>
              </div>
           </Card>
        </section>

        <div className="space-y-6">
           <div className="flex flex-col sm:flex-row items-center gap-4 sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <Input 
                 placeholder="Search registry indices (Name, Note, Metadata)..." 
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
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Audit Log Feed</p>
                    <Badge variant="secondary" className="text-[9px] h-5">{filtered.length} NODES_INDEXED</Badge>
                 </div>
                 <History className="w-4 h-4 text-muted-foreground/40" />
              </div>

              {loading && transactions.length === 0 ? (
                 <div className="flex items-center justify-center min-h-[40vh]">
                    <LoadingSpinner text="Synchronizing Archives..." size="lg" />
                 </div>
              ) : filtered.length === 0 ? (
                 <EmptyState 
                   title="Registry Static"
                   description={searchQuery ? "No archival nodes matching the current identity query." : "Transactional archives will be synchronized once settlements occur."}
                   icon={<LayoutGrid className="w-12 h-12 text-muted-foreground/20" />}
                 />
              ) : (
                 <div className="grid gap-3 animate-in fade-in duration-700">
                    {filtered.map((tx) => {
                       const isCredit = tx.type === "credit" || tx.type === "received";
                       const displayName = tx.party?.name || tx.personal_contact?.name || "ANONYMOUS_ENTITY";
                       
                       return (
                          <Card 
                            key={tx.id} 
                            className="group pointer-events-auto hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md bg-card overflow-hidden"
                            onClick={() => navigate(tx.transaction_type === "personal" ? `/personal-ledger/${tx.personal_contact?.id}` : `/ledger/${tx.party?.name}`)}
                          >
                             <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                                   <div className={cn(
                                      "h-10 w-10 rounded-md border flex items-center justify-center transition-all shadow-sm",
                                      isCredit ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"
                                   )}>
                                      {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                   </div>
                                   <div className="flex flex-col min-w-0">
                                      <div className="flex items-center gap-2">
                                         <h3 className="font-black text-foreground uppercase truncate text-[11px] tracking-widest leading-none">
                                            {displayName}
                                         </h3>
                                         <span className="w-1 h-1 rounded-full bg-border" />
                                         <Badge variant={tx.transaction_type === "personal" ? "secondary" : "outline"} className="px-1.5 py-0 text-[7px] font-black uppercase tracking-[0.2em] h-4">
                                            {tx.transaction_type || "Business"}
                                         </Badge>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                         <Calendar className="w-3 h-3 text-muted-foreground/50" />
                                         <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{formatDate(tx.transaction_date)}</span>
                                      </div>
                                      {tx.note && (
                                         <p className="text-[10px] font-bold text-muted-foreground italic truncate mt-2 border-l-2 border-primary/20 pl-2 leading-none">
                                            {tx.note}
                                         </p>
                                      )}
                                   </div>
                                </div>

                                <div className="text-right shrink-0">
                                   <p className={cn("text-lg font-black tracking-tighter leading-none mb-1", isCredit ? "text-emerald-600" : "text-rose-600")}>
                                      {isCredit ? "+" : "-"}{formatAmount(tx.amount)}
                                   </p>
                                   <div className="flex items-center justify-end gap-1.5 opacity-40">
                                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">{tx.payment_method || "CASH_SETTLEMENT"}</span>
                                   </div>
                                </div>
                             </CardContent>
                          </Card>
                       );
                    })}

                    <div ref={observerTarget} className="h-20 flex items-center justify-center p-8">
                       {loadingMore ? (
                          <LoadingSpinner text="FETCHING_NEXT_BLOCK..." size="sm" />
                       ) : !hasMore && transactions.length > 0 ? (
                          <div className="flex items-center gap-4">
                             <div className="h-[1px] w-12 bg-border" />
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 italic underline-offset-4 underline decoration-primary/20">END_OF_ARCHIVE_DATA</p>
                             <div className="h-[1px] w-12 bg-border" />
                          </div>
                       ) : null}
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
