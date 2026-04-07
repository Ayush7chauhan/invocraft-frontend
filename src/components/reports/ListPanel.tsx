import React from "react";
import { X, Package, Users, Receipt, DollarSign, Loader2 } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

type ListType = "products" | "customers" | "transactions" | "invoices" | null;

interface ListPanelProps {
  selectedList: ListType;
  listData: any[];
  loading: boolean;
  filterRangeLabel: string;
  onClose: () => void;
  formatAmount: (amount: number) => string;
}

const ListPanel: React.FC<ListPanelProps> = ({
  selectedList,
  listData,
  loading,
  filterRangeLabel,
  onClose,
  formatAmount,
}) => {
  if (!selectedList) return null;

  const titles: Record<string, string> = {
    products: "Products",
    customers: "Customers",
    transactions: "Transactions",
    invoices: "Invoices",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">{titles[selectedList]}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{filterRangeLabel}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl bg-gray-100 dark:bg-gray-800">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fetching Details</p>
            </div>
          ) : listData.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest">No items found</p>
            </div>
          ) : (
            <div className="space-y-3 pb-8">
              {listData.map((item, idx) => (
                <ListItem key={item.id || idx} type={selectedList} item={item} formatAmount={formatAmount} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function ListItem({ type, item, formatAmount }: { type: ListType, item: any, formatAmount: (v: number) => string }) {
  const isProduct = type === "products";
  const isCustomer = type === "customers";
  const isTransaction = type === "transactions";
  const isInvoice = type === "invoices";

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-50 dark:border-gray-800 hover:border-green-500/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center shrink-0">
          {isProduct && <Package className="w-5 h-5 text-orange-500" />}
          {isCustomer && <Users className="w-5 h-5 text-purple-500" />}
          {isTransaction && <DollarSign className="w-5 h-5 text-green-500" />}
          {isInvoice && <Receipt className="w-5 h-5 text-blue-500" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {isProduct ? item.name : isCustomer ? item.name : isTransaction ? (item.party?.name || "Anonymous") : item.invoice_number}
          </p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {isProduct ? `Stock: ${item.stock_quantity ?? 0}` : isInvoice ? (item.party?.name || "Anonymous") : isTransaction ? (item.note || new Date(item.transaction_date).toLocaleDateString()) : (item.mobile || "No Mobile")}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        {isTransaction ? (
          <Badge variant={item.type === "credit" ? "success" : "danger"} className="text-[9px]">
            {item.type === "credit" ? "+" : "-"}{formatAmount(Number(item.amount))}
          </Badge>
        ) : (
          <p className="text-sm font-black text-gray-900 dark:text-white">
            {isProduct ? formatAmount(Number(item.selling_price ?? 0)) : isInvoice ? formatAmount(Number(item.total_amount ?? 0)) : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export default ListPanel;
