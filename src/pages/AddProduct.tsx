import { useState, useEffect } from "react";
import { ArrowLeft, Package, Search, DollarSign, AlertTriangle, CheckCircle2, X, Loader2, Edit2, Trash2, Plus } from "lucide-react";
import api from "../utils/api";

type Product = {
  id: number;
  name: string;
  category: string | null;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  tax_rate: number;
};

type AddProductProps = {
  onBack: () => void;
  initialShowLowStock?: boolean;
  initialShowForm?: boolean;
};

type ApiCategory = { id: number; name: string };

export default function AddProduct({ onBack, initialShowLowStock, initialShowForm = false }: AddProductProps) {
  const [showForm, setShowForm] = useState(!!initialShowForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showLowStock, setShowLowStock] = useState(!!initialShowLowStock);
  const [showConfirmProduct, setShowConfirmProduct] = useState(false);

  // categorySelect: "other" = use custom name from formData.category; else use selected category name
  const [categorySelect, setCategorySelect] = useState<string>("other");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    purchase_price: "",
    selling_price: "",
    stock_quantity: "",
    low_stock_threshold: "10",
    tax_rate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response.data.success) {
        setApiCategories(response.data.data);
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResolvedCategory = () => {
    if (categorySelect === "other") return formData.category.trim() || null;
    return categorySelect ? categorySelect : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (formData.purchase_price && isNaN(parseFloat(formData.purchase_price))) {
      newErrors.purchase_price = "Invalid price";
    }
    if (formData.selling_price && isNaN(parseFloat(formData.selling_price))) {
      newErrors.selling_price = "Invalid price";
    }
    if (formData.stock_quantity && (isNaN(parseInt(formData.stock_quantity)) || parseInt(formData.stock_quantity) < 0)) {
      newErrors.stock_quantity = "Invalid quantity";
    }
    if (formData.tax_rate && (isNaN(parseFloat(formData.tax_rate)) || parseFloat(formData.tax_rate) < 0 || parseFloat(formData.tax_rate) > 100)) {
      newErrors.tax_rate = "Tax rate must be between 0-100";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setShowConfirmProduct(true);
  };

  const confirmSubmitProduct = async () => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const payload = {
        name: formData.name.trim(),
        category: getResolvedCategory(),
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : 0,
        selling_price: formData.selling_price ? parseFloat(formData.selling_price) : 0,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
        low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : 10,
        tax_rate: formData.tax_rate ? parseFloat(formData.tax_rate) : 0,
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowConfirmProduct(false);
      resetForm();
      fetchProducts();
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setErrors({
        submit: err.response?.data?.message || "Failed to save product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      purchase_price: "",
      selling_price: "",
      stock_quantity: "",
      low_stock_threshold: "10",
      tax_rate: "",
    });
    setCategorySelect("other");
    setErrors({});
    setShowForm(false);
    setShowConfirmProduct(false);
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category || "",
      purchase_price: product.purchase_price.toString(),
      selling_price: product.selling_price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      tax_rate: product.tax_rate.toString(),
    });
    const inList = apiCategories.some((c) => c.name === product.category);
    setCategorySelect(product.category && inList ? product.category : "other");
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const categories = Array.from(
    new Set([
      ...apiCategories.map((c) => c.name),
      ...products.map((p) => p.category).filter(Boolean),
    ])
  ) as string[];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || product.category === filterCategory || (!product.category && filterCategory === "uncategorized");
    const matchesLowStock = !showLowStock || product.stock_quantity <= product.low_stock_threshold;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827] dark:text-white" />
        </button>
        <h1 className="text-lg font-bold text-[#111827] dark:text-white flex-1">
          {showForm ? (editingId ? "Edit Product" : "Add Product") : "Products"}
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-9 h-9 rounded-xl bg-[#22C55E] dark:bg-green-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
        {showForm && (
          <button
            onClick={resetForm}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showForm ? (
        /* Add/Edit Form */
        <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Name */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="Enter product name"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                    : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
                } text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Category: use existing categories + Other (default) */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Category
              </label>
              <select
                value={categorySelect}
                onChange={(e) => setCategorySelect(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              >
                <option value="other">Other (type below)</option>
                {apiCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categorySelect === "other" && (
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Electronics, Grocery"
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
                />
              )}
            </div>

            {/* Purchase Price & Selling Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                  Purchase Price
                </label>
                <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                  <DollarSign className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.purchase_price}
                    onChange={(e) => {
                      setFormData({ ...formData, purchase_price: e.target.value.replace(/[^0-9.]/g, "") });
                      if (errors.purchase_price) setErrors({ ...errors, purchase_price: "" });
                    }}
                    placeholder="0.00"
                    className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                {errors.purchase_price && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.purchase_price}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                  Selling Price
                </label>
                <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                  <DollarSign className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.selling_price}
                    onChange={(e) => {
                      setFormData({ ...formData, selling_price: e.target.value.replace(/[^0-9.]/g, "") });
                      if (errors.selling_price) setErrors({ ...errors, selling_price: "" });
                    }}
                    placeholder="0.00"
                    className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                {errors.selling_price && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.selling_price}</p>
                )}
              </div>
            </div>

            {/* Stock Quantity & Low Stock Threshold */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                  Stock Quantity
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.stock_quantity}
                  onChange={(e) => {
                    setFormData({ ...formData, stock_quantity: e.target.value.replace(/[^0-9]/g, "") });
                    if (errors.stock_quantity) setErrors({ ...errors, stock_quantity: "" });
                  }}
                  placeholder="0"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.stock_quantity
                      ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                      : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
                  } text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500`}
                />
                {errors.stock_quantity && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.stock_quantity}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                  Low Stock Alert
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value.replace(/[^0-9]/g, "") })}
                  placeholder="10"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
                />
              </div>
            </div>

            {/* Tax Rate */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Tax/GST Rate (%)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={formData.tax_rate}
                onChange={(e) => {
                  setFormData({ ...formData, tax_rate: e.target.value.replace(/[^0-9.]/g, "") });
                  if (errors.tax_rate) setErrors({ ...errors, tax_rate: "" });
                }}
                placeholder="0.00"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.tax_rate
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                    : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
                } text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500`}
              />
              {errors.tax_rate && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.tax_rate}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                isSubmitting
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-[#22C55E] dark:bg-green-600 text-white hover:bg-[#16A34A] dark:hover:bg-green-700 shadow-lg hover:shadow-xl active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {editingId ? "Update Product" : "Add Product"}
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Product List */
        <div className="flex-1 flex flex-col">
          {/* Search and Filter */}
          <div className="px-4 py-4 space-y-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar flex-1">
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    filterCategory === "all"
                      ? "bg-[#22C55E] dark:bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      filterCategory === cat
                        ? "bg-[#22C55E] dark:bg-green-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowLowStock(!showLowStock)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  showLowStock
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                    : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] dark:text-green-400" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No products found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add your first product to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-[#111827] dark:text-white truncate">
                            {product.name}
                          </h3>
                          {product.stock_quantity <= product.low_stock_threshold && (
                            <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </span>
                          )}
                        </div>
                        {product.category && (
                          <p className="text-xs text-[#6B7280] dark:text-gray-400 mb-2">{product.category}</p>
                        )}
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div>
                            <p className="text-xs text-[#6B7280] dark:text-gray-400">Purchase</p>
                            <p className="text-sm font-semibold text-[#111827] dark:text-white">{formatAmount(product.purchase_price)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7280] dark:text-gray-400">Selling</p>
                            <p className="text-sm font-semibold text-[#16A34A] dark:text-green-400">{formatAmount(product.selling_price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E5E7EB] dark:border-gray-700">
                          <div>
                            <p className="text-xs text-[#6B7280] dark:text-gray-400">Stock</p>
                            <p className={`text-sm font-bold ${
                              product.stock_quantity <= product.low_stock_threshold
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-[#111827] dark:text-white"
                            }`}>
                              {product.stock_quantity} units
                            </p>
                          </div>
                          {product.tax_rate > 0 && (
                            <div>
                              <p className="text-xs text-[#6B7280] dark:text-gray-400">Tax</p>
                              <p className="text-sm font-semibold text-[#111827] dark:text-white">{product.tax_rate}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={() => handleEdit(product)}
                          className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm product save popup */}
      {showConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !isSubmitting && setShowConfirmProduct(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-3">
              {editingId ? "Confirm update" : "Confirm product"}
            </h3>
            <div className="text-sm text-[#6B7280] dark:text-gray-400 space-y-2 mb-4">
              <p><span className="font-medium text-[#111827] dark:text-white">Name:</span> {formData.name.trim()}</p>
              <p><span className="font-medium text-[#111827] dark:text-white">Category:</span> {getResolvedCategory() || "—"}</p>
              <p><span className="font-medium text-[#111827] dark:text-white">Selling price:</span> ₹{formData.selling_price || "0"}</p>
              <p><span className="font-medium text-[#111827] dark:text-white">Stock:</span> {formData.stock_quantity || "0"}</p>
            </div>
            {errors.submit && <p className="text-xs text-red-600 dark:text-red-400 mb-3">{errors.submit}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => !isSubmitting && setShowConfirmProduct(false)}
                className="flex-1 py-2.5 rounded-xl font-medium border border-[#E5E7EB] dark:border-gray-700 text-[#111827] dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSubmitProduct}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl font-medium bg-[#22C55E] dark:bg-green-600 text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


