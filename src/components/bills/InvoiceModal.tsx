import React from "react";
import { X, FileText, ShoppingBag, ReceiptText, Calendar, User, CreditCard } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto">
      <div className="w-full max-w-lg bg-white dark:bg-gray-950 rounded-t-[48px] shadow-2xl animate-in slide-in-from-bottom-20 duration-500 max-h-[92vh] flex flex-col border-t-2 border-emerald-500/20">
        
        {/* Decorative Handle */}
        <div className="w-full flex justify-center py-3">
          <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-50 dark:border-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                {loading ? "Fetching Bill..." : `Bill Details`}
              </h3>
              {!loading && (
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                   INVOICE <span className="text-emerald-500">#{invoice.invoice_number}</span>
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent shadow-xl" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Synchronizing Data</p>
            </div>
          ) : (
            <>
              {/* Info Grid Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-[28px] border-2 border-gray-100 dark:border-gray-800 space-y-2">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     <Calendar className="w-3 h-3" /> Bill Date
                   </div>
                   <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-[28px] border-2 border-gray-100 dark:border-gray-800 space-y-2">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     <CreditCard className="w-3 h-3" /> Status
                   </div>
                   <div className="flex">
                      <Badge variant={invoice.payment_status === "paid" ? "success" : invoice.payment_status === "partially_paid" ? "warning" : "danger"} className="text-[8px] font-black tracking-widest py-1 px-3">
                        {invoice.payment_status?.replace("_", " ")}
                      </Badge>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User className="w-3 h-3" /> Customer Information
                </p>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-[32px] border-2 border-gray-50 dark:border-gray-800 shadow-sm space-y-1">
                   <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{invoice.party?.name || "CASH SALE"}</h4>
                   <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                     +91 {invoice.party?.mobile || "No Number Provided"}
                   </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ShoppingBag className="w-3 h-3" /> Cart Inventory
                </p>
                <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-[40px] border-2 border-gray-50 dark:border-gray-800 overflow-hidden shadow-inner">
                  <div className="p-4 space-y-3">
                    {invoice.items?.map((item: any) => (
                      <div key={item.id} className="p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4 group hover:border-emerald-500/20 transition-all">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase truncate mb-1">{item.product?.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {item.quantity} {item.product?.unit || "UNIT"} × {formatAmount(Number(item.unit_price))}
                            </span>
                            {Number(item.tax_rate) > 0 && (
                              <span className="text-[9px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-lg">TAX {item.tax_rate}%</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-white tracking-tighter shrink-0">
                          {formatAmount(Number(item.total))}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Totals Section */}
                  <div className="p-8 bg-white dark:bg-gray-950/80 border-t-4 border-dashed border-gray-50 dark:border-gray-900 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                      <span>Subtotal Display</span>
                      <span className="text-gray-900 dark:text-white">{formatAmount(Number(invoice.subtotal))}</span>
                    </div>
                    {Number(invoice.tax_amount) > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-50/50 dark:bg-blue-900/10 px-4 py-2 rounded-2xl">
                        <span>GST Total</span>
                        <span className="font-black">{formatAmount(Number(invoice.tax_amount))}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100 dark:border-gray-900">
                      <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Grand Total</span>
                      <span className="text-3xl font-black text-emerald-500 tracking-tighter drop-shadow-sm">{formatAmount(Number(invoice.total_amount))}</span>
                    </div>
                    {Number(invoice.paid_amount) > 0 && (
                      <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl mt-4">
                        <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Recorded Payment</span>
                        <span className="text-sm font-black text-orange-600 dark:text-orange-400">-{formatAmount(Number(invoice.paid_amount))}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Card */}
              {invoice.notes && (
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[32px] border-2 border-gray-100 dark:border-gray-800 border-dashed space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FileText className="w-3 h-3" /> Internal Notes</p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 italic">"{invoice.notes}"</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-50 dark:border-gray-900 bg-white dark:bg-gray-950">
           <Button className="w-full h-18 rounded-[32px] shadow-2xl shadow-green-500/20 bg-green-500 hover:bg-green-600 font-black tracking-widest text-sm uppercase" onClick={onClose}>
             GOT IT
           </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
