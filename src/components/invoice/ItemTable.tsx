import React from "react";
import { Trash2, ShoppingBag, Package, Plus } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface ItemTableProps {
  items: any[];
  onAddItem: () => void;
  onEditItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
  formatAmount: (amount: number) => string;
  error?: string;
}

const ItemTable: React.FC<ItemTableProps> = ({
  items,
  onAddItem,
  onEditItem,
  onRemoveItem,
  formatAmount,
  error,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
             <ShoppingBag className="w-4 h-4" />
           </div>
           <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
             Invoice Items 
             <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-400">
               {items.length}
             </span>
           </h2>
        </div>
        <button 
          onClick={(e) => { e.preventDefault(); onAddItem(); }}
          className="flex items-center gap-1.5 text-green-600 font-black uppercase text-[10px] tracking-widest hover:text-green-500 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> 
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div 
          onClick={onAddItem}
          className={`flex flex-col items-center justify-center py-10 rounded-[32px] border-2 border-dashed transition-all cursor-pointer ${
            error ? "border-rose-200 bg-rose-50/10 dark:border-rose-900/30" : "border-gray-100 dark:border-gray-800 hover:border-green-500/30 hover:bg-green-50/10"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
             <Package className="w-7 h-7 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Your cart is empty</p>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">Tap to add products to this bill</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.unitPrice) || 0;
            const taxRate = Number(item.taxRate) || 0;
            const subtotal = quantity * unitPrice;
            const taxAmount = (subtotal * taxRate) / 100;
            const total = subtotal + taxAmount;

            return (
              <Card key={index} className="group rounded-[28px] border-2 border-gray-50 dark:border-gray-800 hover:border-green-500/20 active:scale-[0.98] transition-all overflow-hidden shadow-sm">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEditItem(index)}>
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate mb-1">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
                          <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{quantity} {item.unit || 'Qty'}</span>
                          <span className="text-gray-300">×</span>
                          <span className="text-[10px] font-bold text-gray-500">{formatAmount(unitPrice)}</span>
                       </div>
                       {taxRate > 0 && (
                         <div className="px-2 py-0.5 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-50 dark:border-blue-800/30">
                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Tax {taxRate}%</span>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-black text-gray-900 dark:text-white tracking-tighter shrink-0">
                      {formatAmount(total)}
                    </p>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveItem(index); }}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-500 transition-all active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {error && (
        <p className="text-[10px] font-black text-rose-500 uppercase ml-1 animate-in shake-in duration-300 tracking-widest">
          {error}
        </p>
      )}
    </div>
  );
};

export default ItemTable;
