import { useNavigate } from "react-router-dom";
import { MoveLeft, ShieldAlert, Binary, SearchX } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000 overflow-hidden relative theme-transition">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />

      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center space-y-12 max-w-lg">
        
        {/* Error Badge */}
        <div className="flex flex-col items-center space-y-4">
           <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative group">
              <SearchX size={32} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1">
                 <div className="h-3 w-3 bg-emerald-500 rounded-full animate-ping" />
              </div>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-emerald-500 font-black text-[10px] tracking-[0.6em] uppercase opacity-80">PROTOCOL_EXCEPTION</span>
           </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-6">
           <h1 className="text-8xl md:text-9xl font-black text-white tracking-tighter tabular-nums leading-none">
              404
           </h1>
           <div className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Archive Node Not Found</h2>
              <p className="text-zinc-400 text-xs font-medium tracking-widest uppercase leading-relaxed max-w-xs mx-auto opacity-60">
                 The requested resource identifier has been nullified or relocated within the registry.
              </p>
           </div>
        </div>

        {/* CTA Section */}
        <div className="w-full max-w-[240px] pt-4">
           <Button 
            onClick={() => navigate("/dashboard")} 
            className="w-full h-14 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-emerald-500/10 group bg-white text-zinc-950 hover:bg-zinc-200"
           >
              <MoveLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> RE-ENTER DASHBOARD
           </Button>
        </div>

        {/* Tech Metadata */}
        <div className="flex items-center gap-6 pt-12 border-t border-white/5 w-full justify-center">
           <div className="flex items-center gap-2 opacity-30">
              <ShieldAlert size={14} className="text-white" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">ERR_Archive_Null</span>
           </div>
           <div className="flex items-center gap-2 opacity-30">
              <Binary size={14} className="text-white" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">IDX_Protocol_V2</span>
           </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">
         INVOCRAFT_REGISTRY_ERROR_SUBSYSTEM
      </div>
    </div>
  );
}
