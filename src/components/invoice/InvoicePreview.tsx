import { X, Download, FileText, Calendar, User, MapPin, Phone } from "lucide-react";
import Button from "../ui/Button";

interface InvoicePreviewProps {
  onBack: () => void;
  onDownload: () => void;
  isGeneratingPDF: boolean;
  userData: any;
  formData: any;
  selectedParty: any;
  items: any[];
  totals: { subtotal: number; totalTax: number; total: number };
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
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-gray-950 animate-in fade-in duration-300">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white transition-all active:scale-95">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Invoice Preview</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formData.invoiceNumber}</p>
        </div>
        <Button 
          size="sm" 
          onClick={onDownload} 
          isLoading={isGeneratingPDF}
          className="h-10 rounded-xl bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20 px-4"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="text-[10px] font-black uppercase tracking-widest">Download</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50 flex justify-center custom-scrollbar">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-900 shadow-2xl rounded-[40px] overflow-hidden border border-gray-100 dark:border-gray-800 p-10 md:p-16 space-y-12 animate-in zoom-in-95 duration-500" ref={pdfRef}>
          
          <div className="flex flex-col md:flex-row justify-between gap-10 border-b-4 border-emerald-500 pb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[24px] bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{userData.shop_name || "BUSINESS NAME"}</h1>
                  <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-1">Official Tax Invoice</p>
                </div>
              </div>
              <div className="space-y-1 pl-1">
                <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> {userData.shop_address || "Shop Address Not Fixed"}</p>
                <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-500" /> {userData.mobile_number || "91 XXXXX XXXXX"}</p>
                {userData.email && <p className="text-xs font-bold text-gray-500 uppercase truncate">Email: {userData.email}</p>}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[32px] border-2 border-gray-100 dark:border-gray-800 flex flex-col justify-center text-right space-y-1 min-w-[200px]">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Invoice Details</p>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">#{formData.invoiceNumber}</h2>
              <p className="text-sm font-bold text-emerald-600">{formatDate(formData.invoiceDate)}</p>
              <Badge variant={formData.paymentStatus === 'paid' ? 'success' : 'warning'} className="mt-2 self-end uppercase text-[8px] tracking-[0.2em] px-3 py-1 bg-white dark:bg-gray-900 font-black">
                {formData.paymentStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 pt-4">
             <div className="space-y-4">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Billed To
                </p>
                {selectedParty ? (
                  <div className="space-y-1 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[28px] border-2 border-gray-100 dark:border-gray-800">
                    <p className="text-lg font-black text-gray-900 dark:text-white uppercase">{selectedParty.name}</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2"><Phone className="w-3 h-3" /> {selectedParty.mobile || "N/A"}</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2 leading-relaxed"><MapPin className="w-3 h-3 shrink-0" /> {selectedParty.address || "No Address Provided"}</p>
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-400">Walking Customer / Not Selected</p>
                )}
             </div>
             
             <div className="space-y-4 md:text-right">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex md:justify-end items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Payment Method
                </p>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[28px] border-2 border-gray-100 dark:border-gray-800 inline-block md:ml-auto">
                    <p className="text-lg font-black text-gray-900 dark:text-white uppercase">CASH / UPI</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase mt-1">Settled on checkout</p>
                </div>
             </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-gray-100 dark:border-gray-800">
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">#</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Description</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Unit Price</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Tax (%)</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pr-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {items.map((item, idx) => {
                    const quantity = Number(item.quantity) || 0;
                    const unitPrice = Number(item.unitPrice) || 0;
                    const taxRate = Number(item.taxRate) || 0;
                    const total = (quantity * unitPrice) + ((quantity * unitPrice * taxRate) / 100);
                    
                    return (
                      <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-5 text-sm font-black text-gray-300 dark:text-gray-700 pl-2">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-5">
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Standard Supply</p>
                        </td>
                        <td className="py-5 text-sm font-black text-gray-900 dark:text-white text-center tabular-nums">{quantity}</td>
                        <td className="py-5 text-sm font-bold text-gray-600 dark:text-gray-400 text-right tabular-nums">{formatAmount(unitPrice)}</td>
                        <td className="py-5 text-sm font-bold text-blue-500 text-right tabular-nums">{taxRate}%</td>
                        <td className="py-5 text-base font-black text-gray-900 dark:text-white text-right tabular-nums pr-2">{formatAmount(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start pt-8 border-t-2 border-gray-100 dark:border-gray-800 gap-10">
               <div className="max-w-[300px] space-y-3">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Terms & Notes</p>
                  <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed">
                    {formData.notes || "Goods once sold will not be taken back. E & O.E. Standard business terms apply."}
                  </p>
               </div>

               <div className="w-full md:w-[350px] space-y-4 bg-gray-50 dark:bg-gray-800/30 p-8 rounded-[32px] border-2 border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-gray-900 dark:text-white">{formatAmount(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Sales Tax Total</span>
                    <span className="text-blue-500 font-black">{formatAmount(totals.totalTax)}</span>
                  </div>
                  <div className="pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Grand Total</span>
                    <span className="text-3xl font-black text-emerald-500 tracking-tighter tabular-nums drop-shadow-sm">{formatAmount(totals.total)}</span>
                  </div>
                  
                  {Number(formData.paidAmount) > 0 && (
                    <div className="pt-2 flex justify-between items-center text-[10px] font-black text-orange-500 uppercase tracking-widest">
                      <span>Total Paid</span>
                      <span>-{formatAmount(Number(formData.paidAmount))}</span>
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="pt-12 text-center border-t border-gray-100 dark:border-gray-800">
             <div className="inline-block p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl">
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em]">This is a computer generated invoice</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Re-defining Badge for modularity inside preview
const Badge = ({ children, variant, className = "" }: { children: React.ReactNode; variant: 'success' | 'warning' | 'error' | 'neutral'; className?: string }) => {
  const styles = {
    success: "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/10",
    warning: "bg-orange-500 text-white border-orange-500 shadow-orange-500/10",
    error: "bg-rose-500 text-white border-rose-500 shadow-rose-500/10",
    neutral: "bg-gray-500 text-white border-gray-500 shadow-gray-500/10",
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg border font-black shadow-sm ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default InvoicePreview;
