import { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Search, 
  Trash2, 
  Edit2, 
  Phone, 
  Mail, 
  MapPin, 
  History, 
  ShieldCheck, 
  ChevronRight,
  Plus,
  Filter,
  Layers,
  Activity,
  UserPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "../lib/validationSchema";
import api from "../utils/api";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { cn } from "../lib/utils";

type Contact = {
  id: number;
  name: string;
  mobile: string;
  email: string;
  relationship: string;
  status: string;
};

export default function PersonalContacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema) as any,
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      address: "",
      relationship: "friend",
      status: "active",
      openingBalance: 0,
      notes: ""
    }
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/personal-contacts");
      if (response.data.success) {
        setContacts(response.data.data);
      }
    } catch (error) {
      console.error("Registry fetch failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await api.post("/personal-contacts", data);
      reset();
      setShowForm(false);
      fetchContacts();
    } catch (error) {
      console.error("Registry commit failure:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await api.delete(`/personal-contacts/${deleteId}`);
        setDeleteId(null);
        fetchContacts();
      } catch (error) {
        console.error("Registry nullify failure:", error);
      }
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden theme-transition uppercase">
      <PageHeader
        title={showForm ? "Initialize Entity Record" : "Entity Registry: Personal"}
        subtitle={showForm ? "Configure Personal Counterparty Node" : "Strategic Personal Network & Counterparty Registry"}
        showBack={showForm}
        onBackClick={() => setShowForm(false)}
        rightAction={
          !showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="rounded-md h-9 uppercase tracking-widest text-[10px] font-black h-9 shadow-lg shadow-primary/10">
              <Plus className="w-3.5 h-3.5 mr-2" /> REGISTER ENTITY
            </Button>
          )
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {!showForm && (
           <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-emerald-200 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-emerald-500">
                    <Users size={100} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60">Connected Nodes</span>
                 <div className="flex items-end justify-between relative z-10">
                    <span className="text-3xl font-black text-emerald-700 tracking-tighter">{contacts.length} ENTITIES</span>
                    <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100 italic">NETWORK_ACTIVE</Badge>
                 </div>
              </Card>
              <Card className="border bg-card shadow-sm pointer-events-auto p-6 flex flex-col justify-between h-32 hover:border-zinc-300 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-zinc-500">
                    <History size={100} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 opacity-60">Registry Health</span>
                 <div className="flex items-end justify-between relative z-10">
                    <span className="text-2xl font-black text-zinc-700 tracking-tighter italic opacity-60 uppercase">OPTIMAL_LINK_SPEED</span>
                 </div>
              </Card>
           </section>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-20">
             <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-5 bg-primary rounded-full transition-all group-hover:h-6" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Entity Documentation</h3>
                </div>
                
                <Card className="border shadow-sm pointer-events-auto bg-card">
                   <CardContent className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <Input label="Registry Descriptor" placeholder="e.g. John Doe, Principal" {...register("name")} error={errors.name?.message} leftIcon={<UserPlus className="w-4 h-4" />} />
                         <Input label="Mobile Network Node" placeholder="+91 XXXXX XXXXX" {...register("mobile")} error={errors.mobile?.message} leftIcon={<Phone className="h-4 w-4" />} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                         <Input label="Digital Endpoint (Email)" placeholder="name@enterprise.com" {...register("email")} error={errors.email?.message} leftIcon={<Mail className="h-4 w-4" />} />
                         <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-60">Entity Logic Relationship</label>
                            <select 
                              {...register("relationship")}
                              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary outline-none uppercase"
                            >
                              <option value="friend">FRIEND_PROTOCOL</option>
                              <option value="family">FAMILY_PROTOCOL</option>
                              <option value="colleague">COLLEAGUE_PROTOCOL</option>
                              <option value="neighbor">NEIGHBOR_PROTOCOL</option>
                              <option value="other">OTHER_ENDPOINT</option>
                            </select>
                         </div>
                      </div>
                      <div className="space-y-1.5 border-t pt-8">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-60">Physical Headquarters (Address)</label>
                         <textarea 
                           {...register("address")}
                           placeholder="Full physical headquarters location..."
                           className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm outline-none"
                         />
                      </div>
                   </CardContent>
                   <div className="p-8 bg-muted/10 border-t flex flex-col sm:flex-row gap-4">
                      <Button type="button" variant="outline" className="flex-1 h-12 uppercase font-black tracking-widest text-[11px]" onClick={() => setShowForm(false)}>DISCARD DRAFT</Button>
                      <Button type="submit" isLoading={isSubmitting} className="flex-1 h-12 uppercase font-black tracking-widest text-[11px] shadow-2xl shadow-primary/20">COMMIT ENTITY TO REGISTRY</Button>
                   </div>
                </Card>
             </div>
             
             <div className="flex items-center justify-center gap-2 opacity-30 pt-4">
                <ShieldCheck size={14} className="text-primary" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">ENTITY_NODES_ENCRYPTED: V2.4</span>
             </div>
          </form>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Input 
                 placeholder="Search entity registry (Name, Mobile, Meta)..." 
                 value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)} 
                 leftIcon={<Search className="w-4 h-4" />}
                 className="h-11 shadow-sm border-muted-foreground/10"
               />
               <Button variant="outline" className="h-11 px-8 rounded-md uppercase font-black tracking-widest text-[10px] w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 mr-2" /> RE-CALIBRATE FEED
               </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Personal Registry Feed</p>
                    <Badge variant="secondary" className="text-[9px] h-5">{filteredContacts.length} NODES_ONLINE</Badge>
                 </div>
                 <Activity size={14} className="text-muted-foreground/40" />
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-44 bg-muted/20 animate-pulse rounded-md border" />
                  ))}
                </div>
              ) : filteredContacts.length === 0 ? (
                <EmptyState 
                   title="Registry Static" 
                   description="No personal entity nodes have been initialized within the strategic network." 
                   icon={<Users className="h-12 w-12 text-muted-foreground/20" />} 
                   actionLabel="INITIALIZE NODE" 
                   onAction={() => setShowForm(true)} 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-700">
                  {filteredContacts.map(contact => (
                    <Card key={contact.id} className="group pointer-events-auto hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md bg-card overflow-hidden">
                      <CardContent className="p-6 relative">
                         <div className="flex items-start gap-4 mb-6">
                            <div className="h-14 w-14 rounded-xl bg-muted border flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all overflow-hidden bg-cover bg-center shadow-sm group-hover:scale-105" 
                                 style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${contact.name}&background=f9fafb&color=18181b&bold=true')` }} />
                            <div className="flex flex-col min-w-0 flex-1">
                               <div className="flex items-center gap-2">
                                  <h4 className="font-black text-foreground uppercase tracking-widest text-sm truncate">{contact.name}</h4>
                                  <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:translate-x-1 transition-transform" />
                               </div>
                               <Badge variant="outline" className="text-[8px] font-black h-4 py-0 uppercase tracking-widest bg-muted/5 opacity-60 w-fit mt-1.5 italic">PROTOCOL: {contact.relationship}</Badge>
                            </div>
                            <div className="flex items-center gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
                               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white shadow-sm border border-transparent hover:border-border">
                                 <Edit2 className="h-3 w-3 text-muted-foreground" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-rose-50 hover:text-rose-600 shadow-sm border border-transparent hover:border-rose-100" onClick={() => setDeleteId(contact.id)}>
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                            </div>
                         </div>
                         <div className="grid gap-3 pt-6 border-t border-muted-foreground/5">
                            <div className="flex items-center gap-3 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                               <Phone className="h-3.5 w-3.5 shrink-0" />
                               <span className="text-[10px] font-black tracking-widest uppercase">{contact.mobile || "ENDPOINT_NULL"}</span>
                            </div>
                            {contact.email && (
                              <div className="flex items-center gap-3 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                                 <Mail className="h-3.5 w-3.5 shrink-0" />
                                 <span className="text-[10px] font-black tracking-widest uppercase truncate">{contact.email}</span>
                              </div>
                            )}
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
        title="Nullify Entity Record"
        message="This operation will permanently delete the personal counterparty node from your registry cluster."
      />
    </div>
  );
}
