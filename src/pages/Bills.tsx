import { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  MoreVertical,
  Receipt,
  Clock,
  Calendar,
  Layers,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBills, useDeleteBill } from "../hooks/useBills";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function Bills() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: bills, isLoading, isError, refetch } = useBills();
  const deleteMutation = useDeleteBill();

  const filteredBills = useMemo(() => {
    if (!bills) return [];
    return bills.filter((bill: any) => 
      bill.bill_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.party_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bills, searchQuery]);

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "success";
      case "unpaid": return "destructive";
      case "partially_paid": return "warning";
      default: return "secondary";
    }
  };

  if (isError) {
     return (
        <div className="flex-1 flex flex-col min-h-screen">
          <PageHeader title="Invoicing" showBack={true} />
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
             <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                <Clock className="w-8 h-8" />
             </div>
             <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-widest leading-none">Authentication Interrupted</h2>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-2 leading-none">Unable to establish secure connection to registry nodes.</p>
             </div>
             <Button onClick={() => refetch()} variant="outline" className="px-8 font-black uppercase tracking-widest text-[10px] h-10">RE-INITIATE CONNECTION</Button>
          </div>
        </div>
     );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32">
       <PageHeader 
        title="Settlement Registry"
        subtitle="Invoices & Monetary Settlements"
        rightAction={
          <Button size="sm" className="rounded-md uppercase tracking-widest text-[10px] font-black h-9 shadow-lg shadow-primary/10" onClick={() => navigate("/bills/new")}>
            <Plus className="w-3.5 h-3.5 mr-2" /> GENERATE SETTLEMENT
          </Button>
        }
      />

       <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-10">
          
          {/* Summary Stats Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             <Card className="border shadow-sm pointer-events-auto bg-card">
                <CardContent className="p-5 flex items-center gap-4">
                   <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-md flex items-center justify-center border border-emerald-100 shadow-sm"><TrendingUp className="h-5 w-5" /></div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Total Volume Logged</span>
                      <span className="text-xl font-black text-foreground tracking-tighter">₹4.24M</span>
                   </div>
                </CardContent>
             </Card>
             <Card className="border shadow-sm pointer-events-auto bg-card hidden lg:block">
                <CardContent className="p-5 flex items-center gap-4">
                   <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-md flex items-center justify-center border border-rose-100 shadow-sm"><Receipt className="h-5 w-5" /></div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Settlement Counter</span>
                      <span className="text-xl font-black text-foreground tracking-tighter">{bills?.length || 0} Records</span>
                   </div>
                </CardContent>
             </Card>
             <Card className="border shadow-sm pointer-events-auto bg-card">
                <CardContent className="p-5 flex items-center gap-4">
                   <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center border border-blue-100 shadow-sm"><Download className="h-5 w-5" /></div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Data Portability</span>
                      <Button variant="ghost" className="h-6 p-0 text-[10px] font-black uppercase tracking-widest text-primary leading-none mt-1 hover:bg-transparent">EXPORT FULL ARCHIVE</Button>
                   </div>
                </CardContent>
             </Card>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Input 
                 placeholder="Search settlement records / invoices..." 
                 value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)} 
                 leftIcon={<Search className="w-4 h-4" />}
                 className="h-11 shadow-sm border-muted-foreground/10"
               />
               <Button variant="outline" className="h-11 px-8 rounded-md uppercase font-black tracking-widest text-[10px] w-full sm:w-auto">
                 <Filter className="w-4 h-4 mr-2" /> RE-CALIBRATE FEED
               </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Registry List</p>
                    <Badge variant="secondary" className="text-[9px] h-5">{filteredBills.length} Active Modules</Badge>
                 </div>
                 <Layers className="w-4 h-4 text-muted-foreground/40" />
              </div>

              {isLoading ? (
                <div className="grid gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-md border" />
                  ))}
                </div>
              ) : filteredBills.length === 0 ? (
                <EmptyState title="Registry Empty" description="No invoices have been documented in the system yet." icon={<Receipt className="h-12 w-12 text-muted-foreground/20" />} actionLabel="INITIALIZE SETTLEMENT" onAction={() => navigate("/bills/new")} />
              ) : (
                <div className="grid gap-3 animate-in fade-in duration-700">
                  {filteredBills.map((bill: any) => (
                    <Card key={bill.id} className="group pointer-events-auto hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden bg-card">
                      <CardContent className="p-0 pointer-events-auto">
                        <div className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => navigate(`/bills/${bill.id}`)}>
                           <div className="flex items-center gap-5 min-w-0">
                              <div className="h-12 w-12 rounded-md bg-muted border flex flex-col items-center justify-center text-muted-foreground group-hover:bg-background transition-colors shadow-sm">
                                 <span className="text-[8px] font-black uppercase leading-none opacity-40">DOC</span>
                                 <span className="text-xs font-black text-foreground">#{bill.id}</span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                 <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-foreground truncate">{bill.party_name}</h4>
                                    <Badge variant={getStatusColor(bill.payment_status)} className="text-[8px] h-4 py-0 font-black uppercase">{bill.payment_status || "Logged"}</Badge>
                                 </div>
                                 <div className="flex items-center gap-4 mt-1.5 opacity-60">
                                    <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest flex items-center gap-1 leading-none"><Calendar className="w-3 h-3" /> {new Date(bill.bill_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest leading-none">INV: {bill.bill_number || "AUTO-002"}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-10 shrink-0">
                              <div className="text-right hidden md:block">
                                 <p className="text-base font-black text-foreground tracking-tight leading-none mb-1">{formatAmount(bill.total_amount)}</p>
                                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Fiscal Volume</p>
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className="flex items-center gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-muted" onClick={(e) => { e.stopPropagation(); navigate(`/bills/${bill.id}`); }}>
                                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(bill.id); }}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                 </div>
                                 <MoreVertical className="h-4 w-4 text-muted-foreground group-hover:opacity-0 transition-opacity" />
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
       </div>

       <DeleteConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title="Eliminate Records"
        message="This will permanently nullify the settlement logs. Archive restoration is currently disabled."
      />
    </div>
  );
}
