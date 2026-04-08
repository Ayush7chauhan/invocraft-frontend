import { XOctagon, RefreshCcw, Home, CloudOff, Terminal } from "lucide-react";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000 overflow-hidden relative theme-transition">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.05),transparent_70%)]" />

      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center space-y-12 max-w-lg">
        
        {/* Error Badge */}
        <div className="flex flex-col items-center space-y-4">
           <div className="h-24 w-24 rounded-2xl bg-white/5 border border-rose-500/20 flex items-center justify-center shadow-3xl relative group">
              <CloudOff size={40} className="text-rose-500 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1">
                 <div className="h-3 w-3 bg-rose-500 rounded-full animate-ping" />
              </div>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-rose-500 font-black text-[10px] tracking-[0.6em] uppercase opacity-80">CRITICAL_SYSTEM_INTERRUPT</span>
           </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-6">
           <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
              Registry <br/><span className="text-rose-500">Node Offline</span>
           </h1>
           <div className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter opacity-80">500 Server Exception</h2>
              <p className="text-zinc-400 text-[10px] font-medium tracking-widest uppercase leading-relaxed max-w-xs mx-auto opacity-60">
                 The enterprise registry cluster encountered an internal synchronisation failure. Core datasets remain protected.
              </p>
           </div>
        </div>

        {/* CTA Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md pt-4">
           <Button 
            onClick={() => navigate(0)} 
            className="h-14 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-rose-500/10 group bg-white text-zinc-950 hover:bg-zinc-200"
           >
              <RefreshCcw className="mr-2 w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> RE-INIT_PROTOCOL
           </Button>
           <Button 
            onClick={() => navigate("/")} 
            variant="outline"
            className="h-14 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] border-white/10 text-white hover:bg-white/5"
           >
              <Home className="mr-2 w-4 h-4" /> CORE_ENTRY
           </Button>
        </div>

        {/* Tech Metadata */}
        <div className="flex items-center gap-6 pt-12 border-t border-white/5 w-full justify-center">
           <div className="flex items-center gap-2 opacity-30">
              <XOctagon size={14} className="text-white" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">SYS_INTERRUPT_500</span>
           </div>
           <div className="flex items-center gap-2 opacity-30">
              <Terminal size={14} className="text-white" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">LOG_DUMP_AVAIL</span>
           </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">
         INVOCRAFT_SENTRY_MONITOR_STABLE
      </div>
    </div>
  );
}
