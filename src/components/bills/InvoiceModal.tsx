import React from "react";
import { X, FileText, ShoppingBag } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

interface InvoiceModalProps {
  invoice: any;
  loading: boolean;
  onClose: () => void;
  formatAmount: (amount: number) => string;
  formatDate: (date: string) => string;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  loading,
  onClose,
  formatAmount,
  formatDate,
}) => {
  if (!loading && !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Invoice Details
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Order Summary</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl bg-gray-100 dark:bg-gray-800">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent shadow-xl mb-4" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fetching Bill Details</p>
            </div>
          ) : (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice Number</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{invoice.invoice_number}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{invoice.party?.name}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                  <Badge variant={invoice.payment_status === "paid" ? "success" : "danger"} className="text-[9px]">
                    {invoice.payment_status?.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingBag className="w-3 h-3" /> Purchased Items
                </p>
                <div className="bg-gray-50/50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {invoice.items?.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.product?.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {item.quantity} {item.unit || "unit"} × {formatAmount(Number(item.unit_price))}
                          </p>
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-white shrink-0">
                          {formatAmount(Number(item.total))}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Totals Section */}
                  <div className="p-5 bg-white dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>{formatAmount(Number(invoice.subtotal))}</span>
                    </div>
                    {Number(invoice.tax_amount) > 0 && (
                      <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <span>Tax</span>
                        <span>{formatAmount(Number(invoice.tax_amount))}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-gray-800">
                      <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Total Amount</span>
                      <span className="text-lg font-black text-green-500 tracking-tight">{formatAmount(Number(invoice.total_amount))}</span>
                    </div>
                    {invoice.paid_amount > 0 && (
                      <div className="flex justify-between items-center text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest border-t border-gray-50 dark:border-gray-800 pt-2">
                        <span>Amount Paid</span>
                        <span>{formatAmount(Number(invoice.paid_amount))}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 italic">"{invoice.notes}"</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
           <Button className="w-full h-14 rounded-2xl shadow-xl shadow-green-500/20" onClick={onClose}>
             DONE
           </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
