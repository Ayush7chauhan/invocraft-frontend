import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Store,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Apple,
  Stethoscope,
  Store as StoreIcon,
  MoreHorizontal,
  ArrowRight,
  ShieldCheck,
  Building2,
  LayoutDashboard,
  Save,
  Rocket
} from "lucide-react";
import axios from "axios";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { cn } from "../lib/utils";

type BusinessType = "grocery" | "medical" | "general" | "other";

type TempUser = {
  id?: number | string;
};

type UpdateShopPayload = {
  user_id: number;
  owner_name: string;
  is_registration_complete: boolean;
  shop_name?: string;
  shop_address?: string;
  business_type?: BusinessType;
};

export default function SetupShop() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const mobile = localStorage.getItem("temp_mobile") || "IDENTIFIER_NULL";

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const successTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setIsFormValid(
      ownerName.trim().length >= 2 &&
        (!shopAddress.trim() || shopAddress.trim().length >= 10),
    );
  }, [ownerName, shopAddress]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setErrors({});

    try {
      let tempUser: TempUser = {};
      try {
        tempUser = JSON.parse(localStorage.getItem("temp_user") || "{}");
      } catch {
        tempUser = {};
      }

      const userId = Number(tempUser.id);
      if (!userId || Number.isNaN(userId)) {
        setErrors({ submit: "Session expired. Please re-authenticate." });
        return;
      }

      const payload: UpdateShopPayload = {
        user_id: userId,
        owner_name: ownerName.trim(),
        is_registration_complete: true,
      };

      if (shopName.trim()) payload.shop_name = shopName.trim();
      if (shopAddress.trim()) payload.shop_address = shopAddress.trim();
      if (businessType) payload.business_type = businessType;

      const response = await api.post("/update-shop-details", payload);

      if (response.data?.success) {
        setIsSuccess(true);
        const userData = {
          ...response.data.data.user,
          token: response.data.data.token,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("auth_token", response.data.data.token);
        localStorage.removeItem("temp_user");
        localStorage.removeItem("temp_mobile");

        updateUser(response.data.data.user);

        successTimeoutRef.current = window.setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setErrors({ submit: response.data?.message || "Registry persistence failed" });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrors({ submit: error.response?.data?.message || "Onboarding protocol interupted." });
      } else {
        setErrors({ submit: "System configuration failure." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatMobile = (mob: string) => {
    const clean = mob.replace(/\D/g, "");
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return mob;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase tracking-[0.05em]">Protocol Synchronized</h2>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-none">Redirecting to strategic dashboard node...</p>
          </div>
          <div className="pt-4">
             <LoadingSpinner size="md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-32 overflow-x-hidden theme-transition">
       <PageHeader 
        title="Strategic Configuration" 
        subtitle="Business Onboarding & Entity Initialization" 
       />

       <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full space-y-12">
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
             
             {/* Section 1: Identity */}
             <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Principal Identification</h3>
                </div>

                <Card className="border shadow-sm bg-card pointer-events-auto">
                   <CardContent className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <Input 
                            label="Legal Principal Name" 
                            placeholder="Full Name" 
                            value={ownerName} 
                            onChange={(e) => {
                              setOwnerName(e.target.value);
                              setErrors(p => ({...p, ownerName: ""}));
                            }} 
                            error={errors.ownerName}
                            leftIcon={<User className="h-4 w-4" />}
                         />
                         <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-0.5 opacity-60">Verified Mobile Node</label>
                            <div className="flex items-center gap-3 border border-input rounded-md px-4 h-10 bg-muted/20 opacity-80">
                               <Phone className="w-3.5 h-3.5 text-muted-foreground/50" />
                               <span className="text-[11px] font-black tracking-widest uppercase text-foreground">
                                 {formatMobile(mobile)}
                               </span>
                               <Badge variant="success" className="h-4 px-2 text-[8px] font-black ml-auto">AUTHENTICATED</Badge>
                            </div>
                         </div>
                      </div>
                   </CardContent>
                </Card>
             </div>

             {/* Section 2: Enterprise Details */}
             <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Entity Documentation</h3>
                </div>

                <Card className="border shadow-sm bg-card pointer-events-auto">
                   <CardContent className="p-8 space-y-8">
                      <Input 
                         label="Entity Trade Name (Optional)" 
                         placeholder="Business or Shop Name" 
                         value={shopName} 
                         onChange={(e) => setShopName(e.target.value)} 
                         leftIcon={<Building2 className="h-4 w-4" />}
                      />
                      
                      <div className="space-y-1.5">
                         <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-0.5 opacity-60">Physical Headquarters (Address)</label>
                         <div className="relative group">
                            <textarea 
                               placeholder="Complete functional location..." 
                               value={shopAddress} 
                               onChange={(e) => {
                                 setShopAddress(e.target.value);
                                 setErrors(p => ({...p, shopAddress: ""}));
                               }}
                               className={cn(
                                 "flex min-h-[100px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm outline-none pl-10",
                                 errors.shopAddress && "border-destructive focus-visible:ring-destructive"
                               )}
                            />
                            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/40 group-focus-within:text-emerald-500 transition-colors" />
                         </div>
                         {errors.shopAddress && <p className="text-[10px] font-black text-destructive uppercase tracking-widest mt-1.5 ml-1">{errors.shopAddress}</p>}
                      </div>
                   </CardContent>
                </Card>
             </div>

             {/* Section 3: Industry Classification */}
             <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-5 bg-zinc-900 rounded-full" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Industrial sector mapping</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   <TypeButton 
                      label="Retail" 
                      icon={<Apple className="h-4 w-4" />} 
                      selected={businessType === "grocery"} 
                      onClick={() => setBusinessType("grocery")} 
                   />
                   <TypeButton 
                      label="Pharma" 
                      icon={<Stethoscope className="h-4 w-4" />} 
                      selected={businessType === "medical"} 
                      onClick={() => setBusinessType("medical")} 
                   />
                   <TypeButton 
                      label="General" 
                      icon={<StoreIcon className="h-4 w-4" />} 
                      selected={businessType === "general"} 
                      onClick={() => setBusinessType("general")} 
                   />
                   <TypeButton 
                      label="Protocol_X" 
                      icon={<MoreHorizontal className="h-4 w-4" />} 
                      selected={businessType === "other"} 
                      onClick={() => setBusinessType("other")} 
                   />
                </div>
             </div>

             {errors.submit && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center animate-pulse">
                   <p className="text-[10px] font-black text-destructive uppercase tracking-widest">{errors.submit}</p>
                </div>
             )}

             <div className="pt-8 border-t flex flex-col items-center gap-6">
                <Button 
                   onClick={handleSubmit} 
                   disabled={!isFormValid || isLoading} 
                   isLoading={isLoading}
                   className="w-full h-14 rounded-md font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 group overflow-hidden relative"
                >
                   COMPLETE INITIALIZATION <Rocket className="ml-2 w-4 h-4 group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform" />
                </Button>
                <div className="flex items-center gap-2">
                   <ShieldCheck className="h-4 w-4 text-emerald-500" />
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] opacity-40">SYSTEM_NODE: SHADCN-V2.4</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function TypeButton({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-6 rounded-xl border transition-all duration-300 group relative",
        selected
          ? "border-emerald-500 bg-emerald-50/50 shadow-md ring-1 ring-emerald-500/20"
          : "border-input bg-card hover:border-emerald-200 hover:bg-zinc-50/50 shadow-sm"
      )}
    >
      <div className={cn(
        "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
        selected ? "bg-emerald-500 text-white shadow-lg" : "bg-muted text-muted-foreground group-hover:bg-emerald-50 group-hover:text-emerald-500"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest",
        selected ? "text-emerald-700" : "text-muted-foreground group-hover:text-foreground"
      )}>
        {label}
      </span>
      {selected && (
        <div className="absolute top-2 right-2">
           <CheckCircle2 size={12} className="text-emerald-500" />
        </div>
      )}
    </button>
  );
}
