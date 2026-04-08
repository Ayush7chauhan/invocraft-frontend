import React from "react";
import { TrendingUp, TrendingDown, ReceiptText } from "lucide-react";

interface BillSummaryProps {
  totalAmount: string;
  paidAmount: string;
  unpaidAmount: string;
}

const BillSummary: React.FC<BillSummaryProps> = ({
  totalAmount,
  paidAmount,
  unpaidAmount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="p-6 rounded-[32px] bg-white dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <ReceiptText className="w-4 h-4 text-orange-600" />
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Billed</p>
        </div>
        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{totalAmount}</p>
      </div>

      <div className="p-6 rounded-[32px] bg-emerald-50/50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/20 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
           </div>
           <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Amount Received</p>
        </div>
        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{paidAmount}</p>
      </div>

      <div className="p-6 rounded-[32px] bg-rose-50/50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-900/20 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-600" />
           </div>
           <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Pending Payment</p>
        </div>
        <p className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">{unpaidAmount}</p>
      </div>
    </div>
  );
};

export default BillSummary;
