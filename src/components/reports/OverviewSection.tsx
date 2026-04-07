import React from "react";
import { Receipt, DollarSign, BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import Badge from "../ui/Badge";

type ListType = "products" | "customers" | "transactions" | "invoices" | null;

interface OverviewSectionProps {
  loading: boolean;
  summaryData: any;
  recentInvoices: any[];
  recentTransactions: any[];
  onCardClick: (type: ListType) => void;
  formatAmount: (amount: number) => string;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  loading,
  summaryData,
  recentInvoices,
  recentTransactions,
  onCardClick,
  formatAmount,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-100 dark:border-gray-800">
        <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-3" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Overview</p>
      </div>
    );
  }

  const cardClass = "cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] border-gray-50 dark:border-gray-800 group";

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
          <BarChart3 className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Overview & Recent</h2>
      </div>

      {summaryData && (
        <div className="grid grid-cols-2 gap-3">
          <Card className={`${cardClass} bg-emerald-50/50 dark:bg-emerald-900/10`} onClick={() => onCardClick("invoices")}>
            <CardContent className="p-4">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Sales</p>
              <p className="text-lg font-black text-emerald-900 dark:text-emerald-200">{formatAmount(summaryData.total_sales)}</p>
            </CardContent>
          </Card>
          <Card className={`${cardClass} bg-purple-50/50 dark:bg-purple-900/10`} onClick={() => onCardClick("invoices")}>
            <CardContent className="p-4">
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Net Profit</p>
              <p className="text-lg font-black text-purple-900 dark:text-purple-200">{formatAmount(summaryData.net_profit)}</p>
            </CardContent>
          </Card>
          <Card className={cardClass} onClick={() => onCardClick("invoices")}>
            <CardContent className="p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoices</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">{summaryData.total_invoices}</p>
            </CardContent>
          </Card>
          <Card className={cardClass} onClick={() => onCardClick("transactions")}>
            <CardContent className="p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Transactions</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">{summaryData.total_transactions}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-3">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Receipt className="w-3 h-3 text-green-500" /> Recent Invoices
          </p>
          <Card className="border-gray-50 dark:border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              {recentInvoices.length === 0 ? (
                <p className="text-xs font-bold text-gray-300 dark:text-gray-700 py-8 text-center uppercase tracking-widest">No Recent Invoices</p>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {recentInvoices.map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate pr-4">{inv.invoice_number}</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{formatAmount(Number(inv.total_amount ?? 0))}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
            <DollarSign className="w-3 h-3 text-green-500" /> Recent Transactions
          </p>
          <Card className="border-gray-50 dark:border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              {recentTransactions.length === 0 ? (
                <p className="text-xs font-bold text-gray-300 dark:text-gray-700 py-8 text-center uppercase tracking-widest">No Recent Transactions</p>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate pr-4">{tx.party?.name ?? "Anonymous"}</span>
                      <Badge variant={tx.type === "credit" ? "success" : "danger"} className="shrink-0 text-[9px]">
                        {tx.type === "credit" ? "+" : "-"}{formatAmount(Number(tx.amount))}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;
