import React from "react";
import { X, ShoppingBag, Package } from "lucide-react";
import { Autocomplete } from "../ui/autocomplete";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  modalItem: any;
  setModalItem: (item: any) => void;
  onAdd: (addAnother: boolean) => void;
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

  const selectedProduct = products.find((p) => p.id.toString() === modalItem.product_id?.toString());

  const quantity = Number(modalItem.quantity) || 0;
  const unitPrice = Number(modalItem.unit_price) || 0;
  const taxRate = Number(modalItem.tax_rate) || 0;
  
  const subtotal = quantity * unitPrice;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleProductChange = (val: string) => {
    const product = products.find((p) => p.id.toString() === val);
    if (product) {
      setModalItem({
        ...modalItem,
        product_id: product.id,
        product_name: product.name,
        unit_price: product.selling_price,
        tax_rate: product.tax_rate,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {isEditing ? "Edit Item" : "Add New Item"}
                </h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {isEditing ? "Modify item details" : "Add product to your bill"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Product</label>
              <Autocomplete
                options={products.map((p) => ({ value: p.id.toString(), label: `${p.name} (Stock: ${p.stock_quantity})` }))}
                value={modalItem.product_id?.toString() || ""}
                onValueChange={handleProductChange}
                placeholder="Start typing product name..."
                className="rounded-[24px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="number"
                value={modalItem.quantity}
                onChange={(e) => setModalItem({ ...modalItem, quantity: e.target.value })}
                placeholder="0"
                min="1"
              />
              <Input
                label="Unit Price"
                type="number"
                value={modalItem.unit_price}
                onChange={(e) => setModalItem({ ...modalItem, unit_price: e.target.value })}
                placeholder="0.00"
                leftIcon={<span className="text-xs font-bold text-gray-400">₹</span>}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tax Rate (%)"
                type="number"
                value={modalItem.tax_rate}
                onChange={(e) => setModalItem({ ...modalItem, tax_rate: e.target.value })}
                placeholder="0"
                max="100"
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Total</label>
                <div className="h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-100 dark:border-gray-800 flex items-center px-4 font-black text-green-600 dark:text-green-500 text-base">
                  {formatAmount(total)}
                </div>
              </div>
            </div>

            {selectedProduct && (
               <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-50/50 dark:border-blue-900/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Package className="w-5 h-5 text-blue-500" />
                  <p className="text-[10px] font-bold text-blue-600/80 dark:text-blue-400 uppercase tracking-widest">
                    Available Stock: <span className="font-black text-blue-600 dark:text-blue-300">{selectedProduct.stock_quantity}</span>
                  </p>
               </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {!isEditing && (
              <Button 
                variant="secondary" 
                className="flex-1 h-16 rounded-[28px] font-black uppercase text-[11px] tracking-widest bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-2 border-gray-100 dark:border-gray-800"
                onClick={() => onAdd(true)}
              >
                SAVE & ANOTHER
              </Button>
            )}
            <Button 
              className={`flex-1 h-16 rounded-[28px] font-black uppercase text-sm tracking-widest shadow-xl ${isEditing ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'}`}
              onClick={() => onAdd(false)}
            >
              {isEditing ? "Update Item" : "Add to Bill"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
