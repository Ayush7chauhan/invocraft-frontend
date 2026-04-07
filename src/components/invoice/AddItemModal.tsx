import React from "react";
import { X, ShoppingCart } from "lucide-react";
import Button from "../ui/Button";
import { Autocomplete } from "../ui/autocomplete";
import Input from "../ui/Input";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  modalItem: any;
  setModalItem: (item: any) => void;
  onAdd: (andAddAnother: boolean) => void;
  isEditing: boolean;
  formatAmount: (amount: number) => string;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  products,
  modalItem,
  setModalItem,
  onAdd,
  isEditing,
  formatAmount,
}) => {
  if (!isOpen) return null;

  const handleProductSelect = (id: string) => {
    const product = products.find((p) => p.id.toString() === id);
    if (product) {
      setModalItem({
        ...modalItem,
        product_id: product.id,
        product_name: product.name,
        unit_price: product.selling_price,
        tax_rate: product.tax_rate || 0,
      });
    }
  };

  const subtotal = modalItem.quantity * modalItem.unit_price;
  const tax = (subtotal * modalItem.tax_rate) / 100;
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">{isEditing ? "Edit Item" : "Add Item"}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Product Details</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl bg-gray-100 dark:bg-gray-800">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Product Search */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Product</label>
            <Autocomplete
              options={products.map((p) => ({
                value: p.id.toString(),
                label: p.name,
              }))}
              value={modalItem.product_id.toString()}
              onValueChange={handleProductSelect}
              placeholder="Find product..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
              <Input
                type="number"
                value={modalItem.quantity}
                onChange={(e) => setModalItem({ ...modalItem, quantity: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit Price</label>
              <Input
                type="number"
                value={modalItem.unit_price}
                onChange={(e) => setModalItem({ ...modalItem, unit_price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          <div className="p-5 bg-gray-50/50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
             <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
               <span>Subtotal</span>
               <span>{formatAmount(subtotal)}</span>
             </div>
             {modalItem.tax_rate > 0 && (
               <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                 <span>Tax ({modalItem.tax_rate}%)</span>
                 <span>{formatAmount(tax)}</span>
               </div>
             )}
             <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
               <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Total</span>
               <span className="text-xl font-black text-green-500 tracking-tight">{formatAmount(total)}</span>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
          {!isEditing && (
            <Button 
              variant="secondary" 
              className="w-full h-12 rounded-2xl uppercase font-black text-[11px] tracking-widest border-2 border-green-500/20 text-green-600 bg-green-50/30" 
              onClick={() => onAdd(true)}
            >
              Add & Add Another
            </Button>
          )}
          <Button 
            className="w-full h-14 rounded-2xl shadow-xl shadow-green-500/20 uppercase font-black text-sm tracking-widest" 
            onClick={() => onAdd(false)}
            disabled={!modalItem.product_id || modalItem.quantity <= 0}
          >
            {isEditing ? "Update Item" : "Add to Invoice"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
