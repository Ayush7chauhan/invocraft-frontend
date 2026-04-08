import { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Layers, 
  ChevronRight, 
  Layers3,
  History,
  Package,
  Activity,
  ShieldCheck,
  Zap,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryFormValues } from "../lib/validationSchema";
import api from "../utils/api";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { cn } from "../lib/utils";

type Category = {
  id: number;
  name: string;
  product_count?: number;
};

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: { name: "" }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Sector fetch failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await api.post("/categories", data);
      reset();
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error("Sector commit failure:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await api.delete(`/categories/${deleteId}`);
        setDeleteId(null);
        fetchCategories();
      } catch (error) {
        console.error("Sector nullify failure:", error);
      }
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden theme-transition uppercase cursor-default">
      <PageHeader
        title={showForm ? "Initialize Sector Node" : "Registry: Sectoral Classifications"}
        subtitle={showForm ? "Configure Hierarchy Metadata" : "Global Strategic Hierarchy & Sectoral Mapping Hub"}
        showBack={showForm}
        onBackClick={() => setShowForm(false)}
        rightAction={
          !showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="rounded-md h-9 uppercase tracking-widest text-[10px] font-black h-9 shadow-lg shadow-primary/10">
              <Plus className="w-3.5 h-3.5 mr-2" /> NEW CLASSIFICATION
            </Button>
          )
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-12">
        {!showForm && (
           <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-emerald-200 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-emerald-500">
                    <Layers3 size={100} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60">Catalogue Sectors</span>
                 <div className="flex items-end justify-between relative z-10">
                    <span className="text-3xl font-black text-emerald-700 tracking-tighter">{categories.length} NODES</span>
                    <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100 italic">MAP_ACTIVE</Badge>
                 </div>
              </Card>
              <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-blue-200 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-blue-500">
                    <Target size={100} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-60">Mapping Density</span>
                 <div className="flex items-end justify-between relative z-10">
                    <span className="text-2xl font-black text-blue-700 tracking-tighter uppercase italic opacity-60">OPTIMAL_LINKAGE</span>
                 </div>
              </Card>
           </section>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-20">
             <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-5 bg-primary rounded-full transition-all group-hover:h-6" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Hierarchy Documentation</h3>
                </div>
                
                <Card className="border shadow-sm pointer-events-auto bg-card">
                   <CardContent className="p-8 space-y-10">
                      <Input 
                        label="Classification Descriptor" 
                        placeholder="e.g. RAW_MATERIALS, FINISHED_ASSETS" 
                        {...register("name")} 
                        error={errors.name?.message} 
                        leftIcon={<Layers className="w-4 h-4" />} 
                      />
                      <div className="space-y-2 border-t pt-10 border-muted-foreground/5">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-60">System Attributes (Read-only)</label>
                         <div className="flex flex-wrap gap-4">
                            <Badge variant="outline" className="h-11 px-6 text-[9px] font-black uppercase tracking-widest bg-muted/10 opacity-40 border-dashed">NODE_TYPE: SECTOR_A</Badge>
                            <Badge variant="outline" className="h-11 px-6 text-[9px] font-black uppercase tracking-widest bg-muted/10 opacity-40 border-dashed">VISIBILITY: TOTAL_CLUSTER</Badge>
                            <Badge variant="outline" className="h-11 px-6 text-[9px] font-black uppercase tracking-widest bg-muted/10 opacity-40 border-dashed">SYNC_PROTOCOL: V2.4</Badge>
                         </div>
                      </div>
                   </CardContent>
                   <div className="p-8 bg-muted/10 border-t flex flex-col sm:flex-row gap-4">
                      <Button type="button" variant="outline" className="flex-1 h-12 uppercase font-black tracking-widest text-[11px]" onClick={() => setShowForm(false)}>DISCARD DRAFT</Button>
                      <Button type="submit" isLoading={isSubmitting} className="flex-1 h-12 uppercase font-black tracking-widest text-[11px] shadow-2xl shadow-primary/20">COMMIT CLASSIFICATION</Button>
                   </div>
                </Card>
             </div>
             
             <div className="flex items-center justify-center gap-2 opacity-30 pt-4">
                <ShieldCheck size={14} className="text-primary" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">SECTOR_NODES_ENCRYPTED: V2.4</span>
             </div>
          </form>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Input 
                 placeholder="Search sectoral hierarchy..." 
                 value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)} 
                 leftIcon={<Search className="w-4 h-4" />}
                 className="h-11 shadow-sm border-muted-foreground/10"
               />
               <Button variant="outline" className="h-11 px-8 rounded-md uppercase font-black tracking-widest text-[10px] w-full sm:w-auto" onClick={() => navigate("/products/new")}>
                 <Package className="w-3.5 h-3.5 mr-2" /> ASSET Hub
               </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Registry Feed</p>
                    <Badge variant="secondary" className="text-[9px] h-5">{filteredCategories.length} NODES_ONLINE</Badge>
                 </div>
                 <Activity size={14} className="text-muted-foreground/40" />
              </div>

              {loading ? (
                <div className="grid gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-md border" />
                  ))}
                </div>
              ) : filteredCategories.length === 0 ? (
                <EmptyState 
                   title="Registry Static" 
                   description="No sectoral hierarchy nodes have been initialized within the commercial catalogue." 
                   icon={<Layers3 className="h-12 w-12 text-muted-foreground/20" />} 
                   actionLabel="INITIALIZE NODE" 
                   onAction={() => setShowForm(true)} 
                />
              ) : (
                <div className="grid gap-3 animate-in fade-in duration-700">
                  {filteredCategories.map(category => (
                    <Card key={category.id} className="group pointer-events-auto hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md bg-card overflow-hidden">
                      <CardContent className="p-0 flex items-stretch justify-between h-20">
                        <div className="flex items-center gap-4 px-4 flex-1 min-w-0">
                          <div className="h-11 w-11 rounded-lg bg-muted border flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all shadow-sm group-hover:scale-105">
                            <Plus className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                               <h4 className="font-black text-foreground uppercase tracking-widest text-sm truncate">{category.name}</h4>
                               <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] leading-none mt-1 opacity-60">REG_NODE: #{241 + category.id}0</span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center items-end px-6 bg-muted/5 group-hover:bg-muted/10 transition-colors border-l text-right shrink-0">
                           <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">MAPPED_ASSETS</span>
                              <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-white/50 border-muted-foreground/10 group-hover:border-primary/20 transition-colors">08 UNITS</Badge>
                           </div>
                           <div className="flex items-center gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white shadow-sm border border-transparent hover:border-border">
                                <Edit2 className="h-3 w-3 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-rose-50 hover:text-rose-600 shadow-sm border border-transparent hover:border-rose-100" onClick={() => setDeleteId(category.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
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

      <DeleteConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title="Nullify Classification"
        message="This will permanently delete the sectoral mapping node. Assets mapped to this hierarchy may be orphaned in the registry."
      />
    </div>
  );
}
