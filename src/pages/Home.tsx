import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  Receipt,
  Layers
} from "lucide-react";
import Button from "../components/ui/Button";

const LOGO_SRC = "/logo.png";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden theme-transition">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.05),transparent_70%)]" />

      {/* Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-12 animate-in fade-in zoom-in duration-1000">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4">
           <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-2xl shadow-emerald-500/20 relative group transition-transform duration-500 hover:scale-110">
              <img src={LOGO_SRC} alt="Invocraft" className="w-full h-full object-contain" />
              <div className="absolute -inset-1 bg-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
           <div className="flex flex-col items-center">
              <h1 className="text-4xl font-black text-white tracking-[0.4em] uppercase leading-none">INVOCRAFT</h1>
              <span className="text-emerald-500 font-black text-[10px] tracking-[0.6em] uppercase mt-2 opacity-80">Strategic Enterprise OS</span>
           </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-6 max-w-2xl">
           <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] uppercase">
              The Protocol for <span className="text-emerald-500">Commercial</span> Precision.
           </h2>
           <p className="text-zinc-400 text-lg font-medium tracking-tight max-w-xl mx-auto leading-relaxed">
              Initialize your fiscal ecosystem. Invocraft provides medical-grade registry controls for modern commerce and commercial settlement.
           </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-md pt-4">
           <Button 
            onClick={() => navigate("/auth/login")} 
            className="w-full h-16 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-500/20 group relative overflow-hidden"
           >
              INITIALIZE PROTOCOL <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-12">
           <Feature icon={<ShieldCheck size={18} />} label="AES-256 SEC" />
           <Feature icon={<Zap size={18} />} label="INSTANT_SYNC" />
           <Feature icon={<BarChart3 size={18} />} label="ANALYTICS" />
           <Feature icon={<Layers size={18} />} label="MODULAR_OS" />
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 text-[10px] font-black text-white/20 uppercase tracking-[0.5em] flex items-center gap-4">
         <span>STABLE_BUILD_V2.4</span>
         <div className="w-1 h-1 rounded-full bg-white/20" />
         <span>NODE_ACTIVE_CORE</span>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-500">
       <div className="text-emerald-500 mb-3 group-hover:scale-110 transition-transform">{icon}</div>
       <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-emerald-500 transition-colors">{label}</span>
    </div>
  );
}
