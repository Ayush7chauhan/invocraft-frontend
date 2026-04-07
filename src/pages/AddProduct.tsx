import React, { useState, useMemo } from "react";
import {
  Package,
  Search,
  ShoppingCart,
  Banknote,
  Boxes,
  Plus,
  Edit2,
  Trash2,
  Tag,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../hooks/useProducts";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import type { Product } from "../types/api";

export default function AddProduct() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    selling_price: "",
    purchase_price: "",
    stock_quantity: "",
    tax_rate: "0",
    unit: "PCS"
  });

  const { data: products = [], isLoading } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: Record<string, string> = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) newErrors.name = "Product name is required.";

    const sellPrice = parseFloat(formData.selling_price);
    if (!formData.selling_price || isNaN(sellPrice) || sellPrice < 0) {
      newErrors.selling_price = "Selling price must be a valid positive number.";
    }

    const buyPrice = parseFloat(formData.purchase_price);
    if (formData.purchase_price && (isNaN(buyPrice) || buyPrice < 0)) {
      newErrors.purchase_price = "Purchase price must be a valid positive number.";
    }

    const stock = Number(formData.stock_quantity);
    if (formData.stock_quantity && (isNaN(stock) || !Number.isInteger(stock) || stock < 0)) {
      newErrors.stock_quantity = "Stock quantity must be a whole positive number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      name: trimmedName,
      selling_price: sellPrice || 0,
      purchase_price: buyPrice || 0,
      stock_quantity: stock || 0,
      tax_rate: parseFloat(formData.tax_rate) || 0,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      resetForm();
    } catch (error: any) {
      console.error("Failed to save product:", error);
      setErrors({ submit: error.response?.data?.message || "Failed to save data to server." });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      selling_price: "",
      purchase_price: "",
      stock_quantity: "",
      tax_rate: "0",
      unit: "PCS"
    });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category || "",
      selling_price: product.selling_price.toString(),
      purchase_price: (product as any).purchase_price?.toString() || "",
      stock_quantity: product.stock_quantity.toString(),
      tax_rate: product.tax_rate.toString(),
      unit: product.unit || "PCS",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const formatAmount = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

  return (
    <PageContainer>
      <PageHeader
        title={showForm ? (editingId ? "Edit Product" : "New Item") : "Inventory Management"}
        showBack={true}
        onBackClick={showForm ? resetForm : () => navigate(-1)}
        rightAction={
          !showForm && (
            <Button size="icon" onClick={() => setShowForm(true)} className="rounded-xl shadow-lg shadow-green-500/20">
              <Plus className="w-5 h-5" />
            </Button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 pb-32 custom-scrollbar">
        {showForm ? (
          <form id="product-form" onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border-2 border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Identity *</label>
                <div className="relative">
                   <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                   <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Product / Service Name" className="pl-12 h-14" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sell Price *</label>
                  <div className="relative">
                    <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    <Input value={formData.selling_price} onChange={(e) => setFormData({...formData, selling_price: e.target.value})} placeholder="0.00" className="pl-12 h-14" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Buy Price</label>
                  <div className="relative">
                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={formData.purchase_price} onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} placeholder="0.00" className="pl-12 h-14" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Hardware" className="h-14" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Stock</label>
                  <div className="relative">
                    <Boxes className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    <Input value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} placeholder="Qty" className="pl-12 h-14" />
                  </div>
                </div>
              </div>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please fix the following errors:</span>
                </div>
                <ul className="text-xs text-rose-600 dark:text-rose-400 font-medium list-disc pl-5">
                  {Object.values(errors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4">
               <Button 
                type="submit" 
                isLoading={createMutation.isPending || updateMutation.isPending} 
                className="w-full h-18 rounded-[32px] shadow-2xl shadow-green-500/25 font-black uppercase text-sm tracking-[0.2em] py-6"
               >
                 {editingId ? "COMMIT CHANGES" : "ADD TO CATALOG"}
               </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="FIND ITEM OR CATEGORY..." 
                className="pl-14 h-16 rounded-[32px] bg-gray-50 border-none shadow-inner text-sm font-bold uppercase tracking-widest" 
              />
            </div>

            {isLoading ? (
               <div className="grid gap-6">
                 {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-50 dark:bg-gray-800/50 animate-pulse rounded-[40px]" />)}
               </div>
            ) : filteredProducts.length === 0 ? (
               <div className="py-24 text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                    <Package className="w-12 h-12 text-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Vault is empty</p>
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Add your first product to start billing</p>
                  </div>
                  <Button onClick={() => setShowForm(true)} variant="secondary" className="rounded-2xl px-10 h-14 border-2 border-dashed font-black uppercase text-[10px] tracking-widest">Add New Item</Button>
               </div>
            ) : (
              <div className="grid gap-6">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="group rounded-[40px] border-2 border-gray-50 dark:border-gray-800/50 hover:border-green-500/20 hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-800 overflow-hidden">
                    <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-8">
                      <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-400 font-black text-2xl group-hover:bg-green-500/10 group-hover:text-green-500 transition-all duration-500 group-hover:rotate-12">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-center sm:text-left min-w-0 space-y-3">
                        <div>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
                             <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{product.name}</h3>
                             {product.category && (
                               <Badge variant="primary" className="text-[10px] px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 rounded-full font-black uppercase tracking-widest shadow-sm">
                                  {product.category}
                               </Badge>
                             )}
                          </div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{product.unit || "PCS"} UNIT</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8 pt-2">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rate</p>
                              <p className="text-xl font-black text-green-500 tracking-tight">{formatAmount(product.selling_price)}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">In Stock</p>
                              <div className="flex items-center gap-2">
                                <p className={`text-xl font-black tracking-tight ${product.stock_quantity < 10 ? "text-rose-500 animate-pulse" : "text-gray-900 dark:text-white"}`}>{product.stock_quantity}</p>
                                {product.stock_quantity < 10 && <Badge variant="danger" className="text-[8px] px-1.5 py-0 font-black">LOW</Badge>}
                              </div>
                           </div>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => handleEdit(product)} className="w-12 h-12 rounded-[20px] bg-gray-50 dark:bg-gray-700/50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 flex items-center justify-center active:scale-90">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setDeletingProduct(product); setDeleteModalOpen(true); }} className="w-12 h-12 rounded-[20px] bg-gray-50 dark:bg-gray-700/50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 flex items-center justify-center active:scale-90">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingProduct(null); }}
        onConfirm={() => deletingProduct && deleteMutation.mutate(deletingProduct.id, { onSettled: () => setDeleteModalOpen(false) })}
        title="Remove Item?"
        message={`Are you sure you want to remove ${deletingProduct?.name} from your catalog? This will affect historical billing records associated with this item.`}
        itemName={deletingProduct?.name || ""}
      />
    </PageContainer>
  );
}
