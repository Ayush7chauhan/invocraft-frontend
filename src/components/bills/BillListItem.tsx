import React from "react";
import { Eye, Download, FileText, User } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import type { Invoice } from "../../types/api";

interface BillListItemProps {
  invoice: Invoice;
  onView: (inv: Invoice) => void;
  onDownload: (inv: Invoice) => void;
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

  const statusColors: Record<string, "success" | "danger" | "warning" | "primary" | "neutral" | undefined> = {
    paid: "success",
    unpaid: "danger",
    partially_paid: "warning",
  };

  return (
    <Card className="border-gray-50 dark:border-gray-800 hover:shadow-lg transition-all active:scale-[0.99] group overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 text-gray-500" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{invoice.invoice_number}</span>
              <Badge variant={statusColors[invoice.payment_status || "neutral"]} className="text-[8px] px-1.5 py-0.5">
                {(invoice.payment_status || "PENDING").toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {invoice.party?.name || "Anonymous Customer"}
            </p>
            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" /> {invoice.party?.mobile || "No Mobile"}</span>
              <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
              <span>{formatDate(invoice.invoice_date)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50 dark:border-gray-800">
          <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            {formatAmount(invoice.total_amount)}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onView(invoice)} className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDownload(invoice)} 
              isLoading={isDownloading}
              className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/50"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillListItem;
