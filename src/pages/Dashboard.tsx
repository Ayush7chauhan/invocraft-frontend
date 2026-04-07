import { useMemo } from "react";
import {
  Bell,
  Wallet,
  FileText,
  Package,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  ArrowRight,
  TrendingUp as TrendingUpIcon,
  ShoppingBag,
  Users,
  BookOpen,
  ReceiptText,
  BarChart3,
  Clock
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useDashboard } from "../hooks/useDashboard";
import type { Invoice } from "../types/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setSidebarOpen } = useOutletContext<{ setSidebarOpen: (open: boolean) => void }>();
  
  const { data: dashboardData, isLoading, isError, refetch, isRefetching } = useDashboard();

  const shopName = user?.shop_name || user?.owner_name || "My Shop";
  const ownerName = user?.owner_name || "Owner";

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const stats = useMemo(() => {
    if (!dashboardData) return [];
    return [
      {
        label: "Total Sales",
        value: formatAmount(dashboardData.total_sales || 0),
        icon: TrendingUpIcon,
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-900/10",
        border: "border-emerald-100 dark:border-emerald-800/50",
        path: "/reports"
      },
      {
        label: "Total Purchases",
        value: formatAmount(dashboardData.total_purchases || 0),
        icon: ShoppingBag,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/10",
        border: "border-orange-100 dark:border-orange-800/50",
        path: "/reports"
      },
      {
        label: "Receivable",
        value: formatAmount(dashboardData.total_receivable || 0),
        icon: Wallet,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/10",
        border: "border-blue-100 dark:border-blue-800/50",
        path: "/parties/new"
      },
      {
        label: "Payable",
        value: formatAmount(dashboardData.total_payable || 0),
        icon: TrendingDown,
        color: "text-rose-500",
        bg: "bg-rose-50 dark:bg-rose-900/10",
        border: "border-rose-100 dark:border-rose-800/50",
        path: "/parties/new"
      }
    ];
  }, [dashboardData]);

  const quickActions = [
    { label: "New Bill", icon: FileText, path: "/bills/create", color: "bg-emerald-500" },
    { label: "Add Khata", icon: BookOpen, path: "/khata-book/entry", color: "bg-blue-500" },
    { label: "Add Expense", icon: ReceiptText, path: "/personal/expenses", color: "bg-rose-500" },
    { label: "Add Party", icon: Users, path: "/parties/new", color: "bg-purple-500" },
    { label: "Add Product", icon: Package, path: "/products/new", color: "bg-orange-500" },
    { label: "All Bills", icon: ShoppingBag, path: "/bills", color: "bg-cyan-500" },
    { label: "Transactions", icon: Clock, path: "/khata-book/transactions", color: "bg-amber-500" },
    { label: "Analytics", icon: BarChart3, path: "/reports", color: "bg-indigo-500" },
  ];

  if (isError) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/10 rounded-full flex items-center justify-center text-rose-500">
             <RotateCcw className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Something went wrong</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Failed to load your business dashboard</p>
          </div>
          <Button onClick={() => refetch()} isLoading={isRefetching} className="shadow-xl shadow-green-500/20 px-8">Retry Load</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={shopName}
        showBack={false}
        showMenu={true}
        onMenuClick={() => setSidebarOpen(true)}
        rightAction={
          <Button variant="ghost" size="icon" className="relative group">
            <Bell className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900" />
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-10 pb-32 custom-scrollbar">
        {/* Welcome Section */}
        <div className="space-y-1 px-1">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Hi, {ownerName.split(" ")[0]}!</h2>
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Live Business Pulse</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-28 bg-gray-50 dark:bg-gray-800/50 animate-pulse rounded-[32px]" />
             ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {stats.map((stat, idx) => (
                 <Card 
                   key={idx} 
                   onClick={() => navigate(stat.path)}
                   className={`${stat.bg} ${stat.border} shadow-sm border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group rounded-[32px] overflow-hidden`}
                 >
                   <CardContent className="p-6 relative">
                     <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <stat.icon size={100} />
                     </div>
                     <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <div className={`p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${stat.color}`}>
                           <stat.icon className="w-5 h-5" />
                         </div>
                         <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                       </div>
                       <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                         <p className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Control Center</p>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {quickActions.map((action, idx) => (
                   <button
                     key={idx}
                     onClick={() => navigate(action.path)}
                     className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-[32px] shadow-sm hover:shadow-xl hover:border-green-500/20 transition-all duration-300 group"
                   >
                     <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                       <action.icon className="w-5 h-5" />
                     </div>
                     <span className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">{action.label}</span>
                   </button>
                 ))}
               </div>
            </div>

            {/* Recent Activity */}
            {dashboardData && dashboardData.recent_invoices && dashboardData.recent_invoices.length > 0 && (
              <div className="space-y-4">
                 <div className="flex items-center justify-between px-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Recent Activity</p>
                   <button onClick={() => navigate("/bills")} className="text-[10px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest transition-colors">View All</button>
                 </div>
                 <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-gray-800/10">
                    {dashboardData.recent_invoices.map((invoice: Invoice, idx: number) => (
                      <div key={idx} onClick={() => navigate("/bills")} className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                         <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <FileText className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="min-w-0 space-y-1">
                               <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{invoice.party?.name || "Anonymous Customer"}</p>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                 <span>{invoice.invoice_number}</span>
                                 <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                                 <span>{formatDate(invoice.invoice_date)}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{formatAmount(invoice.total_amount)}</span>
                            <Badge variant={invoice.payment_status === "paid" ? "success" : invoice.payment_status === "partially_paid" ? "warning" : invoice.payment_status === "unpaid" ? "danger" : "neutral"} className="text-[8px] px-1.5 py-0.5">
                              {(invoice.payment_status || "PENDING").toUpperCase()}
                            </Badge>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* Business Growing Alert */}
            {dashboardData && (
               <Card className="rounded-[32px] bg-gray-900 border-gray-800 shadow-2xl overflow-hidden p-6 sm:p-8 mt-4">
                 <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/40">
                       <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 space-y-1">
                       <h3 className="text-lg font-black text-white uppercase tracking-tight">Business is Growing!</h3>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">You've made {formatAmount(dashboardData.sales_this_month || 0)} this month.</p>
                    </div>
                    <Button onClick={() => navigate("/reports")} variant="secondary" className="rounded-2xl px-8 h-12">DEEP ANALYTICS</Button>
                 </div>
               </Card>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
