import { useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  BarChart3,
  Target,
  Layers,
  PieChart,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { cn } from "../lib/utils";

export default function Reports() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useDashboard();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const primaryStats = useMemo(() => {
    if (!dashboardData) return [];
    return [
      {
        label: "Market Sales Volume",
        value: formatAmount(dashboardData.total_sales || 0),
        trend: "+12.5%",
        trendUp: true,
        icon: TrendingUp,
        color: "text-emerald-500"
      },
      {
        label: "Procurement Inventory",
        value: formatAmount(dashboardData.total_purchases || 0),
        trend: "+5.2%",
        trendUp: true,
        icon: ShoppingBag,
        color: "text-blue-500"
      },
      {
        label: "Outstanding Receivable",
        value: formatAmount(dashboardData.total_receivable || 0),
        trend: "-2.1%",
        trendUp: false,
        icon: Wallet,
        color: "text-rose-500"
      },
      {
        label: "Current Liabilities",
        value: formatAmount(dashboardData.total_payable || 0),
        trend: "+0.8%",
        trendUp: true,
        icon: TrendingDown,
        color: "text-orange-500"
      }
    ];
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <PageHeader title="Intelligence Reports" showBack={true} />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Simulating analytical nodes..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32">
       <PageHeader 
        title="Business Intelligence"
        subtitle="Performance Analytics & Global Feed"
        showBack={true}
        onBackClick={() => navigate("/dashboard")}
        rightAction={
          <Button variant="outline" size="sm" className="rounded-md font-black uppercase tracking-widest text-[10px] h-9" onClick={() => window.print()}>
             <Download className="w-3.5 h-3.5 mr-2" /> EXPORT BUNDLE
          </Button>
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        
        {/* Metric Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
           {primaryStats.map((stat, idx) => (
             <Card key={idx} className="border bg-card shadow-sm group hover:border-primary/20 transition-all pointer-events-auto">
               <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <stat.icon size={16} className={cn("opacity-40 group-hover:opacity-100 transition-opacity", stat.color)} />
               </CardHeader>
               <CardContent className="p-5 pt-0">
                  <p className="text-2xl font-black text-foreground tracking-tighter leading-none">{stat.value}</p>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mt-2",
                    stat.trendUp ? "text-emerald-600" : "text-rose-600"
                  )}>
                     {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                     {stat.trend} vs Prior Node
                  </div>
               </CardContent>
             </Card>
           ))}
        </div>

        {/* Analytical Visuals Placeholder Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-5 bg-primary rounded-full" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Revenue Channel Distribution</h3>
              </div>
              <Card className="border bg-card shadow-sm min-h-[320px] flex flex-col items-center justify-center p-8 text-center pointer-events-auto">
                 <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-muted-foreground/30 animate-pulse" />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-widest leading-none">Syncing Data Visuals</h4>
                 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-2 leading-relaxed opacity-60">Establish higher transactional volume to calibrate channel metrics.</p>
              </Card>
           </section>

           <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-5 bg-zinc-900 dark:bg-white rounded-full" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Asset Retention Ratio</h3>
              </div>
              <Card className="border bg-card shadow-sm min-h-[320px] flex flex-col items-center justify-center p-8 text-center pointer-events-auto">
                 <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-muted-foreground/30" />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-widest leading-none">Analytics Engine Locked</h4>
                 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-2 leading-relaxed opacity-60">System requires 30 days of consistent registry logs to plot retention.</p>
              </Card>
           </section>
        </div>

        {/* Strategic Insight Section */}
        <section className="space-y-4 animate-in fade-in duration-1000">
           <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Strategic Intelligence</h3>
           </div>
           
           <Card className="bg-zinc-900 border-zinc-800 shadow-2xl relative overflow-hidden group pointer-events-auto">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                 <Layers size={140} className="text-emerald-500" />
              </div>
              <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="space-y-6 text-center md:text-left flex-1">
                    <Badge variant="outline" className="bg-white/5 text-white/40 border-white/10 uppercase tracking-widest text-[9px] h-5 px-3">INSIGHTS BUNDLE</Badge>
                    <div className="space-y-2">
                       <h4 className="text-2xl font-black text-white tracking-tighter uppercase tracking-[0.05em]">Cycle Optimization Required</h4>
                       <p className="text-sm font-medium text-white/50 max-w-sm leading-relaxed">Predictive analysis indicates a 15% potential increase in net margin by optimizing your procurement pipeline latency.</p>
                    </div>
                    <div className="flex pt-4">
                       <Button className="bg-white text-zinc-900 hover:bg-white/90 rounded-md font-black uppercase tracking-widest text-[11px] h-11 px-10">INITIATE DEEP ANALYSIS</Button>
                    </div>
                 </div>
                 <div className="hidden md:flex h-40 w-40 bg-white/5 rounded-2xl border border-white/10 items-center justify-center p-8 backdrop-blur-sm">
                    <PieChart className="w-full h-full text-emerald-400 opacity-60" />
                 </div>
              </CardContent>
           </Card>
        </section>

        {/* Audit Log Footnote */}
        <Card className="border bg-muted/10 border-dashed pointer-events-auto mt-12">
            <CardContent className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted/40 rounded-md flex items-center justify-center border text-muted-foreground"><Info className="h-5 w-5" /></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Registry Audit Footprint</span>
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">LOG_ID: ARCHIVE-2024-OFFLINE</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Live Sync Status: ENCRYPTED</span>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
