import { useState } from "react";
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  LogOut, 
  Bell, 
  Palette, 
  CreditCard, 
  History, 
  Lock, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Store, 
  Save,
  Cpu,
  Database,
  Globe,
  Fingerprint
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import { cn } from "../lib/utils";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "shop" | "security">("profile");

  const [formData, setFormData] = useState({
    name: user?.owner_name || "",
    email: user?.email || "",
    shopName: user?.shop_name || "",
    mobile: user?.mobile || "",
    address: user?.address || "",
    gstin: "",
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API persistence delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const navItems = [
    { id: "profile", label: "IDENTITY_NODE", icon: User },
    { id: "shop", label: "BUSINESS_UNIT", icon: Building2 },
    { id: "security", label: "ENCRYPTION_VAULT", icon: ShieldCheck },
  ] as const;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden theme-transition uppercase cursor-default">
      <PageHeader 
        title="System Configuration" 
        subtitle="Operational Preferences & Global Credentials"
        showBack={true} 
        onBackClick={() => navigate("/dashboard")}
        rightAction={
           <Button variant="ghost" size="icon" className="group rounded-md h-9 w-9 hover:bg-rose-50 hover:text-rose-600 transition-colors">
              <LogOut className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
           </Button>
        }
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-12">
        
        {/* Navigation Tabs - High Fidelity */}
        <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-xl border shadow-inner overflow-x-auto hide-scrollbar pointer-events-auto backdrop-blur-sm">
           {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 whitespace-nowrap min-w-[140px] relative group overflow-hidden",
                  activeTab === item.id 
                    ? "bg-background text-foreground shadow-md ring-1 ring-border" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {activeTab === item.id && <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />}
                <item.icon className={cn("h-4 w-4 relative z-10", activeTab === item.id ? "text-primary" : "opacity-40")} />
                <span className="relative z-10">{item.label}</span>
              </button>
           ))}
        </div>

        {/* Dynamic Configuration Panel */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10 relative">
           
           {/* Background Grid Pattern - Architectural Accent */}
           <div className="absolute inset-x-0 top-0 -mt-10 h-64 opacity-[0.03] pointer-events-none select-none z-0 overflow-hidden">
              <div className="w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
           </div>

           {activeTab === "profile" && (
             <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-4 bg-primary rounded-full" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Identity Protocol Documentation</h3>
                </div>
                
                <Card className="border shadow-sm overflow-hidden pointer-events-auto bg-card">
                   <CardContent className="p-8 sm:p-10 space-y-12">
                      <div className="flex flex-col sm:flex-row items-center gap-10">
                         <div className="relative group p-1 rounded-2xl border-2 border-dashed border-muted-foreground/10 hover:border-primary/20 transition-all">
                            <div className="h-28 w-28 rounded-xl bg-muted border flex items-center justify-center text-muted-foreground/30 shadow-inner group-hover:border-primary/20 transition-all overflow-hidden bg-cover bg-center group-hover:scale-[1.02] duration-500" 
                                 style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${formData.name}&background=f8fafc&color=0f172a&bold=true&size=512')` }}>
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer backdrop-blur-[2px]">
                                  <Camera className="h-7 w-7 text-white animate-bounce" />
                                  <span className="text-[8px] font-black text-white uppercase tracking-widest mt-2">UPLO_IMG</span>
                               </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 rounded-lg border-[3px] border-background flex items-center justify-center shadow-xl">
                               <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                         </div>
                         <div className="text-center sm:text-left space-y-2">
                            <h4 className="text-2xl font-black text-foreground tracking-tighter uppercase tracking-[0.05em] leading-none mb-1">{formData.name || "UNNAMED_ENTITY"}</h4>
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground opacity-40">
                               <Fingerprint size={12} />
                               <p className="text-[10px] font-bold uppercase tracking-[0.25em]">{user?.email || "ID#748291-OFFLINE"}</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
                               <Badge variant="success" className="text-[8px] font-black h-5 uppercase tracking-widest px-2.5 bg-emerald-50 text-emerald-600 border-emerald-100 italic">VERIFIED_NODE</Badge>
                               <Badge variant="secondary" className="text-[8px] font-black h-5 uppercase tracking-widest px-2.5 bg-zinc-50 text-zinc-600 border-zinc-100 italic">SUPER_OWNER</Badge>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-muted-foreground/5">
                         <Input label="Primary Registry Name" name="name" value={formData.name} onChange={handleInputChange} leftIcon={<User className="h-4 w-4 text-muted-foreground/40" />} />
                         <Input label="Digital Communication Endpoint" name="email" value={formData.email} onChange={handleInputChange} leftIcon={<Mail className="h-4 w-4 text-muted-foreground/40" />} />
                      </div>
                   </CardContent>
                   <CardFooter className="bg-muted/10 px-10 py-6 border-t flex justify-end">
                      <Button onClick={handleSave} isLoading={saving} className="rounded-md px-12 h-12 font-black text-[11px] uppercase tracking-widest gap-2.5 shadow-xl shadow-primary/10 transition-all hover:translate-y-[-1px]">
                         {savedSuccess ? <><CheckCircle2 className="h-4 w-4" /> PERSISTED</> : <><Save className="h-4 w-4" /> PERSIST CHANGES</>}
                      </Button>
                   </CardFooter>
                </Card>
             </div>
           )}

           {activeTab === "shop" && (
             <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Business Entity Configuration</h3>
                </div>
                
                <Card className="border shadow-sm overflow-hidden pointer-events-auto bg-card">
                   <CardContent className="p-8 sm:p-10 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <Input label="Legal Entity Descriptor (Trade Name)" name="shopName" value={formData.shopName} onChange={handleInputChange} leftIcon={<Store className="h-4 w-4 text-muted-foreground/40" />} />
                         <Input label="Fiscal Settlement Code (GSTIN)" name="gstin" value={formData.gstin} onChange={handleInputChange} placeholder="27XXXXX0000X0Z0" leftIcon={<ShieldCheck className="h-4 w-4 text-muted-foreground/40" />} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t pt-10 border-muted-foreground/5">
                         <Input label="Strategic Network Mobile" name="mobile" value={formData.mobile} onChange={handleInputChange} leftIcon={<Phone className="h-4 w-4 text-muted-foreground/40" />} />
                         <Input label="Registry Hub Node (City)" name="city" value="Mumbai" disabled leftIcon={<MapPin className="h-4 w-4 text-muted-foreground/10" />} />
                      </div>
                      <div className="space-y-1.5 border-t pt-10 border-muted-foreground/5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-60">Physical Operations Headquarters (Address)</label>
                        <textarea 
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Full physical headquarters documentation..."
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm outline-none"
                        />
                      </div>
                   </CardContent>
                   <CardFooter className="bg-muted/10 px-10 py-6 border-t flex justify-end">
                      <Button onClick={handleSave} isLoading={saving} className="rounded-md px-12 h-12 font-black text-[11px] uppercase tracking-widest gap-2.5 shadow-xl shadow-primary/10 transition-all hover:translate-y-[-1px]">
                         {savedSuccess ? <><CheckCircle2 className="h-4 w-4" /> COMMITTED</> : <><Save className="h-4 w-4" /> COMMIT ENTITY</>}
                      </Button>
                   </CardFooter>
                </Card>
             </div>
           )}

           {activeTab === "security" && (
             <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-4 bg-rose-500 rounded-full" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Strategic Security Infrastructure</h3>
                </div>
                
                <div className="grid gap-4 scale-in-95 opacity-0 animate-in fade-in fill-mode-forwards duration-700">
                   {[
                      { icon: Lock, label: "Registry Access Key", desc: "Update primary encryption password", color: "text-zinc-600", bg: "bg-zinc-50" },
                      { icon: CreditCard, label: "Settlement Channels", desc: "Configure UPI and high-value bank nodes", color: "text-emerald-500", bg: "bg-emerald-50" },
                      { icon: Bell, label: "Notification Architecture", desc: "Event logs for high-precision entries", color: "text-blue-500", bg: "bg-blue-50" },
                      { icon: Palette, label: "Interface Core Engine", desc: "Select visual saturation (Light/Dark)", color: "text-amber-500", bg: "bg-amber-50" },
                      { icon: History, label: "Archive Trace Audit", desc: "Full history of recently modified nodes", color: "text-rose-400", bg: "bg-rose-50" },
                   ].map((item, idx) => (
                      <Card key={idx} className="group hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer pointer-events-auto bg-card overflow-hidden">
                        <CardContent className="p-0 flex items-stretch h-20">
                           <div className={cn("w-20 shrink-0 flex items-center justify-center transition-all bg-muted border-r group-hover:bg-primary/5 group-hover:border-primary/20", item.color)}>
                              <item.icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-500" />
                           </div>
                           <div className="flex items-center justify-between px-8 flex-1">
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-foreground uppercase tracking-widest leading-none mb-1.5">{item.label}</span>
                                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-1 opacity-40 group-hover:opacity-100 transition-opacity">{item.desc}</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-20 group-hover:text-primary group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                           </div>
                        </CardContent>
                      </Card>
                   ))}
                </div>
             </div>
           )}

           {/* System Integrity & Build Footnote */}
           <Card className="rounded-xl bg-muted/20 border-dashed border-2 pointer-events-auto mt-20 group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-125 transition-transform duration-[2000ms] text-primary">
                 <Cpu size={160} />
              </div>
              <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-6">
                    <div className="h-14 w-14 bg-card rounded-xl flex items-center justify-center shadow-lg border relative group/icon">
                       <Info className="h-7 w-7 text-muted-foreground/30 group-hover/icon:text-primary transition-colors" />
                       <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                       <p className="text-[12px] font-black text-foreground uppercase tracking-[0.3em] leading-none">INVOCRAFT_ENGINE_V2.4-STABLE</p>
                       <div className="flex items-center justify-center md:justify-start gap-4">
                          <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1.5"><Globe size={10} /> GLOBAL_CLUSTER active</span>
                          <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1.5"><Database size={10} /> DB_SYNC: 99.9%</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-8 border-t md:border-t-0 md:border-l border-muted-foreground/10 pt-8 md:pt-0 md:pl-12 w-full md:w-auto justify-center">
                    <Link to="#" className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-all hover:scale-105">DOC_INDEX</Link>
                    <Link to="#" className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-all hover:scale-105">EULA_AGREEMENT</Link>
                    <Link to="#" className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-all hover:scale-105">NOD_AUDIT</Link>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
