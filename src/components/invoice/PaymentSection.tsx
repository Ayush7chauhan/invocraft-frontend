import React from "react";
import { CreditCard, CircleDollarSign, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Input from "../ui/Input";

interface PaymentSectionProps {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
  setPaymentStatus: (status: any) => void;
  paidAmount: number | string;
  setPaidAmount: (amount: string) => void;
  formatAmount: (amount: number) => string;
  error?: string;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  subtotal,
  taxAmount,
  totalAmount,
  paymentStatus,
  setPaymentStatus,
  paidAmount,
  setPaidAmount,
  formatAmount,
  error,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
          <CreditCard className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none">Billing Summary</h2>
      </div>

      <div className="p-8 bg-white dark:bg-gray-900 rounded-[32px] border-2 border-gray-50 dark:border-gray-800 shadow-xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Subtotal</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatAmount(subtotal)}</span>
          </div>
          {taxAmount > 0 && (
            <div className="flex justify-between items-center text-blue-500 bg-blue-50/50 dark:bg-blue-900/10 px-4 py-2 rounded-2xl border border-blue-50/50 dark:border-blue-900/20">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tax Total</span>
              <span className="text-sm font-black">{formatAmount(taxAmount)}</span>
            </div>
          )}
        </div>

        <div className="pt-5 border-t-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center gap-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Grand Total</span>
          <div className="text-4xl font-black text-green-500 tracking-tighter tabular-nums drop-shadow-sm">
            {formatAmount(totalAmount)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</label>
          {paymentStatus === "paid" && (
            <Badge variant="success" className="text-[8px] font-black uppercase tracking-widest py-0.5 px-2">Fully Settled</Badge>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "unpaid", label: "Unpaid", icon: AlertCircle, color: "rose" },
            { id: "partially_paid", label: "Partial", icon: Clock, color: "orange" },
            { id: "paid", label: "Paid", icon: CheckCircle2, color: "emerald" },
          ].map((item) => {
            const isSelected = paymentStatus === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPaymentStatus(item.id)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[28px] border-2 transition-all duration-300 active:scale-95 ${
                  isSelected 
                    ? `bg-${item.color}-500 border-${item.color}-500 text-white shadow-lg shadow-${item.color}-500/20 scale-[1.02]` 
                    : "bg-gray-50 dark:bg-gray-800/50 text-gray-400 border-gray-50 dark:border-gray-800 hover:border-gray-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </div>

        {paymentStatus === "partially_paid" && (
          <div className="animate-in slide-in-from-top-4 duration-500 p-6 bg-orange-50/50 dark:bg-orange-900/5 rounded-[32px] border-2 border-orange-100 dark:border-orange-900/20">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <CircleDollarSign className="w-5 h-5 text-orange-600" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Amount Paid</label>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Record advance or partial payment</p>
               </div>
            </div>
            <Input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="0.00"
              className="bg-white border-2 border-orange-100 focus:border-orange-500 focus:ring-orange-500/10"
              error={error}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Simple internal Badge component to avoid dependency issues during refactor
const Badge = ({ children, variant, className = "" }: { children: React.ReactNode; variant: 'success' | 'warning' | 'error' | 'neutral'; className?: string }) => {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20",
    error: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20",
    neutral: "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg border font-bold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default PaymentSection;
