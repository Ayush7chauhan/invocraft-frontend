import React from "react";
import { Download, Eye, FileText, Calendar, CircleDollarSign } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import type { Invoice } from "../../types/api";

interface BillListItemProps {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  downloadingId: number | null;
  formatAmount: (amount: number) => string;
  formatDate: (date: string) => string;
}

const BillListItem: React.FC<BillListItemProps> = ({
  invoice,
  onView,
  onDownload,
  downloadingId,
  formatAmount,
  formatDate,
}) => {
  const isDownloading = downloadingId === invoice.id;
  const isPaid = invoice.payment_status === "paid";
  const isPartial = invoice.payment_status === "partially_paid";

  return (
    <Card className="group rounded-[32px] border-2 border-gray-50 dark:border-gray-800/50 hover:border-emerald-500/20 active:scale-[0.98] transition-all overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <div className="p-6 flex items-center justify-between gap-4 cursor-pointer" onClick={() => onView(invoice)}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isPaid ? 'bg-emerald-500/10 text-emerald-600' : isPartial ? 'bg-orange-500/10 text-orange-600' : 'bg-rose-500/10 text-rose-600'}`}>
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                  {invoice.party?.name || "Cash Sale"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                    #{invoice.invoice_number}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                    <Calendar className="w-2.5 h-2.5" />
                    {formatDate(invoice.invoice_date)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-lg font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">
              {formatAmount(invoice.total_amount)}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-1">
               <Badge variant={isPaid ? 'success' : isPartial ? 'warning' : 'error'}>
                 {invoice.payment_status.replace("_", " ")}
               </Badge>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/50 dark:bg-gray-800/50 px-6 py-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-800/80">
          <div className="flex items-center gap-4">
             {isPartial && (
               <div className="flex items-center gap-1.5">
                 <CircleDollarSign className="w-3.5 h-3.5 text-orange-500" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid: {formatAmount(invoice.paid_amount)}</span>
               </div>
             )}
          </div>
          <div className="flex gap-2.5">
            <button 
              onClick={(e) => { e.stopPropagation(); onView(invoice); }}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-emerald-500 hover:shadow-lg shadow-emerald-500/10 transition-all border border-gray-100 dark:border-gray-700"
              title="View Invoice"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDownload(invoice); }}
              disabled={isDownloading}
              className={`p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-blue-500 hover:shadow-lg shadow-blue-500/10 transition-all border border-gray-100 dark:border-gray-700 ${isDownloading ? 'animate-pulse opacity-50' : ''}`}
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Badge = ({ children, variant }: { children: React.ReactNode; variant: 'success' | 'warning' | 'error' }) => {
  const styles = {
    success: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    warning: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    error: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${styles[variant]} transition-all`}>
      {children}
    </span>
  );
};

export default BillListItem;
