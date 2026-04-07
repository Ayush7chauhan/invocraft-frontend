import React from "react";
import { CreditCard, CircleDollarSign } from "lucide-react";
import Input from "../ui/Input";

interface PaymentSectionProps {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
  setPaymentStatus: (status: any) => void;
  paidAmount: string;
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
        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Billing Summary</h2>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          <span>Subtotal</span>
          <span>{formatAmount(subtotal)}</span>
        </div>
        {taxAmount > 0 && (
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            <span>Tax Total</span>
            <span>{formatAmount(taxAmount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-100 dark:border-gray-700">
          <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Grand Total</span>
          <span className="text-2xl font-black text-green-500 tracking-tight">{formatAmount(totalAmount)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Status</label>
        <div className="grid grid-cols-3 gap-2">
          {(["unpaid", "partially_paid", "paid"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setPaymentStatus(status)}
              className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${paymentStatus === status ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20" : "bg-gray-50 dark:bg-gray-800/50 text-gray-400 border-gray-50 dark:border-gray-800"}`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {paymentStatus === "partially_paid" && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Amount Received</label>
            <div className="relative">
              <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              <Input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0.00"
                className="pl-12"
              />
            </div>
            {error && <p className="text-[10px] font-bold text-red-500 uppercase ml-1 mt-1">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSection;
