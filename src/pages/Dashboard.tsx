import { useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingBag, 
  Target, 
  Wallet,
  ArrowRight,
  Receipt,
  Package,
  Calendar,
  ChevronRight,
  BarChart3,
  Plus,
  ShieldCheck,
  Zap,
  Layers,
  Activity
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { cn } from "../lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useDashboard();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = useMemo(() => {
    if (!dashboardData) return [];
    return [
      {
        label: "Market Sales Volume",
        value: formatAmount(dashboardData.total_sales || 0),
        trend: "+12.5%",
        trendUp: true,
        icon: TrendingUp,
        description: "Gross revenue generated from registry transactions",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        label: "Inventory Value",
        value: formatAmount(dashboardData.total_purchases || 0),
        trend: "+5.2%",
        trendUp: true,
        icon: ShoppingBag,
        description: "Total valuation of listed assets",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        label: "Receivable Ledger",
        value: formatAmount(dashboardData.total_receivable || 0),
        trend: "-2.1%",
        trendUp: false,
        icon: Wallet,
        description: "Outstanding credits pending settlement",
        color: "text-rose-500",
        bg: "bg-rose-500/10",
      },
      {
        label: "Current Liability",
        value: formatAmount(dashboardData.total_payable || 0),
        trend: "+0.8%",
        trendUp: true,
        icon: TrendingDown,
        description: "Accounts payable to listed suppliers",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
      }
    ];
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <PageHeader title="Intelligence Center" subtitle="Synchronizing cloud registry..." />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Synthesizing performance data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden theme-transition uppercase cursor-default">
      <PageHeader 
        title="Business Intelligence"
        subtitle="Strategic Performance & Operational Analytics"
        rightAction={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="hidden sm:flex rounded-md uppercase tracking-widest text-[10px] font-black h-9 border-muted-foreground/20 hover:bg-muted/50" onClick={() => navigate("/reports")}>
              <BarChart3 className="w-3.5 h-3.5 mr-2" /> REPORTS
            </Button>
            <Button size="sm" className="rounded-md uppercase tracking-widest text-[10px] font-black h-9 shadow-lg shadow-primary/10" onClick={() => navigate("/bills/create")}>
              <Plus className="w-3.5 h-3.5 mr-2" /> NEW INVOICE
            </Button>
          </div>
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Metric Grid - High Impact */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
           {metrics.map((stat, idx) => (
             <Card key={idx} className="bg-card border shadow-sm transition-all duration-500 hover:shadow-xl hover:border-primary/20 group pointer-events-auto relative overflow-hidden">
                <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-1000", stat.bg)} />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">{stat.label}</p>
                   <div className={cn("p-2 rounded-lg transition-colors", stat.bg)}>
                      <stat.icon size={14} className={stat.color} />
                   </div>
                </CardHeader>
                <div className="px-6 pb-6 pt-2 relative z-10 flex flex-col gap-1">
                   <p className="text-3xl font-black tracking-tighter text-foreground group-hover:translate-x-1 transition-transform duration-500">{stat.value}</p>
                   <div className="flex items-center gap-2 pt-2 border-t border-muted-foreground/5 mt-2">
                      <span className={cn(
                        "flex items-center text-[9px] font-black uppercase tracking-widest gap-0.5 px-2 py-0.5 rounded-full",
                        stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                         {stat.trendUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                         {stat.trend}
                      </span>
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">M_PERIOD_ACT</span>
                   </div>
                </div>
             </Card>
           ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Detailed Ledger List - Professional Feed */}
           <section className="lg:col-span-2 space-y-4 animate-in slide-in-from-left-8 duration-700">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-primary rounded-full" />
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground">Recent Registry Entries</p>
                 </div>
                 <Link to="/bills" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all flex items-center gap-1.5 group">
                    VIEW_LIVE_FEED <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>

              <Card className="border shadow-sm pointer-events-auto bg-card overflow-hidden">
                <div className="divide-y divide-border">
                   {dashboardData?.recent_invoices && dashboardData.recent_invoices.length > 0 ? (
                      dashboardData.recent_invoices.slice(0, 6).map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 px-6 hover:bg-muted/20 transition-all group cursor-pointer" onClick={() => navigate(`/bills`)}>
                           <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="h-10 w-10 rounded-md bg-zinc-50 border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                                 <Receipt className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                 <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-foreground truncate uppercase tracking-tight">{invoice.party?.name || "Anonymous Entity"}</span>
                                    <Badge variant={invoice.payment_status === "paid" ? "success" : "warning"} className="text-[8px] h-4 px-1.5 font-black uppercase">{invoice.payment_status}</Badge>
                                 </div>
                                 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] leading-none mt-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                    DOC_ID: {invoice.invoice_number} • PATHWAY_COMMERCIAL
                                 </span>
                              </div>
                           </div>
                           <div className="text-right pl-4 shrink-0">
                              <p className="text-base font-black text-foreground tracking-tighter leading-none mb-1.5 group-hover:text-primary transition-colors">₹{invoice.total_amount.toLocaleString("en-IN")}</p>
                              <div className="flex items-center justify-end gap-1 opacity-40">
                                 <Calendar size={10} />
                                 <p className="text-[9px] font-black uppercase tracking-widest">{new Date(invoice.invoice_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</p>
                              </div>
                           </div>
                        </div>
                      ))
                   ) : (
                      <div className="p-20 text-center">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-20 italic underline decoration-primary/20 underline-offset-4">ZERO_RECORDS_INDEXED</p>
                      </div>
                   )}
                </div>
              </Card>
           </section>

           {/* Quick Strategic Actions - Clinical Interface */}
           <section className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-5 bg-zinc-400 rounded-full" />
                 <p className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground">Operational Hub</p>
              </div>

              <div className="grid gap-2.5">
                 {[
                   { icon: Receipt, label: "PUBLISH INVOICE", desc: "Fiscal settlement", href: "/bills/create", color: "text-blue-500" },
                   { icon: Users, label: "ENTITY REGISTRY", desc: "Commercial network", href: "/parties/new", color: "text-emerald-500" },
                   { icon: Package, label: "CATALOGUE AUDIT", desc: "Asset optimization", href: "/products/new", color: "text-purple-500" },
                   { icon: Wallet, label: "INTERNAL LEDGER", desc: "Liquidity logs", href: "/khata-book/entry", color: "text-rose-500" },
                 ].map((action, idx) => (
                    <Card 
                      key={idx} 
                      className="bg-card border shadow-sm hover:border-primary/20 hover:shadow-md hover:translate-y-[-1px] transition-all duration-300 cursor-pointer group pointer-events-auto relative overflow-hidden"
                      onClick={() => navigate(action.href)}
                    >
                       <CardContent className="p-4 flex items-center gap-4 relative z-10">
                          <div className={cn("h-10 w-10 rounded-lg bg-muted flex items-center justify-center transition-all", action.color.replace('text', 'bg').replace('500', '50'))}>
                             <action.icon size={16} className={action.color} />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground leading-none">{action.label}</span>
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1.5 opacity-40">{action.desc}</span>
                          </div>
                          <ChevronRight className="ml-auto w-3 h-3 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                       </CardContent>
                    </Card>
                 ))}
              </div>

              {/* Advanced Insight Card - Premium UI */}
              <Card className="bg-zinc-950 text-white border-zinc-800 shadow-2xl mt-8 pointer-events-auto overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Activity size={140} className="text-emerald-500" />
                 </div>
                 <CardContent className="p-8 relative z-10 space-y-6">
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500">SYSTEM_OPTIMIZATION_NODE</span>
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-lg font-black uppercase tracking-tight leading-none text-white">Efficiency Analysis</h4>
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-relaxed">
                          Procurement latency has decreased by <span className="text-emerald-400">4.2%</span>. 
                          Network integrity is currently <span className="text-emerald-400">OPTIMAL</span>.
                       </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full bg-white text-zinc-950 border-none rounded-md font-black uppercase tracking-widest text-[9px] h-10 hover:bg-zinc-200 transition-colors">
                       GENERATE FULL AUDIT
                    </Button>
                 </CardContent>
              </Card>
           </section>
        </div>

        {/* System Integrity Footer */}
        <section className="pt-12 border-t flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                 <ShieldCheck size={16} className="text-emerald-500" />
                 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">SECURE_PROTOCOL_V2.4</span>
              </div>
              <div className="flex items-center gap-2">
                 <Zap size={16} className="text-blue-500" />
                 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">LIVE_CLOUD_SYNC</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                 <Layers size={16} className="text-orange-500" />
                 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">DISTRIBUTED_REGISTRY</span>
              </div>
           </div>
           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-30">© 2024 INVOCRAFT_ENTERPRISE_STUDIO</p>
        </section>
      </div>
    </div>
  );
}
