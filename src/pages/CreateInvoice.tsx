import { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Hash, 
  TrendingUp,
  Calculator,
  Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceFormValues } from "../lib/validationSchema";
import api from "../utils/api";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Autocomplete } from "../components/ui/autocomplete";

type Product = {
  id: number;
  name: string;
  selling_price: number;
  tax_rate: number;
};

type Party = {
  id: number;
  name: string;
};

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      partyId: "" as any,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: new Date().toISOString().split("T")[0],
      items: [{ productId: "" as any, name: "", quantity: 1, unitPrice: 0, taxRate: 0 }],
      notes: "",
      terms: "",
      paymentStatus: "unpaid",
      paidAmount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, partiesRes] = await Promise.all([
        api.get("/products"),
        api.get("/parties"),
      ]);
      setProducts(productsRes.data.data);
      setParties(partiesRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = useMemo(() => {
    return watchItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
  }, [watchItems]);

  const calculateTax = useMemo(() => {
    return watchItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice) * (Number(item.taxRate) / 100)), 0);
  }, [watchItems]);

  const total = calculateSubtotal + calculateTax;

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      await api.post("/bills", data);
      navigate("/bills");
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => String(p.id) === productId);
    if (product) {
       setValue(`items.${index}.name`, product.name);
       setValue(`items.${index}.unitPrice`, product.selling_price);
       setValue(`items.${index}.taxRate`, product.tax_rate);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <PageHeader title="Settlement Protocol" subtitle="Initializing registry node..." />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Calibrating fiscal nodes..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32">
      <PageHeader
        title="Protocol: Settlement"
        subtitle="Generate & Registry Fiscal Transfer"
        showBack={true}
        onBackClick={() => navigate("/bills")}
        rightAction={
          <Button size="sm" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting} className="rounded-md uppercase tracking-widest text-[10px] font-black h-9 shadow-lg shadow-primary/10">
            <Save className="w-3.5 h-3.5 mr-2" /> PUBLISH LEDGER
          </Button>
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        <form onSubmit={handleSubmit(onSubmit)} className="animate-in slide-in-from-bottom-4 duration-500 space-y-12">
          
          {/* Section 1: Entity & Documentation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
               <div className="w-1.5 h-5 bg-primary rounded-full" />
               <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Registry Metadata</h3>
            </div>
            <Card className="border shadow-sm pointer-events-auto bg-card">
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                     <label className="text-sm font-medium leading-none text-muted-foreground ml-0.5">Counterparty Node</label>
                     <Controller
                       name="partyId"
                       control={control}
                       render={({ field }) => (
                         <Autocomplete
                           options={parties.map(p => ({ value: String(p.id), label: p.name }))}
                           value={String(field.value)}
                           onValueChange={(val) => field.onChange(Number(val))}
                           placeholder="Search active counterparty..."
                           className="h-11 shadow-sm"
                         />
                       )}
                     />
                     {errors.partyId?.message && <p className="text-[11px] font-medium text-destructive ml-0.5 mt-1">{(errors.partyId.message as any)}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <Input label="Registry ID (Doc #)" {...register("invoiceNumber")} error={errors.invoiceNumber?.message} leftIcon={<Hash className="w-4 h-4" />} />
                     <Input label="Registry Date" type="date" {...register("invoiceDate")} error={errors.invoiceDate?.message} leftIcon={<Calendar className="w-4 h-4" />} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Items & Records */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Settlement Particulars</h3>
               </div>
               <Badge variant="secondary" className="text-[9px] h-5">{fields.length} Records</Badge>
            </div>
            
            <div className="space-y-4">
               {fields.map((field, index) => (
                 <Card key={field.id} className="border shadow-sm animate-in slide-in-from-left-2 duration-300 pointer-events-auto bg-card">
                   <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                         <div className="md:col-span-5 space-y-1.5">
                            <label className="text-sm font-medium leading-none text-muted-foreground ml-0.5 opacity-60">Asset Selection</label>
                            <Controller
                              name={`items.${index}.productId`}
                              control={control}
                              render={({ field: subField }) => (
                                <Autocomplete
                                  options={products.map(p => ({ value: String(p.id), label: p.name }))}
                                  value={String(subField.value)}
                                  onValueChange={(val) => {
                                    subField.onChange(Number(val));
                                    handleProductSelect(index, val);
                                  }}
                                  placeholder="Scan catalogue entry..."
                                  className="h-10 shadow-sm"
                                />
                              )}
                            />
                         </div>
                         <div className="md:col-span-2">
                            <Input label="Quantity" type="number" {...register(`items.${index}.quantity`)} error={errors.items?.[index]?.quantity?.message} />
                         </div>
                         <div className="md:col-span-2">
                            <Input label="PPU (₹)" type="number" {...register(`items.${index}.unitPrice`)} error={errors.items?.[index]?.unitPrice?.message} />
                         </div>
                         <div className="md:col-span-2">
                            <Input label="Tax (%)" type="number" {...register(`items.${index}.taxRate`)} error={errors.items?.[index]?.taxRate?.message} />
                         </div>
                         <div className="md:col-span-1 flex justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                               <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                      </div>
                   </CardContent>
                 </Card>
               ))}
               <Button
                 type="button"
                 variant="outline"
                 className="w-full border-dashed border-2 py-8 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all group group-hover:border-primary/30"
                 onClick={() => append({ productId: "" as any, name: "", quantity: 1, unitPrice: 0, taxRate: 0 })}
               >
                 <Plus className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">APPEND RECORD BUNDLE</span>
               </Button>
            </div>
          </div>

          {/* Section 3: Consolidation & Analysis */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
             <div className="lg:col-span-3 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-1.5 h-5 bg-zinc-400 rounded-full" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Functional Supplementary</h3>
                    </div>
                    <Card className="border shadow-sm bg-card">
                       <CardContent className="p-8 space-y-6">
                          <Input label="Execution Terms (Optional)" placeholder="Settlement protocols, warranty, etc." {...register("terms")} leftIcon={<History className="w-4 h-4 opacity-40" />} />
                          <div className="space-y-1.5">
                             <label className="text-sm font-medium leading-none text-muted-foreground ml-0.5">Consist / Notes</label>
                             <textarea 
                               {...register("notes")}
                               placeholder="Additional registry metadata..."
                               className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm outline-none"
                             />
                          </div>
                       </CardContent>
                    </Card>
                </div>
             </div>

             <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Fiscal Recapitulation</h3>
                </div>
                <Card className="border shadow-md bg-zinc-900 text-white pointer-events-auto overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                      <TrendingUp size={100} className="text-emerald-500" />
                   </div>
                   <CardContent className="p-8 space-y-6 relative z-10">
                      <div className="space-y-3">
                         <div className="flex items-center justify-between opacity-60">
                            <span className="text-[10px] font-black uppercase tracking-widest">Base Valuation</span>
                            <span className="text-sm font-bold tracking-tight">₹{calculateSubtotal.toLocaleString("en-IN")}</span>
                         </div>
                         <div className="flex items-center justify-between opacity-60">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Registry Tax (GST)</span>
                            <span className="text-sm font-bold tracking-tight">₹{calculateTax.toLocaleString("en-IN")}</span>
                         </div>
                         <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/60">Consolidated Total</span>
                            <span className="text-2xl font-black tracking-tighter text-emerald-400">₹{total.toLocaleString("en-IN")}</span>
                         </div>
                      </div>

                      <div className="space-y-4 pt-4">
                         <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none">Settlement Pathway</label>
                            <select 
                              {...register("paymentStatus")}
                              className="flex h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-all outline-none"
                            >
                               <option value="unpaid" className="text-foreground">UNPAID</option>
                               <option value="partially_paid" className="text-foreground">PARTIAL</option>
                               <option value="paid" className="text-foreground">FULL SETTLEMENT</option>
                            </select>
                         </div>
                         <Input label="Registry Offset (Paid Amount)" type="number" {...register("paidAmount")} className="bg-white/5 border-white/20 text-white" leftIcon={<Calculator className="w-4 h-4 opacity-40" />} />
                      </div>

                      <Button type="submit" isLoading={isSubmitting} className="w-full h-12 bg-white text-primary hover:bg-white/90 border-none rounded-md font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-white/5 gap-3 mt-4">
                         {isSubmitting ? "PUBLISHING..." : <><Save className="w-4 h-4" /> COMMIT LEDGER</>}
                      </Button>
                   </CardContent>
                </Card>
             </div>
          </section>
        </form>
      </div>
    </div>
  );
}
