import { useState, useEffect, useMemo } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Tag, 
  Inbox, 
  ArrowUpRight, 
  Filter,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Barcode,
  Hash,
  AlertTriangle,
  FileText,
  Percent,
  CheckCircle2,
  Calendar,
  Layers3,
  Box,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "../lib/validationSchema";
import api from "../utils/api";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { cn } from "../lib/utils";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  category_id: number;
  category_name?: string;
  selling_price: number;
  stock_quantity: number;
  unit: string;
};

export default function AddProduct() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      brand: "",
      categoryId: "" as any,
      sellingPrice: 0,
      purchasePrice: 0,
      discount: 0,
      stockQuantity: 0,
      lowStockAlert: 5,
      unit: "pcs",
      taxRate: 0,
      description: "",
      status: "active",
    }
  });

  const watchStatus = watch("status");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Registry fetch failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Sector fetch failure:", error);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await api.post("/products", data);
      reset();
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error("Registry commit failure:", error);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const stats = useMemo(() => {
    const totalValue = products.reduce((acc, p) => acc + (p.selling_price * p.stock_quantity), 0);
    const lowStock = products.filter(p => p.stock_quantity <= 5).length;
    return { totalValue, lowStock };
  }, [products]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden theme-transition uppercase">
      <PageHeader
        title={showForm ? "Initialize Asset Profile" : "Registry: Assets"}
        subtitle={showForm ? "Configure Commercial Asset Metadata" : "Global Strategic Inventory & Catalogue Hub"}
        showBack={showForm}
        onBackClick={() => setShowForm(false)}
        rightAction={
          !showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="rounded-md h-9 uppercase tracking-widest text-[10px] font-black h-9 shadow-lg shadow-primary/10">
              <Plus className="w-3.5 h-3.5 mr-2" /> REGISTER ASSET
            </Button>
          )
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {!showForm && (
           <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-emerald-200 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-emerald-500">
                    <TrendingUp size={100} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60">Consolidated Valuation</span>
                 <div className="flex items-end justify-between relative z-10">
                    <span className="text-3xl font-black text-emerald-700 tracking-tighter">{formatAmount(stats.totalValue)}</span>
                    <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100 italic">VALUATION_ACTIVE</Badge>
                 </div>
              </Card>
              <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-rose-200 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-rose-500">
                    <AlertTriangle size={100} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 opacity-60">Procurement Priority</span>
                 <div className="flex items-end justify-between relative z-10">
                    <span className="text-3xl font-black text-rose-700 tracking-tighter">{stats.lowStock} NODES</span>
                    <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-rose-50 text-rose-600 border-rose-100 italic">LOW_VOLUME_DETECTED</Badge>
                 </div>
              </Card>
           </section>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-20">
            
            {/* Section 1: Identification */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-4 bg-primary rounded-full transition-all group-hover:h-6" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Principal Identification</h3>
              </div>
              <Card className="border shadow-sm pointer-events-auto bg-card">
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="Registry Descriptor" placeholder="e.g. Premium Cotton Textile" {...register("name")} error={errors.name?.message} leftIcon={<Box className="w-4 h-4" />} />
                    <Input label="Manufacturer Node" placeholder="e.g. NIKE_INDUSTRIES" {...register("brand")} error={errors.brand?.message} leftIcon={<Zap className="w-4 h-4" />} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                    <div className="space-y-1.5 text-left">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-60">Sectoral Node</label>
                       <select 
                         {...register("categoryId")}
                         className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm outline-none"
                       >
                         <option value="">SELECT_HIERARCHY...</option>
                         {categories.map(c => <option key={c.id} value={c.id} className="text-foreground uppercase">{c.name}</option>)}
                       </select>
                       {errors.categoryId?.message && <p className="text-[10px] font-black text-destructive uppercase tracking-widest mt-1.5 ml-1">{(errors.categoryId.message as any)}</p>}
                    </div>
                    <Input label="Unit of Protocol (UoM)" placeholder="PCS, KGS, MTR" {...register("unit")} error={errors.unit?.message} leftIcon={<Layers className="w-4 h-4" />} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section 2: Logistics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Tracking & Logistics Hub</h3>
              </div>
              <Card className="border shadow-sm pointer-events-auto bg-card">
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="SKU Index" placeholder="UID: ARCHIVE_C_001" leftIcon={<Hash className="w-4 h-4" />} {...register("sku")} error={errors.sku?.message} />
                    <Input label="Barcode Identification" placeholder="SCAN_IDENTIFIER" leftIcon={<Barcode className="w-4 h-4" />} {...register("barcode")} error={errors.barcode?.message} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                    <Input label="Current Stock Volume" type="number" leftIcon={<Inbox className="w-4 h-4" />} {...register("stockQuantity")} error={errors.stockQuantity?.message} />
                    <Input label="Interruption Threshold (Low)" type="number" leftIcon={<AlertTriangle className="w-4 h-4" />} {...register("lowStockAlert")} error={errors.lowStockAlert?.message} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section 3: Financials */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Fiscal Calibration</h3>
              </div>
              <Card className="border shadow-sm pointer-events-auto bg-card">
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <Input label="Procurement Valuation" type="number" leftIcon={<RotateCcw className="w-4 h-4" />} {...register("purchasePrice")} error={errors.purchasePrice?.message} />
                    <Input label="Strategic Sale Price" type="number" leftIcon={<TrendingUp className="w-4 h-4" />} {...register("sellingPrice")} error={errors.sellingPrice?.message} />
                    <Input label="Margin Offset (%)" type="number" leftIcon={<Percent className="w-4 h-4" />} {...register("discount")} error={errors.discount?.message} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section 4: Metadata */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-4 bg-zinc-900 rounded-full" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Supplementary Metadata</h3>
              </div>
              <Card className="border shadow-sm pointer-events-auto bg-card overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-60">Registry Life-Cycle Status</label>
                       <div className="flex items-center gap-4">
                          <button 
                            type="button" 
                            onClick={() => setValue('status', 'active')} 
                            className={cn(
                              "flex-1 h-11 rounded-md border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300",
                              watchStatus === 'active' 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm ring-1 ring-emerald-500/20" 
                                : "bg-muted/30 border-input text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                             <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE_FLOW
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setValue('status', 'inactive')} 
                            className={cn(
                               "flex-1 h-11 rounded-md border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300",
                               watchStatus === 'inactive' 
                                 ? "bg-rose-50 text-rose-700 border-rose-100 shadow-sm ring-1 ring-rose-500/20" 
                                 : "bg-muted/30 border-input text-muted-foreground hover:bg-muted/50"
                             )}
                          >
                             ARCHIVED_STATE
                          </button>
                       </div>
                     </div>
                     <Input label="Registry Initialization" type="date" leftIcon={<Calendar className="w-4 h-4" />} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-60">Functional Specifications</label>
                    <textarea 
                      {...register("description")}
                      className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm outline-none"
                      placeholder="Detailed architectural specifications for this asset node..."
                    />
                  </div>
                </CardContent>
                <div className="p-8 bg-muted/10 border-t flex flex-col sm:flex-row gap-4">
                   <Button type="button" variant="outline" className="flex-1 h-12 uppercase font-black tracking-widest text-[11px]" onClick={() => setShowForm(false)}>DISCARD DRAFT</Button>
                   <Button type="submit" isLoading={isSubmitting} className="flex-1 h-12 uppercase font-black tracking-widest text-[11px] shadow-2xl shadow-primary/20">COMMIT ASSET TO REGISTRY</Button>
                </div>
              </Card>
            </div>
            
            <div className="flex items-center justify-center gap-2 opacity-30 pt-4">
               <ShieldCheck size={14} className="text-primary" />
               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">ASSET_NODES_ENCRYPTED: V2.4</span>
            </div>
          </form>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Input 
                 placeholder="Search registry catalogue (Name, SKU, Brand)..." 
                 value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)} 
                 leftIcon={<Search className="w-4 h-4" />}
                 className="h-11 shadow-sm border-muted-foreground/10"
               />
               <Button variant="outline" className="h-11 px-8 rounded-md uppercase font-black tracking-widest text-[10px] w-full sm:w-auto" onClick={() => navigate("/products/categories")}>
                 <Layers3 className="w-4 h-4 mr-2" /> SECTORAL MAPPING
               </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Asset Registry Feed</p>
                    <Badge variant="secondary" className="text-[9px] h-5">{filteredProducts.length} NODES_INDEXED</Badge>
                 </div>
                 <Activity className="w-4 h-4 text-muted-foreground/40" />
              </div>

              {loading ? (
                <div className="grid gap-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-md border" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <EmptyState 
                   title="Registry Static" 
                   description="No asset nodes have been initialized within the commercial catalogue." 
                   icon={<Package className="h-12 w-12 text-muted-foreground/20" />} 
                   actionLabel="INITIALIZE ASSET" 
                   onAction={() => setShowForm(true)} 
                />
              ) : (
                <div className="grid gap-3 animate-in fade-in duration-700">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="group pointer-events-auto hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md bg-card overflow-hidden">
                      <CardContent className="p-0 flex items-stretch justify-between h-20">
                        <div className="flex items-center gap-4 px-4 flex-1 min-w-0">
                          <div className="h-11 w-11 rounded-lg bg-muted border flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all shadow-sm group-hover:scale-105">
                            <Package className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                               <h4 className="font-black text-foreground uppercase tracking-widest text-sm truncate">{product.name}</h4>
                               <Badge variant="outline" className="text-[8px] h-3.5 px-1 font-black uppercase tracking-widest bg-muted/5 opacity-60">UoM: {product.unit}</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 opacity-60">
                               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] leading-none truncate whitespace-nowrap">
                                 {product.category_name || "GENERAL_NODE"}
                               </span>
                               <span className="w-1 h-1 rounded-full bg-border" />
                               <span className={cn(
                                 "text-[9px] font-black uppercase tracking-[0.15em] leading-none",
                                 product.stock_quantity <= 5 ? "text-rose-600" : "text-emerald-600"
                               )}>
                                 {product.stock_quantity} UNITS_AVAIL
                               </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center items-end px-6 bg-muted/5 group-hover:bg-muted/10 transition-colors border-l text-right shrink-0">
                           <p className="text-xl font-black text-foreground tracking-tighter leading-none mb-1.5 group-hover:text-primary transition-colors">
                             {formatAmount(product.selling_price)}
                           </p>
                           <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">VAL_PPU</span>
                             <div className="flex items-center gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white shadow-sm border border-transparent hover:border-border">
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-rose-50 hover:text-rose-600 shadow-sm border border-transparent hover:border-rose-100">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                             </div>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
