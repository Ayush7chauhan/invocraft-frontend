import React from "react";
import { Trash2, ShoppingBag, Package } from "lucide-react";
import Button from "../ui/Button";
import { Card, CardContent } from "../ui/card";

interface ItemTableProps {
  items: any[];
  onAddItem: () => void;
  onEditItem: (item: any) => void;
  onRemoveItem: (id: string) => void;
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
           <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Invoice Items</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onAddItem} className="text-green-600 font-black uppercase text-[10px] tracking-widest">+ Add Item</Button>
      </div>

      {items.length === 0 ? (
        <div 
          onClick={onAddItem}
          className={`flex flex-col items-center justify-center py-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${error ? "border-red-200 bg-red-50/10" : "border-gray-100 dark:border-gray-800 hover:border-green-500/30 hover:bg-green-50/10"}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
             <Package className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Items Added Yet</p>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter mt-1">Tap to add products</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="border-gray-50 dark:border-gray-800 hover:border-green-500/20 active:scale-[0.98] transition-all overflow-hidden group">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEditItem(item)}>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.product_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {item.quantity} Qty × {formatAmount(item.unit_price)}
                    </span>
                    {item.tax_rate > 0 && <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter bg-blue-50/50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-lg border border-blue-50 dark:border-blue-800/30">Tax: {item.tax_rate}%</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-black text-gray-900 dark:text-white shrink-0">
                    {formatAmount(item.total)}
                  </p>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && <p className="text-[10px] font-bold text-red-500 uppercase ml-1">{error}</p>}
    </div>
  );
};

export default ItemTable;
