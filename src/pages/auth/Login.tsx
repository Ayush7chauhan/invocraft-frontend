import { useState, useMemo } from "react";
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Layers,
  Fingerprint,
  Lock,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/card";
import Badge from "../../components/ui/Badge";
import { cn } from "../../lib/utils";

const LOGO_SRC = "/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidMobile = useMemo(() => {
    return /^[6-9]\d{9}$/.test(mobile);
  }, [mobile]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValidMobile) {
      setError("Enter a valid 10-digit mobile node identifier");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", { mobile });
      if (response.data.success) {
        navigate("/auth/otp", { state: { mobile } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication node unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left: Branding & Visuals (Desktop) */}
      <div className="hidden md:flex flex-1 relative bg-zinc-950 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 max-w-lg space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                 <img src={LOGO_SRC} alt="Invocraft" className="h-10 w-10 object-contain" />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-3xl font-black text-white tracking-widest uppercase tracking-[0.2em] leading-none">INVOCRAFT</h1>
                 <span className="text-emerald-500 font-black text-[10px] tracking-[0.4em] uppercase mt-1.5 opacity-80">Enterprise Logic Engine</span>
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-5xl font-black text-white tracking-tighter leading-[1.1]">Strategic Monetary Governance.</h2>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md">
                 Orchestrate your business lifecycle with surgical precision. 
                 A unified protocol for settlement, inventory, and network intelligence.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-6 pt-12 border-t border-zinc-800">
              <div className="space-y-1">
                 <p className="text-white font-black tracking-widest text-[11px] uppercase">Active Nodes</p>
                 <p className="text-zinc-500 text-sm">24,000+ Enterprises</p>
              </div>
              <div className="space-y-1">
                 <p className="text-white font-black tracking-widest text-[11px] uppercase">Compliance</p>
                 <p className="text-zinc-500 text-sm">SEC-256 Encrypted</p>
              </div>
           </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 p-24 opacity-10">
           <Layers size={400} className="text-emerald-500" />
        </div>
      </div>

      {/* Right: Login Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        {/* Mobile Header */}
        <div className="md:hidden absolute top-8 left-8 flex items-center gap-3">
           <div className="h-8 w-8 rounded-lg bg-zinc-950 flex items-center justify-center">
              <img src={LOGO_SRC} alt="L" className="h-5 w-5 invert" />
           </div>
           <span className="font-black text-xs uppercase tracking-[0.2em] text-foreground">INVOCRAFT</span>
        </div>

        <div className="w-full max-w-sm space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="space-y-3 text-center md:text-left">
              <Badge variant="outline" className="text-[9px] font-black h-5 px-3 uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100">AUTHENTICATION GATEWAY</Badge>
              <h3 className="text-3xl font-black text-foreground tracking-tighter">Initialize Session</h3>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">System will dispatch a single-use verification token to your mobile node.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-8 pt-4">
              <div className="space-y-1.5 overflow-visible">
                 <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-0.5">Primary Mobile Identifier</label>
                 <div className="relative group">
                    <Input 
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value.replace(/\D/g, ""));
                        setError("");
                      }}
                      placeholder="98XXXXXXXX"
                      className="h-14 text-lg font-bold tracking-widest focus:ring-emerald-500 transition-all shadow-md group-hover:border-emerald-200"
                      leftIcon={<Phone size={18} className="text-muted-foreground/40 group-focus-within:text-emerald-500 transition-colors" />}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">IN +91</span>
                    </div>
                 </div>
                 {error && <p className="text-[10px] font-black text-destructive uppercase tracking-widest mt-2 ml-1 animate-pulse">{error}</p>}
              </div>

              <Button 
                type="submit" 
                isLoading={loading}
                disabled={!isValidMobile}
                className="w-full h-14 rounded-md font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 group overflow-hidden relative"
              >
                 <span className="relative z-10 flex items-center gap-2">
                    DISPATCH TOKEN <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </span>
              </Button>
           </form>

           <div className="grid grid-cols-3 gap-3 pt-10">
              {[
                { icon: Fingerprint, label: "SECURE" },
                { icon: ShieldCheck, label: "VERIFIED" },
                { icon: Globe, label: "GLOBAL" }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 group hover:bg-white hover:border-emerald-200 transition-all duration-300 shadow-sm">
                   <feature.icon size={20} className="text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
                   <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest group-hover:text-foreground">{feature.label}</span>
                </div>
              ))}
           </div>

           <div className="pt-8 text-center">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-loose">
                 By initializing, you accept the <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer">Security Protocol Bundle</span> and <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer">Privacy Legislation</span>.
              </p>
           </div>
        </div>

        {/* Footer Credit */}
        <div className="absolute bottom-8 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-30">
           CORE_ENGINE: INVOCRAFT_V2-STABLE
        </div>
      </div>
    </div>
  );
}
