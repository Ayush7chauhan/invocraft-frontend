import {
  Menu,
  Bell,
  ArrowDown,
  ArrowUp,
  Users,
  Wallet,
  UserPlus,
  Plus,
  Home,
  BarChart3,
  Settings,
  Moon,
  Sun,
  FileText,
  Package,
  TrendingDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../hooks/useTheme";
import { Card, CardContent } from "../components/ui/card";
import api from "../utils/api";
import QuickActionModal from "../components/QuickActionModal";

type NavOptions = {
  openWithLowStock?: boolean;
  openForm?: boolean;
  reportView?: "all" | "filter" | "chart";
};
type DashboardProps = {
  onNavigate?: (page: string, options?: NavOptions) => void;
};

export default function Dashboard({ onNavigate }: DashboardProps = {}) {
  const [userData, setUserData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/dashboard");
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh dashboard when window regains focus (user comes back from other pages)
    const handleFocus = () => {
      fetchDashboardData();
    };

    window.addEventListener("focus", handleFocus);

    // Also listen for custom refresh event
    const handleRefresh = () => {
      fetchDashboardData();
    };

    window.addEventListener("dashboard-refresh", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("dashboard-refresh", handleRefresh);
    };
  }, []);

  const shopName = userData?.shop_name || userData?.owner_name || "My Shop";
  const ownerName = userData?.owner_name || "Owner";

  const totalReceivable = dashboardData?.total_receivable || 0;
  const totalPayable = dashboardData?.total_payable || 0;
  const todaySales = dashboardData?.today_sales || 0;
  const todayPayments = dashboardData?.today_payments || 0;
  const recentTransactions = dashboardData?.recent_transactions || [];
  const lowStockProducts = dashboardData?.low_stock_products || [];

  // Personal balances
  const personalTheyOwe = dashboardData?.personal_they_owe || 0;
  const personalYouOwe = dashboardData?.personal_you_owe || 0;

  // Combined totals (Business + Personal)
  const combinedReceivable = totalReceivable + personalTheyOwe;
  const combinedPayable = totalPayable + personalYouOwe;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTransactionDate = (date: string) => {
    const transactionDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return transactionDate.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-gray-900 flex transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        currentPage="dashboard"
        onClose={() => setSidebarOpen(false)}
        onNavigate={(page, options) => {
          onNavigate?.(page, options);
          setSidebarOpen(false);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-sm bg-white dark:bg-gray-800 min-h-screen relative flex flex-col transition-colors duration-300">
          {/* Header */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-[#EEF2F7] dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-3xl shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-9 h-9 rounded-xl bg-[#F3F4F6] dark:bg-gray-700 flex items-center justify-center transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95"
              >
                <Menu className="w-5 h-5 text-[#111827] dark:text-white transition-colors duration-300" />
              </button>
              <div>
                <p className="text-sm font-semibold text-[#111827] dark:text-white transition-colors duration-300">
                  {shopName}
                </p>
                <p className="text-xs text-[#9CA3AF] dark:text-gray-400 transition-colors duration-300">
                  {ownerName} • Manage your ledger
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="relative w-9 h-9 rounded-xl bg-[#F3F4F6] dark:bg-gray-700 flex items-center justify-center transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95"
              >
                <Sun
                  className={`absolute w-4 h-4 text-[#6B7280] dark:text-gray-300 transition-all duration-500 ease-in-out ${
                    isDarkMode
                      ? "opacity-0 rotate-180 scale-0"
                      : "opacity-100 rotate-0 scale-100"
                  }`}
                  style={{ willChange: "opacity, transform" }}
                />
                <Moon
                  className={`absolute w-4 h-4 text-[#6B7280] dark:text-gray-300 transition-all duration-500 ease-in-out ${
                    isDarkMode
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 -rotate-180 scale-0"
                  }`}
                  style={{ willChange: "opacity, transform" }}
                />
              </button>
              <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] dark:bg-gray-700 flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95">
                <Bell className="w-4 h-4 text-[#6B7280] dark:text-gray-300 transition-colors duration-300" />
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 pb-28 hide-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
              </div>
            ) : (
              <>
                {/* You Will Get Card - Combined Business + Personal */}
                <Card className="bg-[#E8FDEB] dark:bg-green-900/30 border-[#CFF6D9] dark:border-green-800 shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-2 cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#16A34A] dark:text-green-400 mb-2 tracking-wide uppercase">
                          You Will Get
                        </p>
                        <p className="text-3xl font-bold text-[#14532D] dark:text-green-300 mb-3 leading-tight">
                          {formatAmount(combinedReceivable)}
                        </p>
                        <div className="flex flex-col gap-1 text-[#15803D] dark:text-green-400">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-medium">
                              Business: {formatAmount(totalReceivable)}
                            </span>
                          </div>
                          {personalTheyOwe > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span className="text-xs font-medium">
                                Personal: {formatAmount(personalTheyOwe)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#22C55E] dark:bg-green-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg ml-4 flex-shrink-0">
                        <ArrowDown className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* You Will Give Card - Combined Business + Personal */}
                <Card className="bg-[#FDECEC] dark:bg-red-900/30 border-[#F9CACA] dark:border-red-800 shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-2 cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#DC2626] dark:text-red-400 mb-2 tracking-wide uppercase">
                          You Will Give
                        </p>
                        <p className="text-3xl font-bold text-[#7F1D1D] dark:text-red-300 mb-3 leading-tight">
                          {formatAmount(combinedPayable)}
                        </p>
                        <div className="flex flex-col gap-1 text-[#DC2626] dark:text-red-400">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-medium">
                              Business: {formatAmount(totalPayable)}
                            </span>
                          </div>
                          {personalYouOwe > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span className="text-xs font-medium">
                                Personal: {formatAmount(personalYouOwe)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#EF4444] dark:bg-red-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg ml-4 flex-shrink-0">
                        <ArrowUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Today's Sales & Payments */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1">
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold text-[#6B7280] dark:text-gray-400 mb-2">
                        Today's Sales
                      </p>
                      <p className="text-xl font-bold text-[#16A34A] dark:text-green-400">
                        {formatAmount(todaySales)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1">
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold text-[#6B7280] dark:text-gray-400 mb-2">
                        Today's Payments
                      </p>
                      <p className="text-xl font-bold text-[#16A34A] dark:text-green-400">
                        {formatAmount(todayPayments)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Net Balance Card */}
                <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-2 cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#6B7280] dark:text-gray-400 mb-2 tracking-wide uppercase">
                          Net Balance
                        </p>
                        <p className="text-2xl font-bold text-[#16A34A] dark:text-green-400 leading-tight">
                          {formatAmount(combinedReceivable - combinedPayable)}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#F3F4F6] dark:bg-gray-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md ml-4 flex-shrink-0">
                        <Wallet className="w-6 h-6 text-[#6B7280] dark:text-gray-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onNavigate?.("create-invoice")}
                    className="group border-2 border-dashed border-[#D1D5DB] dark:border-gray-700 rounded-3xl py-4 px-3 flex flex-col items-center justify-center gap-2 text-[#374151] dark:text-gray-300 transition-all duration-300 ease-out hover:border-[#22C55E] dark:hover:border-green-500 hover:bg-[#F6FEF8] dark:hover:bg-green-900/20 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#E8FDEB] dark:bg-green-900/30 flex items-center justify-center text-[#22C55E] dark:text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-xs transition-colors duration-300">
                      Create Invoice
                    </span>
                  </button>
                  <button
                    onClick={() => onNavigate?.("add-khata")}
                    className="group border-2 border-dashed border-[#D1D5DB] dark:border-gray-700 rounded-3xl py-4 px-3 flex flex-col items-center justify-center gap-2 text-[#374151] dark:text-gray-300 transition-all duration-300 ease-out hover:border-[#22C55E] dark:hover:border-green-500 hover:bg-[#F6FEF8] dark:hover:bg-green-900/20 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#E8FDEB] dark:bg-green-900/30 flex items-center justify-center text-[#22C55E] dark:text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-xs transition-colors duration-300">
                      Add Khata Entry
                    </span>
                  </button>
                  <button
                    onClick={() => onNavigate?.("add-product")}
                    className="group border-2 border-dashed border-[#D1D5DB] dark:border-gray-700 rounded-3xl py-4 px-3 flex flex-col items-center justify-center gap-2 text-[#374151] dark:text-gray-300 transition-all duration-300 ease-out hover:border-[#22C55E] dark:hover:border-green-500 hover:bg-[#F6FEF8] dark:hover:bg-green-900/20 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#E8FDEB] dark:bg-green-900/30 flex items-center justify-center text-[#22C55E] dark:text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-xs transition-colors duration-300">
                      Add Product
                    </span>
                  </button>
                  <button
                    onClick={() => onNavigate?.("add-customer")}
                    className="group border-2 border-dashed border-[#D1D5DB] dark:border-gray-700 rounded-3xl py-4 px-3 flex flex-col items-center justify-center gap-2 text-[#374151] dark:text-gray-300 transition-all duration-300 ease-out hover:border-[#22C55E] dark:hover:border-green-500 hover:bg-[#F6FEF8] dark:hover:bg-green-900/20 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#E8FDEB] dark:bg-green-900/30 flex items-center justify-center text-[#22C55E] dark:text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-xs transition-colors duration-300">
                      Add Customer
                    </span>
                  </button>
                </div>

                {/* Personal Contacts Section */}
                <div className="pt-4 border-t border-[#E5E7EB] dark:border-gray-700 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-[#111827] dark:text-white">
                      Personal
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onNavigate?.("personal-contacts")}
                      className="group border-2 border-dashed border-[#D1D5DB] dark:border-gray-700 rounded-3xl py-4 px-3 flex flex-col items-center justify-center gap-2 text-[#374151] dark:text-gray-300 transition-all duration-300 ease-out hover:border-[#22C55E] dark:hover:border-green-500 hover:bg-[#F6FEF8] dark:hover:bg-green-900/20 hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-[#E8FDEB] dark:bg-green-900/30 flex items-center justify-center text-[#22C55E] dark:text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-xs transition-colors duration-300">
                        Friends & Relatives
                      </span>
                    </button>
                    <button
                      onClick={() => onNavigate?.("personal-expense")}
                      className="group border-2 border-dashed border-[#D1D5DB] dark:border-gray-700 rounded-3xl py-4 px-3 flex flex-col items-center justify-center gap-2 text-[#374151] dark:text-gray-300 transition-all duration-300 ease-out hover:border-[#22C55E] dark:hover:border-green-500 hover:bg-[#F6FEF8] dark:hover:bg-green-900/20 hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-[#E8FDEB] dark:bg-green-900/30 flex items-center justify-center text-[#22C55E] dark:text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-xs transition-colors duration-300">
                        Expenses
                      </span>
                    </button>
                  </div>
                </div>

                {/* Low Stock Warning - click to open Products and see low stock */}
                {lowStockProducts.length > 0 && (
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      onNavigate?.("add-product", { openWithLowStock: true })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      onNavigate?.("add-product", { openWithLowStock: true })
                    }
                    className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 shadow-md cursor-pointer hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                          Low Stock Alert
                        </p>
                      </div>
                      <p className="text-xs text-orange-700 dark:text-orange-400">
                        {lowStockProducts.length} product
                        {lowStockProducts.length > 1 ? "s" : ""} running low —
                        tap to view
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Transactions Header */}
                <div className="flex items-center justify-between pt-2 px-1">
                  <p className="text-base font-bold text-[#111827] dark:text-white transition-colors duration-300">
                    Recent Transactions
                  </p>
                  <button
                    onClick={() => onNavigate?.("view-all-transactions")}
                    className="text-xs font-semibold text-[#22C55E] dark:text-green-400 transition-colors duration-300 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {/* Transaction Cards */}
                <div className="space-y-3">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx: any) => (
                      <Card
                        key={tx.id}
                        className="border-gray-200 dark:border-gray-700 shadow-md hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[#22C55E]/30 dark:hover:border-green-500/30 cursor-pointer group bg-white dark:bg-gray-800"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-2xl bg-[#F3F4F6] dark:bg-gray-700 flex items-center justify-center text-[#6B7280] dark:text-gray-300 text-xs font-bold transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-sm flex-shrink-0">
                                {tx.party?.name
                                  ?.split(" ")
                                  .map((part: string) => part[0])
                                  .slice(0, 2)
                                  .join("") || "NA"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#111827] dark:text-white transition-colors duration-300 truncate group-hover:text-[#22C55E] dark:group-hover:text-green-400">
                                  {tx.party?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-[#9CA3AF] dark:text-gray-400 transition-colors duration-300 mt-0.5">
                                  {formatTransactionDate(tx.transaction_date)}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 text-xs">
                                  <span
                                    className={`font-medium transition-colors duration-300 ${
                                      tx.type === "credit"
                                        ? "text-[#16A34A] dark:text-green-400"
                                        : "text-[#DC2626] dark:text-red-400"
                                    }`}
                                  >
                                    {tx.type === "credit" ? "Credit" : "Debit"}
                                  </span>
                                  {tx.note && (
                                    <>
                                      <span className="text-[#D1D5DB] dark:text-gray-600 transition-colors duration-300">
                                        •
                                      </span>
                                      <span className="text-[#6B7280] dark:text-gray-400 transition-colors duration-300 truncate">
                                        {tx.note}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`text-base font-bold transition-all duration-300 ml-3 flex-shrink-0 group-hover:scale-110 ${
                                tx.type === "credit"
                                  ? "text-[#16A34A] dark:text-green-400"
                                  : "text-[#DC2626] dark:text-red-400"
                              }`}
                            >
                              {tx.type === "credit" ? "+" : "-"}
                              {formatAmount(tx.amount)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardContent className="p-8 text-center">
                        <p className="text-sm text-[#9CA3AF] dark:text-gray-400">
                          No transactions yet
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Floating Action Button */}
          <button
            onClick={() => setShowQuickActions(true)}
            className="fixed right-5 bottom-28 w-14 h-14 rounded-2xl bg-[#22C55E] dark:bg-green-600 text-white flex items-center justify-center shadow-2xl transition-all duration-300 ease-out hover:scale-110 hover:shadow-3xl active:scale-95 z-10"
          >
            <Plus className="w-7 h-7" />
          </button>

          {/* Quick Action Modal */}
          <QuickActionModal
            isOpen={showQuickActions}
            onClose={() => setShowQuickActions(false)}
            onSelect={(action) => {
              onNavigate?.(action as any);
            }}
          />

          {/* Fixed Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-[#EEF2F7] dark:border-gray-700 flex justify-around py-4 px-2 text-[#9CA3AF] dark:text-gray-400 text-xs transition-colors duration-300 z-20 shadow-lg">
            <button
              onClick={() => {
                // Already on dashboard, just scroll to top or refresh
                window.scrollTo({ top: 0, behavior: "smooth" });
                window.dispatchEvent(new CustomEvent("dashboard-refresh"));
              }}
              className="flex flex-col items-center gap-1.5 text-[#22C55E] dark:text-green-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#E8FDEB] dark:bg-green-900/30 flex items-center justify-center transition-all duration-300">
                <Home className="w-5 h-5 transition-colors duration-300" />
              </div>
              <span className="font-semibold text-xs transition-colors duration-300">
                Home
              </span>
            </button>
            <button
              onClick={() => onNavigate?.("add-customer")}
              className="flex flex-col items-center gap-1.5 transition-all duration-300 hover:-translate-y-1 hover:text-[#374151] dark:hover:text-gray-200 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Users className="w-5 h-5 transition-colors duration-300" />
              </div>
              <span className="font-medium text-xs transition-colors duration-300">
                Customers
              </span>
            </button>
            <button
              onClick={() => onNavigate?.("reports")}
              className="flex flex-col items-center gap-1.5 transition-all duration-300 hover:-translate-y-1 hover:text-[#374151] dark:hover:text-gray-200 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <BarChart3 className="w-5 h-5 transition-colors duration-300" />
              </div>
              <span className="font-medium text-xs transition-colors duration-300">
                Reports
              </span>
            </button>
            <button
              onClick={() => onNavigate?.("settings")}
              className="flex flex-col items-center gap-1.5 transition-all duration-300 hover:-translate-y-1 hover:text-[#374151] dark:hover:text-gray-200 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="w-5 h-5 transition-colors duration-300" />
              </div>
              <span className="font-medium text-xs transition-colors duration-300">
                Settings
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
