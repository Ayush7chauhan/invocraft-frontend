import React from "react";
import { ArrowLeft, Download } from "lucide-react";
import Button from "../ui/Button";

interface InvoicePreviewProps {
  onBack: () => void;
  onDownload: () => void;
  isGeneratingPDF: boolean;
  userData: any;
  formData: any;
  selectedParty: any;
  items: any[];
  totals: any;
  formatAmount: (amount: number) => string;
  formatDate: (date: string) => string;
  pdfRef: React.RefObject<HTMLDivElement | null>;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  onBack,
  onDownload,
  isGeneratingPDF,
  userData,
  formData,
  selectedParty,
  items,
  totals,
  formatAmount,
  formatDate,
  pdfRef,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-2xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Preview Invoice</h2>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onDownload} 
          isLoading={isGeneratingPDF}
          className="rounded-2xl bg-green-500/10 text-green-600 border-none px-6"
        >
          <Download className="w-4 h-4 mr-2" /> 
          <span className="text-[10px] font-black uppercase tracking-widest">Save PDF</span>
        </Button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50 dark:bg-gray-950 custom-scrollbar">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 sm:p-12 space-y-10">
          
          {/* Shop & Invoice Info */}
          <div className="flex flex-col sm:flex-row justify-between gap-8 border-b-2 border-gray-50 dark:border-gray-800 pb-8">
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{userData.shop_name || "My Shop"}</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed max-w-xs">{userData.shop_address}</p>
              <p className="text-xs font-bold text-gray-400">Phone: {userData.mobile_number}</p>
            </div>
            <div className="sm:text-right space-y-2">
              <h2 className="text-3xl font-black text-green-500 uppercase tracking-tighter">INVOICE</h2>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice Number</p>
                <p className="text-sm font-black text-gray-900 dark:text-white"># {formData.invoice_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{formatDate(formData.invoice_date)}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill To</p>
              <p className="text-sm font-black text-gray-900 dark:text-white">{selectedParty?.name}</p>
              <p className="text-xs font-bold text-gray-500">{selectedParty?.mobile}</p>
              <p className="text-xs font-bold text-gray-500 leading-relaxed max-w-[200px]">{selectedParty?.address}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2">
              <span className="col-span-6">Item Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 px-2 items-center">
                  <div className="col-span-6 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.product_name}</p>
                    {item.tax_rate > 0 && <p className="text-[9px] font-bold text-blue-500 uppercase">Tax: {item.tax_rate}%</p>}
                  </div>
                  <span className="col-span-2 text-sm font-bold text-gray-600 text-center">{item.quantity}</span>
                  <span className="col-span-2 text-sm font-bold text-gray-600 text-right">{formatAmount(item.unit_price)}</span>
                  <span className="col-span-2 text-sm font-black text-gray-900 dark:text-white text-right">{formatAmount(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-8 border-t-2 border-gray-50 dark:border-gray-800">
            <div className="w-full max-w-[250px] space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>{formatAmount(totals.subtotal)}</span>
              </div>
              {totals.totalTax > 0 && (
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  <span>Total Tax</span>
                  <span>{formatAmount(totals.totalTax)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Grand Total</span>
                <span className="text-2xl font-black text-green-500 tracking-tighter">{formatAmount(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(formData.notes || formData.terms) && (
            <div className="space-y-4 pt-8 border-t border-gray-50 dark:border-gray-800">
              {formData.notes && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</p>
                  <p className="text-xs font-bold text-gray-500 italic">"{formData.notes}"</p>
                </div>
              )}
              {formData.terms && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Terms & Conditions</p>
                  <p className="text-xs font-bold text-gray-500 leading-relaxed">{formData.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Thank you footer */}
          <div className="text-center pt-12">
            <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.2em] mb-4">Generated via InvoCraft</p>
            <p className="text-xs font-bold text-green-500/50 uppercase tracking-widest">Thank you for your business!</p>
          </div>
        </div>
      </div>

      {/* Hidden real PDF generation container - Uses standard tailwind-compatible styles for html2canvas */}
      <div ref={pdfRef} className="absolute left-[-9999px] top-0 w-[210mm] p-10 bg-white text-gray-900 font-sans">
        {/* Same content as above but optimized for PDF dimensions */}
         <div className="border-b-2 border-gray-200 pb-6 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">{userData.shop_name || "My Shop"}</h1>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{userData.shop_address}</p>
              <p className="text-xs font-bold text-gray-500 mt-1">Phone: {userData.mobile_number}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-green-500 uppercase">INVOICE</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1"># {formData.invoice_number}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{formatDate(formData.invoice_date)}</p>
            </div>
          </div>
          {/* ... Rest of the PDF content similar to above hidden container in Bills.tsx ... */}
          <div className="mb-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bill To</p>
            <p className="text-sm font-black">{selectedParty?.name}</p>
            <p className="text-xs font-bold text-gray-500">{selectedParty?.mobile}</p>
            <p className="text-xs font-bold text-gray-500">{selectedParty?.address}</p>
          </div>
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="text-left py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Description</th>
                <th className="text-right py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                <th className="text-right py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="text-right py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-4 text-xs font-bold">{item.product_name}</td>
                  <td className="text-right py-4 text-xs font-bold">{item.quantity}</td>
                  <td className="text-right py-4 text-xs font-bold">{formatAmount(item.unit_price)}</td>
                  <td className="text-right py-4 text-xs font-black">{formatAmount(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="w-48 space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>{formatAmount(totals.subtotal)}</span>
              </div>
              {totals.totalTax > 0 && (
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Tax Total</span>
                  <span>{formatAmount(totals.totalTax)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-gray-100">
                <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
                <span className="text-sm font-black text-green-500">{formatAmount(totals.total)}</span>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-6 border-t border-gray-100 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Generated via InvoCraft. Thank you for your business!
          </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
